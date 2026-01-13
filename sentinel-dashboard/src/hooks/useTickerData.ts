import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TickerItem {
    symbol: string;
    price: number;
    changePercent: number;
}

const COINS = [
    { symbol: 'BTC', table: 'bitcoin_data' },
    { symbol: 'ETH', table: 'ethereum_data' },
    { symbol: 'SOL', table: 'solana_data' },
    { symbol: 'XRP', table: 'xrp_data' },
];

export function useTickerData() {
    const [tickerData, setTickerData] = useState<TickerItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicker = async () => {
            if (!isSupabaseConfigured) {
                // Mock data for demo mode
                setTickerData([
                    { symbol: 'BTC', price: 92953.87, changePercent: 2.35 },
                    { symbol: 'ETH', price: 3450.12, changePercent: -1.2 },
                    { symbol: 'SOL', price: 145.67, changePercent: 5.4 },
                    { symbol: 'XRP', price: 0.62, changePercent: 0.8 },
                ]);
                setLoading(false);
                return;
            }

            try {
                const results = await Promise.all(
                    COINS.map(async ({ symbol, table }) => {
                        const { data } = await supabase
                            .from(table)
                            .select('close') 
                            .order('date', { ascending: false })
                            .limit(2);

                        if (!data || data.length === 0) return null;
                        
                        const current = data[0] as { close: number };
                        const prev = (data[1] || data[0]) as { close: number };
                        const changePercent = ((current.close - prev.close) / prev.close) * 100;

                        return {
                            symbol,
                            price: current.close,
                            changePercent
                        };
                    })
                );

                setTickerData(results.filter((i): i is TickerItem => i !== null));
            } catch (err) {
                console.error('Ticker fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicker();
        // Poll every 60s
        const interval = setInterval(fetchTicker, 60000);
        return () => clearInterval(interval);
    }, []);

    return { tickerData, loading };
}
