import { useCryptoData } from '@/hooks/useBitcoinData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ScanEye, 
    ArrowUpRight, 
    ArrowDownRight, 
    Activity, 
    BarChart3,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

interface MarketAsset {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    change7d: number;
    volume: number;
    rsi: number;
    sma200: number;
    trend: 'Bullish' | 'Bearish';
    ath: number;
    drawdown: number;
}

export function Scanner() {
    // Fetch data for all assets
    const btc = useCryptoData({ coin: 'BTC', limit: 365 });
    const eth = useCryptoData({ coin: 'ETH', limit: 365 });
    const xrp = useCryptoData({ coin: 'XRP', limit: 365 });
    const sol = useCryptoData({ coin: 'SOL', limit: 365 });

    const loading = btc.loading || eth.loading || xrp.loading || sol.loading;

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    // Helper to process data into MarketAsset
    const processAsset = (symbol: string, name: string, data: any[]): MarketAsset => {
        if (!data || data.length === 0) return {
            symbol, name, price: 0, change24h: 0, change7d: 0, volume: 0, rsi: 0, sma200: 0, trend: 'Bearish', ath: 0, drawdown: 0
        };

        const latest = data[data.length - 1];
        const oneDayAgo = data[data.length - 2] || latest;
        const sevenDaysAgo = data[data.length - 8] || latest;
        
        const price = latest.close;
        const change24h = ((price - oneDayAgo.close) / oneDayAgo.close) * 100;
        const change7d = ((price - sevenDaysAgo.close) / sevenDaysAgo.close) * 100;
        
        const ath = Math.max(...data.map((d: any) => d.high));
        const drawdown = ((price - ath) / ath) * 100;

        return {
            symbol,
            name,
            price,
            change24h,
            change7d,
            volume: latest.volume,
            rsi: latest.rsi || 50,
            sma200: latest.sma_200 || price,
            trend: price > (latest.sma_200 || price) ? 'Bullish' : 'Bearish',
            ath,
            drawdown
        };
    };

    const assets = [
        processAsset('BTC', 'Bitcoin', btc.data),
        processAsset('ETH', 'Ethereum', eth.data),
        processAsset('SOL', 'Solana', sol.data),
        processAsset('XRP', 'Ripple', xrp.data),
    ].sort((a, b) => b.volume - a.volume); // Sort by volume by default

    const topGainer = [...assets].sort((a, b) => b.change24h - a.change24h)[0];
    const topLoser = [...assets].sort((a, b) => a.change24h - b.change24h)[0];

    return (
        <div className="space-y-6 max-w-[1920px] mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                    <ScanEye className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">The Scanner</h1>
                    <p className="text-sm text-slate-400">Real-time Market Opportunities</p>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Market Leader (Vol)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-slate-100">{assets[0].symbol}</div>
                                <div className="text-xs text-slate-500">${formatNumber(assets[0].volume / 1e9, 2)}B Vol</div>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-500/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Top Gainer (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-emerald-500">+{topGainer.change24h.toFixed(2)}%</div>
                                <div className="text-xs text-slate-500">{topGainer.symbol}</div>
                            </div>
                            <ArrowUpRight className="h-8 w-8 text-emerald-500/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Top Loser (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-rose-500">{topLoser.change24h.toFixed(2)}%</div>
                                <div className="text-xs text-slate-500">{topLoser.symbol}</div>
                            </div>
                            <ArrowDownRight className="h-8 w-8 text-rose-500/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Scanner Table */}
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Market Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-slate-800/50">
                                <TableHead className="text-slate-400">Asset</TableHead>
                                <TableHead className="text-right text-slate-400">Price</TableHead>
                                <TableHead className="text-right text-slate-400">24h Change</TableHead>
                                <TableHead className="text-right text-slate-400">7d Change</TableHead>
                                <TableHead className="text-right text-slate-400">Volume (24h)</TableHead>
                                <TableHead className="text-center text-slate-400">RSI (14)</TableHead>
                                <TableHead className="text-center text-slate-400">Trend (200 SMA)</TableHead>
                                <TableHead className="text-right text-slate-400">Drawdown (ATH)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.map((asset) => (
                                <TableRow key={asset.symbol} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="font-medium text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-8 rounded-full ${
                                                asset.symbol === 'BTC' ? 'bg-orange-500' :
                                                asset.symbol === 'ETH' ? 'bg-indigo-500' :
                                                asset.symbol === 'SOL' ? 'bg-purple-500' :
                                                'bg-slate-500'
                                            }`} />
                                            <div>
                                                <div>{asset.name}</div>
                                                <div className="text-xs text-slate-500">{asset.symbol}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-slate-200">
                                        {formatCurrency(asset.price)}
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${asset.change7d >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {asset.change7d > 0 ? '+' : ''}{asset.change7d.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-right text-slate-400">
                                        ${formatNumber(asset.volume / 1e9, 2)}B
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            asset.rsi > 70 ? 'bg-rose-500/10 text-rose-500' :
                                            asset.rsi < 30 ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-slate-500/10 text-slate-400'
                                        }`}>
                                            {asset.rsi.toFixed(1)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {asset.trend === 'Bullish' ? (
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-rose-500" />
                                            )}
                                            <span className={`text-xs ${asset.trend === 'Bullish' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {asset.trend}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-rose-400">
                                        {asset.drawdown.toFixed(2)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Opportunity Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            Oversold Opportunities (RSI &lt; 35)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assets.filter(a => a.rsi < 35).length > 0 ? (
                            <div className="space-y-4">
                                {assets.filter(a => a.rsi < 35).map(asset => (
                                    <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="font-bold text-slate-200">{asset.symbol}</div>
                                        <div className="text-emerald-500 font-mono">RSI: {asset.rsi.toFixed(1)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No assets currently oversold.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-rose-500" />
                            Overheated Assets (RSI &gt; 70)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assets.filter(a => a.rsi > 70).length > 0 ? (
                            <div className="space-y-4">
                                {assets.filter(a => a.rsi > 70).map(asset => (
                                    <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                                        <div className="font-bold text-slate-200">{asset.symbol}</div>
                                        <div className="text-rose-500 font-mono">RSI: {asset.rsi.toFixed(1)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No assets currently overheated.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
