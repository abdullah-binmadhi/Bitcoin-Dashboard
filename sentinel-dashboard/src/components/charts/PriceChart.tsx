import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';

interface PriceChartProps {
    data: BitcoinData[];
    title?: string;
    height?: number;
}

interface TooltipPayload {
    payload: BitcoinData;
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
                <p className="text-sm font-medium text-slate-400">
                    {formatShortDate(data.date)}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-100">
                    {formatCurrency(data.close)}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-slate-500">Open:</span>
                    <span className="text-slate-300">{formatCurrency(data.open)}</span>
                    <span className="text-slate-500">High:</span>
                    <span className="text-emerald-400">{formatCurrency(data.high)}</span>
                    <span className="text-slate-500">Low:</span>
                    <span className="text-rose-400">{formatCurrency(data.low)}</span>
                </div>
            </div>
        );
    }
    return null;
};

export function PriceChart({
    data,
    title = 'Price History',
    height = 400,
}: PriceChartProps) {
    // Get min and max for Y axis with padding
    const prices = data.map((d) => d.close);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#10B981" stopOpacity={0.1} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => formatShortDate(date)}
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            minTickGap={50}
                        />
                        <YAxis
                            domain={[minPrice, maxPrice]}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="url(#priceGradient)"
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: '#10B981',
                                stroke: '#0f172a',
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
