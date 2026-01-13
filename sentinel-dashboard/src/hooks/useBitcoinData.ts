import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { BitcoinData, KPIData } from '@/types/database';
import { generateMockData } from '@/lib/mockData';

interface UseCryptoDataReturn {
    data: BitcoinData[];
    latestData: BitcoinData | null;
    kpiData: KPIData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface UseCryptoDataOptions {
    limit?: number;
    year?: string | number;
    coin?: 'BTC' | 'ETH' | 'XRP' | 'SOL';
}

export function useCryptoData(options: UseCryptoDataOptions = {}): UseCryptoDataReturn {
    const { limit, year, coin = 'BTC' } = options;
    const [data, setData] = useState<BitcoinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getTableName = (c: string) => {
        switch (c) {
            case 'ETH': return 'ethereum_data';
            case 'XRP': return 'xrp_data';
            case 'SOL': return 'solana_data';
            default: return 'bitcoin_data';
        }
    };

    const tableName = getTableName(coin);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        console.log('Fetching Data with:', { year, limit, coin, tableName, isConfigured: isSupabaseConfigured });

        if (!isSupabaseConfigured) {
            // Use mock data in demo mode
            let mockData = generateMockData(365 * 15); 
            
            // Apply filtering
            if (year && year !== 'ALL') {
                const yearStr = year.toString();
                mockData = mockData.filter(d => d.date.startsWith(yearStr));
            } else if (limit && !year) {
                mockData = mockData.slice(-limit);
            }

            // Simple price simulation for different coins
            const dividers: Record<string, number> = { 'ETH': 20, 'XRP': 60000, 'SOL': 400 };
            const div = dividers[coin] || 1;

            if (div !== 1) {
                mockData = mockData.map(d => ({
                    ...d,
                    close: d.close / div,
                    high: d.high / div,
                    low: d.low / div,
                    open: d.open / div,
                    sma_50: d.sma_50 ? d.sma_50 / div : null,
                    sma_200: d.sma_200 ? d.sma_200 / div : null,
                    bb_upper: d.bb_upper ? d.bb_upper / div : null,
                    bb_lower: d.bb_lower ? d.bb_lower / div : null,
                }));
            }
            
            mockData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setData(mockData);
            setLoading(false);
            return;
        }

        try {
            let allData: BitcoinData[] = [];
            
            if (year === 'ALL') {
                // ... (Pagination Logic remains same)
                const PAGE_SIZE = 1000;
                let from = 0;
                let hasMore = true;

                while (hasMore) {
                    const { data: chunk, error: chunkError } = await supabase
                        .from(tableName)
                        .select('*')
                        .order('date', { ascending: false })
                        .range(from, from + PAGE_SIZE - 1);

                    if (chunkError) throw chunkError;

                    if (chunk && chunk.length > 0) {
                        allData = [...allData, ...chunk];
                        if (chunk.length < PAGE_SIZE) hasMore = false;
                        else from += PAGE_SIZE;
                    } else {
                        hasMore = false;
                    }
                }
            } else {
                let query = supabase
                    .from(tableName)
                    .select('*')
                    .order('date', { ascending: false });

                if (year) {
                    const startDate = `${year}-01-01`;
                    const endDate = `${year}-12-31`;
                    query = query.gte('date', startDate).lte('date', endDate);
                } else if (limit) {
                    query = query.limit(limit);
                }

                const { data: fetchedData, error: fetchError } = await query;
                if (fetchError) throw fetchError;
                allData = fetchedData || [];
            }

            setData(allData.reverse() as BitcoinData[]);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            const mockData = generateMockData(limit || 365);
            setData(mockData);
        } finally {
            setLoading(false);
        }
    }, [limit, year, tableName, coin]);

    useEffect(() => {
        fetchData();

        if (!isSupabaseConfigured) {
            return;
        }

        const channel = supabase
            .channel(`${tableName}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: tableName,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setData((prev) => {
                            const newRow = payload.new as BitcoinData;
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
    }, [fetchData, tableName]);

    // ... Rest of calculations (KPIs) remain generic ...
    const latestData = data.length > 0 ? data[data.length - 1] : null;
    const previousData = data.length > 1 ? data[data.length - 2] : null;

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
