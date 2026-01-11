import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { BitcoinData, KPIData } from '@/types/database';
import { generateMockData } from '@/lib/mockData';

interface UseBitcoinDataReturn {
    data: BitcoinData[];
    latestData: BitcoinData | null;
    kpiData: KPIData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useBitcoinData(limit?: number): UseBitcoinDataReturn {
    const [data, setData] = useState<BitcoinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!isSupabaseConfigured) {
            // Use mock data in demo mode
            const mockData = generateMockData(limit || 365);
            setData(mockData);
            setLoading(false);
            return;
        }

        try {
            let query = supabase
                .from('bitcoin_data')
                .select('*')
                .order('date', { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            const { data: fetchedData, error: fetchError } = await query;

            if (fetchError) {
                throw fetchError;
            }

            // Reverse to get chronological order
            setData((fetchedData || []).reverse());
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            // Fallback to mock data on error
            const mockData = generateMockData(limit || 365);
            setData(mockData);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchData();

        if (!isSupabaseConfigured) {
            return;
        }

        // Set up realtime subscription
        const channel = supabase
            .channel('bitcoin_data_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bitcoin_data',
                },
                (payload) => {
                    console.log('Realtime update:', payload);

                    if (payload.eventType === 'INSERT') {
                        setData((prev) => {
                            const newRow = payload.new as BitcoinData;
                            // Add new row and keep chronological order
                            return [...prev, newRow].sort(
                                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                            );
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setData((prev) =>
                            prev.map((row) =>
                                row.id === (payload.new as BitcoinData).id
                                    ? (payload.new as BitcoinData)
                                    : row
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setData((prev) =>
                            prev.filter((row) => row.id !== (payload.old as BitcoinData).id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    // Get latest data point
    const latestData = data.length > 0 ? data[data.length - 1] : null;
    const previousData = data.length > 1 ? data[data.length - 2] : null;

    // Calculate KPI data
    const kpiData: KPIData | null = latestData
        ? {
            price: latestData.close,
            priceChange: previousData ? latestData.close - previousData.close : 0,
            priceChangePercent: previousData
                ? ((latestData.close - previousData.close) / previousData.close) * 100
                : 0,
            rsi: latestData.rsi || 50,
            drawdown: latestData.drawdown_pct || 0,
            trend:
                latestData.sma_200 && latestData.close > latestData.sma_200
                    ? 'bullish'
                    : 'bearish',
            sma50: latestData.sma_50 || latestData.close,
            sma200: latestData.sma_200 || latestData.close,
            bbUpper: latestData.bb_upper || latestData.close,
            bbLower: latestData.bb_lower || latestData.close,
        }
        : null;

    return {
        data,
        latestData,
        kpiData,
        loading,
        error,
        refetch: fetchData,
    };
}
