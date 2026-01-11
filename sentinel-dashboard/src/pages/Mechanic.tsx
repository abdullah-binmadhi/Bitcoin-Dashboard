import { useBitcoinData } from '@/hooks/useBitcoinData';
import { BollingerChart } from '@/components/charts/BollingerChart';
import { RSIChart } from '@/components/charts/RSIChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export function Mechanic() {
    const { data, latestData, loading } = useBitcoinData(365);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    // Calculate position within Bollinger Bands
    const bbPosition = latestData?.bb_upper && latestData?.bb_lower
        ? ((latestData.close - latestData.bb_lower) / (latestData.bb_upper - latestData.bb_lower)) * 100
        : 50;

    // Calculate price vs SMA relationship
    const priceVsSma50 = latestData?.sma_50
        ? ((latestData.close - latestData.sma_50) / latestData.sma_50) * 100
        : 0;
    const priceVsSma200 = latestData?.sma_200
        ? ((latestData.close - latestData.sma_200) / latestData.sma_200) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/10 p-3">
                    <Wrench className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">The Mechanic</h1>
                    <p className="text-sm text-slate-400">Technical Analysis</p>
                </div>
            </div>

            {/* Technical Indicator Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* SMA 50 Position */}
                <Card className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">
                                    vs SMA 50
                                </p>
                                <p
                                    className={`text-xl font-bold tabular-nums ${priceVsSma50 >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                        }`}
                                >
                                    {priceVsSma50 >= 0 ? '+' : ''}{priceVsSma50.toFixed(2)}%
                                </p>
                                <p className="text-xs text-slate-400">
                                    {latestData?.sma_50 ? formatCurrency(latestData.sma_50) : '-'}
                                </p>
                            </div>
                            {priceVsSma50 >= 0 ? (
                                <TrendingUp className="h-8 w-8 text-emerald-500/50" />
                            ) : (
                                <TrendingDown className="h-8 w-8 text-rose-500/50" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SMA 200 Position */}
                <Card className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">
                                    vs SMA 200
                                </p>
                                <p
                                    className={`text-xl font-bold tabular-nums ${priceVsSma200 >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                        }`}
                                >
                                    {priceVsSma200 >= 0 ? '+' : ''}{priceVsSma200.toFixed(2)}%
                                </p>
                                <p className="text-xs text-slate-400">
                                    {latestData?.sma_200 ? formatCurrency(latestData.sma_200) : '-'}
                                </p>
                            </div>
                            {priceVsSma200 >= 0 ? (
                                <TrendingUp className="h-8 w-8 text-emerald-500/50" />
                            ) : (
                                <TrendingDown className="h-8 w-8 text-rose-500/50" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* RSI Value */}
                <Card className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">
                                    RSI (14)
                                </p>
                                <p
                                    className={`text-xl font-bold tabular-nums ${(latestData?.rsi || 50) >= 70
                                            ? 'text-rose-500'
                                            : (latestData?.rsi || 50) <= 30
                                                ? 'text-emerald-500'
                                                : 'text-purple-400'
                                        }`}
                                >
                                    {latestData?.rsi?.toFixed(1) || '-'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {(latestData?.rsi || 50) >= 70
                                        ? 'Overbought'
                                        : (latestData?.rsi || 50) <= 30
                                            ? 'Oversold'
                                            : 'Neutral'}
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-purple-400/50" />
                        </div>
                    </CardContent>
                </Card>

                {/* BB Position */}
                <Card className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">
                                    BB Position
                                </p>
                                <p className="text-xl font-bold text-slate-100 tabular-nums">
                                    {bbPosition.toFixed(0)}%
                                </p>
                                <p className="text-xs text-slate-400">
                                    {bbPosition > 80
                                        ? 'Near Upper Band'
                                        : bbPosition < 20
                                            ? 'Near Lower Band'
                                            : 'Mid Range'}
                                </p>
                            </div>
                            <Target className="h-8 w-8 text-slate-500/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bollinger Bands Chart */}
            <BollingerChart data={data} height={450} />

            {/* RSI Chart */}
            <RSIChart data={data} height={220} />

            {/* Technical Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Technical Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                            <p className="font-medium text-slate-300">Bollinger Bands (20, 2)</p>
                            <p className="text-slate-500">
                                Upper: {latestData?.bb_upper ? formatCurrency(latestData.bb_upper) : '-'}
                            </p>
                            <p className="text-slate-500">
                                Lower: {latestData?.bb_lower ? formatCurrency(latestData.bb_lower) : '-'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-slate-300">Moving Averages</p>
                            <p className="text-slate-500">
                                SMA 50: {latestData?.sma_50 ? formatCurrency(latestData.sma_50) : '-'}
                            </p>
                            <p className="text-slate-500">
                                SMA 200: {latestData?.sma_200 ? formatCurrency(latestData.sma_200) : '-'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-slate-300">Current Price</p>
                            <p className="text-slate-500">
                                {latestData ? formatCurrency(latestData.close) : '-'}
                            </p>
                            <p className="text-slate-500">
                                Volume: ${latestData ? formatNumber(latestData.volume / 1e9, 2) : '-'}B
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
