import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';
import { useMemo } from 'react';

interface MACDChartProps {
    data: BitcoinData[];
    height?: number;
}

// EMA Calculation Helper
function calculateEMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const emaArray: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
        emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
    }
    return emaArray;
}

export function MACDChart({ data, height = 350 }: MACDChartProps) {
    const macdData = useMemo(() => {
        if (data.length < 26) return [];

        const prices = data.map((d) => d.close);
        const ema12 = calculateEMA(prices, 12);
        const ema26 = calculateEMA(prices, 26);

        const macdLine = prices.map((_, i) => ema12[i] - ema26[i]);
        const signalLine = calculateEMA(macdLine, 9);
        const histogram = macdLine.map((val, i) => val - signalLine[i]);

        return data.map((d, i) => ({
            date: d.date,
            macd: macdLine[i],
            signal: signalLine[i],
            histogram: histogram[i],
        })).slice(26); // Remove initial unstable period
    }, [data]);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <span>MACD (12, 26, 9)</span>
                    <div className="flex gap-4 text-xs font-normal">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> MACD</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Signal</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart data={macdData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => formatShortDate(date)} 
                            stroke="#475569" 
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            minTickGap={50}
                        />
                        <YAxis 
                            stroke="#475569" 
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            width={40}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelFormatter={(label) => formatShortDate(label)}
                        />
                        <ReferenceLine y={0} stroke="#475569" />
                        
                        <Bar dataKey="histogram" fill="#10b981" barSize={4} />
                        <Line type="monotone" dataKey="macd" stroke="#3b82f6" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="signal" stroke="#f97316" dot={false} strokeWidth={2} />
                        
                        <Brush 
                            dataKey="date" 
                            height={30} 
                            stroke="#3b82f6" 
                            fill="#1e293b"
                            tickFormatter={(date) => formatShortDate(date)}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
