import { useCryptoData } from '@/hooks/useBitcoinData';
import { MACDChart } from '@/components/charts/MACDChart';
import { FibRetracementChart } from '@/components/charts/FibRetracementChart';
import { OBVChart } from '@/components/charts/OBVChart';
import { VolumeProfileChart } from '@/components/charts/VolumeProfileChart';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, TrendingUp, Layers, BarChart2, Activity } from 'lucide-react';
import { useState } from 'react';
import { YearFilter } from '@/components/ui/YearFilter';
import { CoinSelector } from '@/components/ui/CoinSelector';

export function Architect() {
    const [selectedYear, setSelectedYear] = useState<string | number>('ALL');
    const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'ETH'>('BTC');
    
    const { data, loading } = useCryptoData({ 
        year: selectedYear, 
        limit: selectedYear === 'ALL' ? undefined : undefined,
        coin: selectedCoin
    });

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-purple-500/10 p-3">
                        <Compass className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">The Architect</h1>
                        <p className="text-sm text-slate-400">Advanced Pattern Recognition</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CoinSelector selectedCoin={selectedCoin} onChange={setSelectedCoin} />
                    <YearFilter 
                        selectedYear={selectedYear} 
                        onChange={setSelectedYear} 
                        startYear={selectedCoin === 'BTC' ? 2014 : 2015}
                    />
                </div>
            </div>

            {/* Row 1: Momentum (MACD) */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm px-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-slate-300">Momentum Structure</span>
                </div>
                <MACDChart data={data} height={300} />
            </div>

            {/* Row 2: Structure (Fibonacci + Volume Profile) */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Fibonacci (2/3) */}
                <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm px-1">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-slate-300">Retracement Levels</span>
                    </div>
                    <FibRetracementChart data={data} height={400} />
                </div>

                {/* Volume Profile (1/3) */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm px-1">
                        <BarChart2 className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-slate-300">Volume Profile (VPVR)</span>
                    </div>
                    <VolumeProfileChart data={data} height={400} />
                </div>
            </div>

            {/* Row 3: Smart Money Flow (OBV) */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm px-1">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-slate-300">Smart Money Flow (OBV)</span>
                </div>
                <OBVChart data={data} height={300} />
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-4 text-xs text-slate-400">
                        <strong className="text-slate-300">Signal:</strong> Divergence between Price and OBV often precedes a reversal. If Price is making Lower Lows but OBV is making Higher Lows, accumulation is occurring.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
