import { useCryptoData } from '@/hooks/useBitcoinData';
import { MACDChart } from '@/components/charts/MACDChart';
import { FibRetracementChart } from '@/components/charts/FibRetracementChart';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, GitMerge, TrendingUp, Layers } from 'lucide-react';
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
                        <p className="text-sm text-slate-400">Advanced Structure & Momentum</p>
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

            {/* Analysis Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* MACD Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>Momentum Oscillator</span>
                    </div>
                    <MACDChart data={data} />
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-4 text-xs text-slate-400">
                            <strong className="text-slate-300">Interpretation:</strong> When the MACD line (Blue) crosses above the Signal line (Orange), it's a bullish signal. A cross below indicates bearish momentum. The Histogram shows the strength of the move.
                        </CardContent>
                    </Card>
                </div>

                {/* Fibonacci Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Layers className="h-4 w-4" />
                        <span>Structural Levels</span>
                    </div>
                    <FibRetracementChart data={data} />
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-4 text-xs text-slate-400">
                            <strong className="text-slate-300">Key Levels:</strong> The <span className="text-blue-400">61.8%</span> level ("Golden Ratio") is often a critical support/resistance zone. Use these lines to identify potential reversal points during corrections.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
