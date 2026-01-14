import { useCryptoData } from '@/hooks/useBitcoinData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    GitMerge, 
    Link as LinkIcon, 
    ScatterChart as ScatterIcon,
    ArrowRightLeft,
    TrendingUp
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    ScatterChart, 
    Scatter, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip,
    LineChart,
    Line
} from 'recharts';
import { useMemo, useState } from 'react';
import { CoinSelector } from '@/components/ui/CoinSelector';

// Helper to calculate correlation coefficient
function calculateCorrelation(x: number[], y: number[]) {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

export function Correlator() {
    // 1. Data Fetching
    const limit = 90; // 90 days correlation
    const btc = useCryptoData({ coin: 'BTC', limit });
    const eth = useCryptoData({ coin: 'ETH', limit });
    const sol = useCryptoData({ coin: 'SOL', limit });
    const xrp = useCryptoData({ coin: 'XRP', limit });

    const [pair, setPair] = useState<{base: 'BTC' | 'ETH' | 'SOL' | 'XRP', quote: 'BTC' | 'ETH' | 'SOL' | 'XRP'}>({
        base: 'ETH',
        quote: 'BTC'
    });

    const loading = btc.loading || eth.loading || sol.loading || xrp.loading;

    // 2. Data Processing for Correlation Matrix
    const correlationMatrix = useMemo(() => {
        if (loading) return [];
        
        const assets = [
            { id: 'BTC', data: btc.data },
            { id: 'ETH', data: eth.data },
            { id: 'SOL', data: sol.data },
            { id: 'XRP', data: xrp.data }
        ];

        // Ensure we align dates perfectly (basic approach: take last N common items)
        const minLen = Math.min(...assets.map(a => a.data.length));
        
        const matrix = [];
        
        for (const rowAsset of assets) {
            const row = { name: rowAsset.id, values: {} as Record<string, number> };
            const rowPrices = rowAsset.data.slice(-minLen).map(d => d.close);

            for (const colAsset of assets) {
                const colPrices = colAsset.data.slice(-minLen).map(d => d.close);
                row.values[colAsset.id] = calculateCorrelation(rowPrices, colPrices);
            }
            matrix.push(row);
        }
        return matrix;
    }, [loading, btc.data, eth.data, sol.data, xrp.data]);

    // 3. Data Processing for Ratio & Scatter
    const pairData = useMemo(() => {
        if (loading) return { ratio: [], scatter: [] };

        const baseData = pair.base === 'BTC' ? btc.data : pair.base === 'ETH' ? eth.data : pair.base === 'SOL' ? sol.data : xrp.data;
        const quoteData = pair.quote === 'BTC' ? btc.data : pair.quote === 'ETH' ? eth.data : pair.quote === 'SOL' ? sol.data : xrp.data;

        const minLen = Math.min(baseData.length, quoteData.length);
        const slicedBase = baseData.slice(-minLen);
        const slicedQuote = quoteData.slice(-minLen);

        const ratio = slicedBase.map((d, i) => ({
            date: d.date,
            ratio: d.close / slicedQuote[i].close,
            basePrice: d.close,
            quotePrice: slicedQuote[i].close
        }));

        const scatter = slicedBase.map((d, i) => {
            // Daily Returns
            const prevBase = i > 0 ? slicedBase[i-1].close : d.close;
            const prevQuote = i > 0 ? slicedQuote[i-1].close : slicedQuote[i].close;
            
            return {
                x: ((slicedQuote[i].close - prevQuote) / prevQuote) * 100, // Quote return
                y: ((d.close - prevBase) / prevBase) * 100, // Base return
                date: d.date
            };
        }).slice(1); // Remove first item (no return)

        return { ratio, scatter };
    }, [loading, pair, btc.data, eth.data, sol.data, xrp.data]);


    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1920px] mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-pink-500/10 p-3">
                    <GitMerge className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">The Correlator</h1>
                    <p className="text-sm text-slate-400">Inter-Asset Relationship Analysis (90 Days)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Correlation Matrix */}
                <div className="lg:col-span-1">
                    <Card className="bg-slate-900/50 border-slate-800 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <LinkIcon className="h-4 w-4 text-pink-500" />
                                Correlation Matrix
                            </CardTitle>
                            <CardDescription> Pearson Correlation Coefficient (-1 to +1)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr>
                                            <th className="p-2"></th>
                                            {correlationMatrix.map(c => (
                                                <th key={c.name} className="p-2 text-slate-400">{c.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {correlationMatrix.map((row) => (
                                            <tr key={row.name}>
                                                <td className="p-2 font-bold text-slate-300">{row.name}</td>
                                                {['BTC', 'ETH', 'SOL', 'XRP'].map((col) => {
                                                    const val = row.values[col];
                                                    let color = 'text-slate-500';
                                                    if (val > 0.8) color = 'text-emerald-500 font-bold';
                                                    else if (val > 0.5) color = 'text-emerald-400';
                                                    else if (val < -0.5) color = 'text-rose-400';
                                                    
                                                    return (
                                                        <td key={col} className={`p-2 ${color}`}>
                                                            {val.toFixed(2)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 text-xs text-slate-500">
                                * 1.00 = Perfect Correlation (Move together)<br/>
                                * 0.00 = No Correlation<br/>
                                * -1.00 = Inverse Correlation (Move opposite)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. Ratio Chart (Interactive) */}
                <div className="lg:col-span-2 space-y-6">
                     {/* Controls */}
                    <Card className="p-4 bg-slate-900/50 border-slate-800">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-slate-400">Analyze Pair:</span>
                            <div className="flex items-center gap-2">
                                <CoinSelector selectedCoin={pair.base} onChange={(c) => setPair(p => ({ ...p, base: c }))} />
                                <span className="text-slate-500">/</span>
                                <CoinSelector selectedCoin={pair.quote} onChange={(c) => setPair(p => ({ ...p, quote: c }))} />
                            </div>
                        </div>
                    </Card>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ratio Chart */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                                    Price Ratio ({pair.base}/{pair.quote})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={pairData.ratio}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis 
                                            dataKey="date" 
                                            tick={{fill: '#64748b', fontSize: 12}} 
                                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                        />
                                        <YAxis domain={['auto', 'auto']} tick={{fill: '#64748b', fontSize: 12}} />
                                        <RechartsTooltip 
                                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9'}}
                                            labelFormatter={(l) => new Date(l).toLocaleDateString()}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="ratio" 
                                            stroke="#3b82f6" 
                                            strokeWidth={2} 
                                            dot={false} 
                                            name={`${pair.base}/${pair.quote}`}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Scatter Plot */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ScatterIcon className="h-4 w-4 text-purple-500" />
                                    Daily Returns Scatter
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis 
                                            type="number" 
                                            dataKey="x" 
                                            name={`${pair.quote} Return`} 
                                            unit="%" 
                                            tick={{fill: '#64748b', fontSize: 12}} 
                                            label={{ value: `${pair.quote} %`, position: 'bottom', fill: '#64748b' }}
                                        />
                                        <YAxis 
                                            type="number" 
                                            dataKey="y" 
                                            name={`${pair.base} Return`} 
                                            unit="%" 
                                            tick={{fill: '#64748b', fontSize: 12}} 
                                            label={{ value: `${pair.base} %`, angle: -90, position: 'left', fill: '#64748b' }}
                                        />
                                        <RechartsTooltip 
                                            cursor={{ strokeDasharray: '3 3' }} 
                                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9'}}
                                        />
                                        <Scatter name="Daily Returns" data={pairData.scatter} fill="#8b5cf6" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            {/* Insight Card */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-900 border-slate-800">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-indigo-500/10 p-3">
                            <TrendingUp className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-200">Correlation Insight</h3>
                            <p className="text-slate-400 mt-1 max-w-3xl">
                                When the correlation between <strong>{pair.base}</strong> and <strong>{pair.quote}</strong> is high (near 1.0), it suggests they are driven by the same market factors (Beta). 
                                A breakdown in correlation often signals a specific narrative forming for one asset (Alpha). 
                                Currently, looking at the scatter plot, notice how outliers (points far from the diagonal) represent days where one asset significantly outperformed the other.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
