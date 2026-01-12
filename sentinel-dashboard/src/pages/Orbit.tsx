import { useBitcoinData } from '@/hooks/useBitcoinData';
import { KPIGrid } from '@/components/cards/KPICard';
import { RecentActivity } from '@/components/cards/RecentActivity';
import { PriceChart } from '@/components/charts/PriceChart';
import { Orbit as OrbitIcon, TrendingUp, Activity, Waves, MoveVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { YearFilter } from '@/components/ui/YearFilter';

export function Orbit() {
    const [selectedYear, setSelectedYear] = useState<string | number>('ALL');
    const { data, kpiData, loading } = useBitcoinData({ year: selectedYear, limit: selectedYear === 'ALL' ? undefined : undefined });

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    const latest = data[data.length - 1];

    return (
        <div className="space-y-3 max-w-[1920px] mx-auto">
            {/* Page Header - Compact with Year Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-2">
                        <OrbitIcon className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">Orbit</h1>
                        <p className="text-xs text-slate-400">Executive Overview</p>
                    </div>
                </div>

                {/* Year Selector */}
                <YearFilter selectedYear={selectedYear} onChange={setSelectedYear} />
            </div>

            {/* KPI Grid - Top Stats */}
            <KPIGrid kpiData={kpiData} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-start">
                {/* Price Chart - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-4 flex flex-col h-full">
                    <div className="flex-1">
                        <PriceChart 
                            data={data} 
                            title={selectedYear === 'ALL' ? "Bitcoin Price Action (Last 365 Days)" : `Bitcoin Price Action (${selectedYear})`} 
                            height={500} 
                        />
                    </div>

                    {/* Technical Analysis Grid - Fills space below chart */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <TechCard
                            title="RSI (14)"
                            value={latest?.rsi?.toFixed(2) || 'N/A'}
                            status={latest?.rsi ? (latest.rsi > 70 ? 'Overbought' : latest.rsi < 30 ? 'Oversold' : 'Neutral') : '-'}
                            icon={<Activity className="h-4 w-4" />}
                            color="text-blue-500"
                        />
                        <TechCard
                            title="Bollinger Width"
                            value={latest?.bb_upper && latest?.bb_lower ? (((latest.bb_upper - latest.bb_lower) / latest.close) * 100).toFixed(2) + '%' : 'N/A'}
                            status="Volatility"
                            icon={<Waves className="h-4 w-4" />}
                            color="text-purple-500"
                        />
                        <TechCard
                            title="SMA Trend"
                            value={latest?.close > (latest?.sma_200 || 0) ? 'Bullish' : 'Bearish'}
                            status="Long Term"
                            icon={<TrendingUp className="h-4 w-4" />}
                            color={latest?.close > (latest?.sma_200 || 0) ? 'text-emerald-500' : 'text-rose-500'}
                        />
                        <TechCard
                            title="Daily Range"
                            value={latest ? ((latest.high - latest.low) / latest.low * 100).toFixed(2) + '%' : 'N/A'}
                            status="Volatility"
                            icon={<MoveVertical className="h-4 w-4" />}
                            color="text-amber-500"
                        />
                    </div>
                </div>

                {/* Right Column: Activity & Volume Stats */}
                <div className="lg:col-span-1 space-y-3 flex flex-col self-stretch">
                    <RecentActivity data={data} limit={14} maxHeight={550} />

                    {/* Additional Volume Stat - Compact without chart */}
                    <Card className="p-5 bg-slate-900/50 border-slate-800">
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-4">Volume Analysis</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-3xl font-bold text-slate-100">
                                        ${(latest?.volume / 1e9).toFixed(1)}B
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {selectedYear === 'ALL' ? '24h Trading Volume' : `Avg Volume (${selectedYear})`}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-800/50">
                                    <p className="text-sm font-medium text-slate-300">Market Liquidity</p>
                                    <p className="text-xs text-emerald-500 mt-1">High (Optimal)</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Stats Row - Compact */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                    label="Dataset"
                    value={`${data.length} Days`}
                    subtext="History"
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
            <div className="text-lg font-bold text-slate-100">{value}</div>
            <div className={`text-xs ${color} font-medium`}>{status}</div>
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
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={`text-lg font-bold ${color} tabular-nums mt-0.5`}>{value}</p>
            <p className="text-[10px] text-slate-400">{subtext}</p>
        </div>
    );
}
