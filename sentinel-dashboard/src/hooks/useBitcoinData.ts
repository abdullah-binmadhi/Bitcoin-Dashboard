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
    coin?: 'BTC' | 'ETH';
}

export function useCryptoData(options: UseCryptoDataOptions = {}): UseCryptoDataReturn {
    const { limit, year, coin = 'BTC' } = options;
    const [data, setData] = useState<BitcoinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const tableName = coin === 'ETH' ? 'ethereum_data' : 'bitcoin_data';

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        console.log('Fetching Data with:', { year, limit, coin, isConfigured: isSupabaseConfigured });

        if (!isSupabaseConfigured) {
            // Use mock data in demo mode
            // Generate 15 years of history to cover 2014-2029
            let mockData = generateMockData(365 * 15); 
            
            // Apply filtering
            if (year && year !== 'ALL') {
                const yearStr = year.toString();
                mockData = mockData.filter(d => d.date.startsWith(yearStr));
            } else if (limit && !year) {
                mockData = mockData.slice(-limit);
            }

            // Simulate different prices for ETH (just divide by 20 for mock)
            if (coin === 'ETH') {
                mockData = mockData.map(d => ({
                    ...d,
                    close: d.close / 20,
                    high: d.high / 20,
                    low: d.low / 20,
                    open: d.open / 20,
                    sma_50: d.sma_50 ? d.sma_50 / 20 : null,
                    sma_200: d.sma_200 ? d.sma_200 / 20 : null,
                    bb_upper: d.bb_upper ? d.bb_upper / 20 : null,
                    bb_lower: d.bb_lower ? d.bb_lower / 20 : null,
                }));
            }
            
            // Sort appropriately for chart (oldest first)
            mockData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setData(mockData);
            setLoading(false);
            return;
        }

        try {
            let allData: BitcoinData[] = [];
            
            if (year === 'ALL') {
                // Fetch in chunks to bypass 1000-row limit
                const PAGE_SIZE = 1000;
                let from = 0;
                let hasMore = true;

                while (hasMore) {
                    const { data: chunk, error: chunkError } = await supabase
                        .from(tableName)
                        .select('*')
                        .order('date', { ascending: false })
                        .range(from, from + PAGE_SIZE - 1);

                    if (chunkError) {
                        console.error("Supabase Pagination Error:", chunkError);
                        throw chunkError;
                    }

                    if (chunk) {
                        allData = [...allData, ...chunk];
                        if (chunk.length < PAGE_SIZE) {
                            hasMore = false;
                        } else {
                            from += PAGE_SIZE;
                        }
                    } else {
                        hasMore = false;
                    }
                }
            } else {
                // Standard fetch for specific year/limit
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
                
                if (fetchError) {
                    console.error("Supabase Query Error:", fetchError);
                    throw fetchError;
                }
                allData = fetchedData || [];
            }

            // Database returns descending (newest first), reverse for Chart (oldest first)
            setData(allData.reverse() as BitcoinData[]);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            const mockData = generateMockData(limit || 365); // Fallback
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
