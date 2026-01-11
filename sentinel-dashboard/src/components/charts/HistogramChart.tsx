import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BitcoinData } from '@/types/database';
import { useMemo } from 'react';

interface HistogramChartProps {
    data: BitcoinData[];
    height?: number;
}

interface BinData {
    bin: string;
    range: string;
    count: number;
    midpoint: number;
}

interface TooltipPayload {
    payload: BinData;
}

const CustomTooltip = ({
    active,
    payload,
}: {
    active?: boolean;
    payload?: TooltipPayload[];
}) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                <p className="text-sm font-medium text-slate-400">{data.range}</p>
                <p className="mt-1 text-lg font-bold text-slate-100">
                    {data.count} days
                </p>
            </div>
        );
    }
    return null;
};

export function HistogramChart({ data, height = 300 }: HistogramChartProps) {
    const histogramData = useMemo(() => {
        // Calculate daily returns
        const returns: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const pctChange =
                ((data[i].close - data[i - 1].close) / data[i - 1].close) * 100;
            returns.push(pctChange);
        }

        if (returns.length === 0) return [];

        // Create bins
        const min = Math.min(...returns);
        const max = Math.max(...returns);
        const binCount = 25;
        const binWidth = (max - min) / binCount;

        const bins: BinData[] = [];
        for (let i = 0; i < binCount; i++) {
            const start = min + i * binWidth;
            const end = start + binWidth;
            const midpoint = (start + end) / 2;
            const count = returns.filter((r) => r >= start && r < end).length;
            bins.push({
                bin: `${midpoint.toFixed(1)}%`,
                range: `${start.toFixed(1)}% to ${end.toFixed(1)}%`,
                count,
                midpoint,
            });
        }

        return bins;
    }, [data]);

    const maxCount = Math.max(...histogramData.map((d) => d.count));

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily Returns Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={histogramData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="bin"
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            interval={4}
                        />
                        <YAxis
                            domain={[0, maxCount]}
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Reference line at 0% */}
                        <ReferenceLine
                            x={histogramData.find((d) => d.midpoint >= 0)?.bin}
                            stroke="#475569"
                            strokeDasharray="4 4"
                        />

                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {histogramData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.midpoint >= 0 ? '#10b981' : '#f43f5e'}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
