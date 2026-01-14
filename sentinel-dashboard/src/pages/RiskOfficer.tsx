import { useCryptoData } from '@/hooks/useBitcoinData';
import { DrawdownChart } from '@/components/charts/DrawdownChart';
import { HistogramChart } from '@/components/charts/HistogramChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { formatPercent } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { YearFilter } from '@/components/ui/YearFilter';
import { CoinSelector } from '@/components/ui/CoinSelector';

export function RiskOfficer() {
    const [selectedYear, setSelectedYear] = useState<string | number>('ALL');
    const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'ETH' | 'XRP' | 'SOL'>('BTC');
    
    const { data, latestData, loading } = useCryptoData({ 
        year: selectedYear, 
        limit: selectedYear === 'ALL' ? undefined : undefined,
        coin: selectedCoin
    });

    const getStartYear = (coin: string) => {
        if (coin === 'SOL') return 2020;
        if (coin === 'ETH') return 2015;
        return 2014;
    };

    // Calculate risk metrics
    const riskMetrics = useMemo(() => {
        if (data.length < 2) return null;

        // Daily returns
        const returns: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const pctChange = ((data[i].close - data[i - 1].close) / data[i - 1].close) * 100;
            returns.push(pctChange);
        }

        // Volatility (standard deviation of returns)
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance);
        const annualizedVolatility = volatility * Math.sqrt(365);

        // Max drawdown
        const drawdowns = data.map((d) => d.drawdown_pct || 0);
        const maxDrawdown = Math.min(...drawdowns);

        // Current drawdown
        const currentDrawdown = latestData?.drawdown_pct || 0;

        // VaR (Value at Risk) - 95th percentile
        const sortedReturns = [...returns].sort((a, b) => a - b);
        const var95Index = Math.floor(returns.length * 0.05);
        const var95 = sortedReturns[var95Index] || 0;

        // Positive/Negative day ratio
        const positiveDays = returns.filter((r) => r >= 0).length;
        const negativeDays = returns.filter((r) => r < 0).length;

        // Average positive/negative return
        const positiveReturns = returns.filter((r) => r > 0);
        const negativeReturns = returns.filter((r) => r < 0);
        const avgPositive = positiveReturns.length > 0
            ? positiveReturns.reduce((a, b) => a + b, 0) / positiveReturns.length
            : 0;
        const avgNegative = negativeReturns.length > 0
            ? negativeReturns.reduce((a, b) => a + b, 0) / negativeReturns.length
            : 0;

        // Best and worst days
        const bestDay = Math.max(...returns);
        const worstDay = Math.min(...returns);

        return {
            volatility,
            annualizedVolatility,
            maxDrawdown,
            currentDrawdown,
            var95,
            positiveDays,
            negativeDays,
            avgPositive,
            avgNegative,
            bestDay,
            worstDay,
            totalDays: returns.length,
        };
    }, [data, latestData]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    if (!riskMetrics) {
        return (
            <div className="space-y-6">
                {/* Page Header - Keep header so user can change year */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-500/10 p-3">
                            <Shield className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100">Risk Officer</h1>
                            <p className="text-sm text-slate-400">Drawdown & Volatility Analysis</p>
                        </div>
                    </div>

                    {/* Selectors */}
                    <div className="flex items-center gap-3">
                        <CoinSelector selectedCoin={selectedCoin} onChange={setSelectedCoin} />
                        <YearFilter selectedYear={selectedYear} onChange={setSelectedYear} />
                    </div>
                </div>
                
                <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold text-slate-300">Insufficient Data</h3>
                    <p className="text-slate-500 max-w-xs mt-2">
                        Not enough data points found for {selectedYear} to calculate risk metrics. Please select another year.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-500/10 p-3">
                        <Shield className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Risk Officer</h1>
                        <p className="text-sm text-slate-400">Drawdown & Volatility Analysis</p>
                    </div>
                </div>

                {/* Selectors */}
                <div className="flex items-center gap-3">
                    <CoinSelector selectedCoin={selectedCoin} onChange={setSelectedCoin} />
                    <YearFilter 
                        selectedYear={selectedYear} 
                        onChange={setSelectedYear}
                        startYear={getStartYear(selectedCoin)}
                    />
                </div>
            </div>

            {/* AI Insight Card */}
            <Card className="bg-gradient-to-r from-red-900/20 to-slate-900 border-red-500/20">
                <div className="p-4 flex items-start gap-4">
                    <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                        <Shield className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-red-200 mb-1 flex items-center gap-2">
                            Risk Assessment
                            <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">AI Risk Officer</span>
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {latestData?.risk_insight || "Calculating risk exposure..."}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Risk Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MetricCard
                    title="Current Drawdown"
                    value={formatPercent(riskMetrics.currentDrawdown)}
                    subtitle="From ATH"
                    icon={<TrendingDown className="h-6 w-6" />}
                    color={riskMetrics.currentDrawdown > -10 ? 'emerald' : riskMetrics.currentDrawdown > -30 ? 'orange' : 'rose'}
                />
                <MetricCard
                    title={`Max Drawdown (${selectedYear})`}
                    value={formatPercent(riskMetrics.maxDrawdown)}
                    subtitle="Worst case period"
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color="rose"
                />
                <MetricCard
                    title="Daily Volatility"
                    value={`${riskMetrics.volatility.toFixed(2)}%`}
                    subtitle={`${riskMetrics.annualizedVolatility.toFixed(0)}% annualized`}
                    icon={<Activity className="h-6 w-6" />}
                    color="purple"
                />
                <MetricCard
                    title="VaR (95%)"
                    value={formatPercent(riskMetrics.var95)}
                    subtitle="Daily worst case"
                    icon={<BarChart3 className="h-6 w-6" />}
                    color="amber"
                />
            </div>

            {/* Drawdown Chart */}
            <DrawdownChart data={data} height={350} />

            {/* Histogram Chart */}
            <HistogramChart data={data} height={300} />

            {/* Detailed Stats */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Win/Loss Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Win/Loss Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Win Rate Progress Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-emerald-500">
                                        Positive Days: {riskMetrics.positiveDays}
                                    </span>
                                    <span className="text-rose-500">
                                        Negative Days: {riskMetrics.negativeDays}
                                    </span>
                                </div>
                                <div className="h-3 bg-rose-500/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{
                                            width: `${(riskMetrics.positiveDays / riskMetrics.totalDays) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Win Rate: {((riskMetrics.positiveDays / riskMetrics.totalDays) * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Average Returns */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                                    <p className="text-xs text-slate-500">Avg Positive Day</p>
                                    <p className="text-lg font-bold text-emerald-500">
                                        +{riskMetrics.avgPositive.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-rose-500/10">
                                    <p className="text-xs text-slate-500">Avg Negative Day</p>
                                    <p className="text-lg font-bold text-rose-500">
                                        {riskMetrics.avgNegative.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Extreme Moves */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Extreme Moves (1Y)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Best Day */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10">
                                <div>
                                    <p className="text-xs text-slate-500">Best Single Day</p>
                                    <p className="text-xl font-bold text-emerald-500">
                                        +{riskMetrics.bestDay.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="text-4xl">🚀</div>
                            </div>

                            {/* Worst Day */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10">
                                <div>
                                    <p className="text-xs text-slate-500">Worst Single Day</p>
                                    <p className="text-xl font-bold text-rose-500">
                                        {riskMetrics.worstDay.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="text-4xl">📉</div>
                            </div>

                            {/* Risk Note */}
                            <div className="text-xs text-slate-500 p-3 rounded-lg border border-slate-800">
                                <p>
                                    <strong className="text-slate-400">Risk Note:</strong> Based on {riskMetrics.totalDays} trading days.
                                    VaR indicates you could expect losses greater than {formatPercent(riskMetrics.var95)} on approximately 5% of days.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: 'emerald' | 'rose' | 'orange' | 'purple' | 'amber' | 'blue';
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
    const colorClasses = {
        emerald: 'text-emerald-500 bg-emerald-500/10',
        rose: 'text-rose-500 bg-rose-500/10',
        orange: 'text-orange-500 bg-orange-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
        amber: 'text-amber-500 bg-amber-500/10',
        blue: 'text-blue-500 bg-blue-500/10',
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                            {title}
                        </p>
                        <p className={`text-xl font-bold tabular-nums mt-1 ${colorClasses[color].split(' ')[0]}`}>
                            {value}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                    </div>
                    <div className={`rounded-xl p-2 ${colorClasses[color]}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
