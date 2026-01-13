import { useCryptoData } from '@/hooks/useBitcoinData';
import { KPIGrid } from '@/components/cards/KPICard';
import { RecentActivity } from '@/components/cards/RecentActivity';
import { PriceChart } from '@/components/charts/PriceChart';
import { Orbit as OrbitIcon, TrendingUp, Activity, Waves, MoveVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { YearFilter } from '@/components/ui/YearFilter';
import { CoinSelector } from '@/components/ui/CoinSelector';

export function Orbit() {
    const [selectedYear, setSelectedYear] = useState<string | number>('ALL');
    const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'ETH'>('BTC');
    
    const { data, kpiData, loading } = useCryptoData({ 
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

    const latest = data[data.length - 1];

    return (
        <div className="space-y-6 max-w-[1920px] mx-auto pb-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-2.5">
                        <OrbitIcon className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Orbit</h1>
                        <p className="text-sm text-slate-400">Executive Overview</p>
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

            {/* Top Level KPIs */}
            <KPIGrid kpiData={kpiData} />

            {/* Main Visual Story: Price Action vs Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Hero Chart (Takes 3/4 space on large screens) */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="p-1 bg-slate-950 border-slate-800 shadow-xl">
                        <div className="p-4 border-b border-slate-800/50">
                            <h3 className="font-semibold text-slate-200">Price Action Analysis</h3>
                        </div>
                        <div className="p-2">
                            <PriceChart 
                                data={data} 
                                title="" 
                                height={450} 
                            />
                        </div>
                    </Card>

                    {/* Secondary Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <TechCard
                            title="RSI Momentum"
                            value={latest?.rsi?.toFixed(1) || 'N/A'}
                            status={latest?.rsi ? (latest.rsi > 70 ? 'Overbought' : latest.rsi < 30 ? 'Oversold' : 'Neutral') : '-'}
                            icon={<Activity className="h-4 w-4" />}
                            color="text-blue-500"
                        />
                        <TechCard
                            title="Bollinger Volatility"
                            value={latest?.bb_upper && latest?.bb_lower ? (((latest.bb_upper - latest.bb_lower) / latest.close) * 100).toFixed(1) + '%' : 'N/A'}
                            status="Band Width"
                            icon={<Waves className="h-4 w-4" />}
                            color="text-purple-500"
                        />
                        <TechCard
                            title="Trend Direction"
                            value={latest?.sma_200 ? (latest.close > latest.sma_200 ? 'Bullish' : 'Bearish') : 'N/A'}
                            status="vs SMA 200"
                            icon={<TrendingUp className="h-4 w-4" />}
                            color={latest?.sma_200 ? (latest.close > latest.sma_200 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}
                        />
                        <TechCard
                            title="Daily Range"
                            value={latest ? ((latest.high - latest.low) / latest.low * 100).toFixed(2) + '%' : 'N/A'}
                            status="Intraday Vol"
                            icon={<MoveVertical className="h-4 w-4" />}
                            color="text-amber-500"
                        />
                    </div>
                </div>

                {/* Sidebar: Activity & Volume (Takes 1/4 space) */}
                <div className="lg:col-span-1 space-y-6 flex flex-col">
                    {/* Activity Feed */}
                    <div className="flex-1 min-h-[400px]">
                        <RecentActivity data={data} limit={15} maxHeight={600} />
                    </div>

                    {/* Volume Snapshot */}
                    <Card className="p-5 bg-slate-900/50 border-slate-800">
                        <h3 className="text-sm font-medium text-slate-400 mb-4">Volume Profile</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-3xl font-bold text-slate-100">
                                    ${(latest?.volume / 1e9).toFixed(1)}B
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {selectedYear === 'ALL' ? '24h Trading Volume' : `Avg Vol (${selectedYear})`}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Footer Stats: Historical Context */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <StatCard
                    label={selectedYear === 'ALL' ? "52W High" : `${selectedYear} High`}
                    value={`$${data.length > 0 ? Math.max(...data.map((d) => d.high)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}`}
                    subtext="Period Max"
                    color="text-emerald-500"
                />
                <StatCard
                    label={selectedYear === 'ALL' ? "52W Low" : `${selectedYear} Low`}
                    value={`$${data.length > 0 ? Math.min(...data.map((d) => d.low)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}`}
                    subtext="Period Min"
                    color="text-rose-500"
                />
                <StatCard
                    label="Avg Volume"
                    value={`$${data.length > 0 ? (data.reduce((sum, d) => sum + d.volume, 0) / data.length / 1e9).toFixed(1) : '0'}B`}
                    subtext="Daily Avg"
                    color="text-blue-500"
                />
                <StatCard
                    label="Data Points"
                    value={`${data.length}`}
                    subtext="Trading Days"
                    color="text-slate-400"
                />
            </div>
        </div>
    );
}

function TechCard({ title, value, status, icon, color }: { title: string, value: string, status: string, icon: React.ReactNode, color: string }) {
    return (
        <Card className="p-4 bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                {icon}
                <span className="text-xs font-medium">{title}</span>
            </div>
            <div className="text-xl font-bold text-slate-100">{value}</div>
            <div className={`text-xs ${color} font-medium mt-1`}>{status}</div>
        </Card>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    subtext: string;
    color: string;
}

function StatCard({ label, value, subtext, color }: StatCardProps) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold ${color} tabular-nums mt-1`}>{value}</p>
            <p className="text-xs text-slate-400">{subtext}</p>
        </div>
    );
}