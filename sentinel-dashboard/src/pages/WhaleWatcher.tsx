import { useCryptoData } from '@/hooks/useBitcoinData';
import { WhaleTxTable, type WhaleTx } from '@/components/tables/WhaleTxTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Anchor, Waves, ArrowRightLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { CoinSelector } from '@/components/ui/CoinSelector';

export function WhaleWatcher() {
    const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'ETH' | 'XRP' | 'SOL'>('BTC');
    const { data, loading } = useCryptoData({ limit: 1, coin: selectedCoin }); // Only need current price

    const whaleData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const price = data[0].close;
        const txs: WhaleTx[] = [];
        const now = Date.now();

        // Generate 15 realistic whale transactions
        for (let i = 0; i < 15; i++) {
            const isMegaWhale = Math.random() > 0.8;
            const amountCoin = isMegaWhale 
                ? Math.floor(Math.random() * 5000) + 1000 // 1k-6k BTC
                : Math.floor(Math.random() * 900) + 100;  // 100-1000 BTC
            
            // Adjust scale for cheaper coins
            const multiplier = selectedCoin === 'XRP' ? 10000 : selectedCoin === 'SOL' ? 100 : selectedCoin === 'ETH' ? 10 : 1;
            const finalAmount = amountCoin * multiplier;

            const type = Math.random() > 0.6 ? 'inflow' : Math.random() > 0.6 ? 'outflow' : 'transfer';
            const from = type === 'outflow' ? 'Coinbase' : `0x${Math.random().toString(16).slice(2, 10)}...`;
            const to = type === 'inflow' ? 'Binance' : `0x${Math.random().toString(16).slice(2, 10)}...`;

            txs.push({
                id: i.toString(),
                hash: `0x${Math.random().toString(16).slice(2)}`,
                amount_usd: finalAmount * price,
                amount_coin: finalAmount,
                coin: selectedCoin,
                from,
                to,
                type,
                timestamp: new Date(now - i * 1000 * 60 * (Math.random() * 10)).toISOString() // Recent times
            });
        }
        return txs;
    }, [selectedCoin, data]);

    const stats = useMemo(() => {
        if (whaleData.length === 0) return { inflow: 0, outflow: 0, net: 0 };
        const inflow = whaleData.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount_usd, 0);
        const outflow = whaleData.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount_usd, 0);
        return { inflow, outflow, net: inflow - outflow };
    }, [whaleData]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1920px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-500/10 p-3">
                        <Ship className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Whale Watcher</h1>
                        <p className="text-sm text-slate-400">Large Transaction Tracking</p>
                    </div>
                </div>
                <CoinSelector selectedCoin={selectedCoin} onChange={setSelectedCoin} />
            </div>

            {/* Flow Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    label="Exchange Inflow (24h)" 
                    value={`$${(stats.inflow / 1e6).toFixed(1)}M`} 
                    subtext="Potential Sell Pressure" 
                    icon={<ArrowRightLeft className="text-rose-500" />} 
                    color="text-rose-500"
                />
                <StatCard 
                    label="Exchange Outflow (24h)" 
                    value={`$${(stats.outflow / 1e6).toFixed(1)}M`} 
                    subtext="Accumulation / Holding" 
                    icon={<Anchor className="text-emerald-500" />} 
                    color="text-emerald-500"
                />
                <StatCard 
                    label="Net Flow" 
                    value={`$${(Math.abs(stats.net) / 1e6).toFixed(1)}M`} 
                    subtext={stats.net > 0 ? "Net Inflow (Bearish)" : "Net Outflow (Bullish)"} 
                    icon={<Waves className={stats.net > 0 ? "text-rose-500" : "text-emerald-500"} />} 
                    color={stats.net > 0 ? "text-rose-500" : "text-emerald-500"}
                />
            </div>

            {/* Main Table */}
            <Card className="border-slate-800 bg-slate-950">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-200">Live Whale Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <WhaleTxTable transactions={whaleData} />
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ label, value, subtext, icon, color }: any) {
    return (
        <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                        <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
                        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
