import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompactDate, formatNumber } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';
import { useMemo } from 'react';

interface OBVChartProps {
    data: BitcoinData[];
    height?: number;
}

export function OBVChart({ data, height = 300 }: OBVChartProps) {
    const obvData = useMemo(() => {
        if (data.length === 0) return [];

        let obv = 0;
        const result = [];

        // Skip first element as we need previous close
        for (let i = 0; i < data.length; i++) {
            const current = data[i];
            const prev = i > 0 ? data[i - 1] : null;

            if (prev) {
                if (current.close > prev.close) {
                    obv += current.volume;
                } else if (current.close < prev.close) {
                    obv -= current.volume;
                }
                // If equal, OBV stays same
            }

            result.push({
                date: current.date,
                obv: obv,
                close: current.close // For comparison/divergence spotting
            });
        }
        return result;
    }, [data]);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <span>On-Balance Volume (OBV)</span>
                    <span className="text-xs font-normal text-slate-400">Cumulative Volume Flow</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart data={obvData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="obvGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => formatCompactDate(date)} 
                            stroke="#475569" 
                            minTickGap={50}
                        />
                        <YAxis 
                            dataKey="obv" 
                            stroke="#475569" 
                            tickFormatter={(val) => formatNumber(val, 0)}
                            width={50}
                            style={{ fontSize: '10px' }}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            formatter={(val: any) => [formatNumber(Number(val), 0), 'OBV']}
                            labelFormatter={(label) => formatCompactDate(label)}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="obv" 
                            stroke="#8b5cf6" 
                            fill="url(#obvGradient)" 
                            strokeWidth={2}
                        />
                        <Brush 
                            dataKey="date" 
                            height={30} 
                            stroke="#8b5cf6" 
                            fill="#1e293b"
                            tickFormatter={(date) => formatCompactDate(date)}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
