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
        <div className="flex flex-col gap-4 h-[calc(100vh-6rem)] max-w-[1920px] mx-auto overflow-hidden">
            {/* Page Header & Top Stats */}
            <div className="flex-shrink-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2">
                            <OrbitIcon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">Orbit</h1>
                            <p className="text-xs text-slate-400">Executive Overview</p>
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

                <KPIGrid kpiData={kpiData} />
            </div>

            {/* Main Content Area - Grows to fill screen */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: Chart & Tech Stats */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
                    {/* Chart Container - Grows */}
                    <Card className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-950 border-slate-800">
                        <div className="flex-1 min-h-0">
                            <PriceChart 
                                data={data} 
                                title={`${selectedCoin} Price Action ${selectedYear === 'ALL' ? "(Last 365 Days)" : `(${selectedYear})`}`} 
                                height="100%" 
                            />
                        </div>
                    </Card>

                    {/* Tech & Range Stats - Fixed Height */}
                    <div className="flex-shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4 h-24">
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
                            value={latest?.sma_200 ? (latest.close > latest.sma_200 ? 'Bullish' : 'Bearish') : 'N/A'}
                            status="Long Term"
                            icon={<TrendingUp className="h-4 w-4" />}
                            color={latest?.sma_200 ? (latest.close > latest.sma_200 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}
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

                {/* Right Column: Activity, Volume & History Stats */}
                <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0">
                    {/* Recent Activity - Takes most space */}
                    <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-slate-800 bg-card text-card-foreground shadow">
                        <RecentActivity data={data} limit={20} maxHeight={9999} />
                    </div>

                    {/* Compact Volume Card */}
                    <Card className="flex-shrink-0 p-4 bg-slate-900/50 border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs text-slate-500">24h Volume</p>
                                <p className="text-xl font-bold text-slate-100">
                                    ${(latest?.volume / 1e9).toFixed(1)}B
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Avg Volume</p>
                                <p className="text-sm font-medium text-blue-400">
                                    ${data.length > 0 ? (data.reduce((sum, d) => sum + d.volume, 0) / data.length / 1e9).toFixed(1) : '0'}B
                                </p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                            <p className="text-xs text-slate-400">Liquidity Status</p>
                            <p className="text-xs text-emerald-500 font-medium">High (Optimal)</p>
                        </div>
                    </Card>

                    {/* Compact Period Stats */}
                    <div className="flex-shrink-0 grid grid-cols-2 gap-4 h-20">
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
                    </div>
                </div>
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
