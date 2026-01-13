import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';
import { useMemo } from 'react';

interface FibChartProps {
    data: BitcoinData[];
    height?: number;
}

export function FibRetracementChart({ data, height = 450 }: FibChartProps) {
    const { maxPrice, minPrice, levels } = useMemo(() => {
        if (data.length === 0) return { maxPrice: 0, minPrice: 0, levels: [] };
        
        const prices = data.map(d => d.close);
        const max = Math.max(...prices);
        const min = Math.min(...prices);
        const diff = max - min;

        return {
            maxPrice: max,
            minPrice: min,
            levels: [
                { val: max, label: '0.0% (High)', color: '#ef4444' },
                { val: max - 0.236 * diff, label: '23.6%', color: '#f97316' },
                { val: max - 0.382 * diff, label: '38.2%', color: '#eab308' },
                { val: max - 0.5 * diff, label: '50.0%', color: '#10b981' },
                { val: max - 0.618 * diff, label: '61.8% (Golden)', color: '#3b82f6' },
                { val: min, label: '100% (Low)', color: '#8b5cf6' },
            ]
        };
    }, [data]);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Fibonacci Retracement</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fibGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => formatShortDate(date)} 
                            stroke="#475569"
                            minTickGap={50}
                        />
                        <YAxis 
                            domain={[minPrice * 0.95, maxPrice * 1.05]} 
                            stroke="#475569"
                            tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                            width={50}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            formatter={(val: any) => [formatCurrency(Number(val)), 'Price']}
                            labelFormatter={(label) => formatShortDate(label)}
                        />
                        
                        {levels.map((level) => (
                            <ReferenceLine 
                                key={level.label} 
                                y={level.val} 
                                stroke={level.color} 
                                strokeDasharray="3 3"
                                label={{ value: level.label, position: 'right', fill: level.color, fontSize: 11 }}
                            />
                        ))}

                        <Area 
                            type="monotone" 
                            dataKey="close" 
                            stroke="#6366f1" 
                            fill="url(#fibGradient)" 
                            strokeWidth={2}
                        />
                        
                        <Brush 
                            dataKey="date" 
                            height={30} 
                            stroke="#6366f1" 
                            fill="#1e293b"
                            tickFormatter={(date) => formatShortDate(date)}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
