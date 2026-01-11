import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';

interface BollingerChartProps {
    data: BitcoinData[];
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
                <p className="text-sm font-medium text-slate-400 mb-2">
                    {formatShortDate(data.date)}
                </p>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-100">Price:</span>
                        <span className="font-bold text-white">
                            {formatCurrency(data.close)}
                        </span>
                    </div>
                    {data.sma_50 && (
                        <div className="flex justify-between gap-4">
                            <span className="text-orange-400">SMA 50:</span>
                            <span className="text-orange-400">
                                {formatCurrency(data.sma_50)}
                            </span>
                        </div>
                    )}
                    {data.sma_200 && (
                        <div className="flex justify-between gap-4">
                            <span className="text-blue-400">SMA 200:</span>
                            <span className="text-blue-400">
                                {formatCurrency(data.sma_200)}
                            </span>
                        </div>
                    )}
                    {data.bb_upper && data.bb_lower && (
                        <>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">BB Upper:</span>
                                <span className="text-slate-400">
                                    {formatCurrency(data.bb_upper)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">BB Lower:</span>
                                <span className="text-slate-400">
                                    {formatCurrency(data.bb_lower)}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export function BollingerChart({ data, height = 500 }: BollingerChartProps) {
    // Filter data that has Bollinger Bands calculated
    const filteredData = data.filter((d) => d.bb_upper && d.bb_lower);

    // Get min and max for Y axis
    const prices = filteredData.flatMap((d) => [
        d.close,
        d.bb_upper || d.close,
        d.bb_lower || d.close,
        d.sma_50 || d.close,
        d.sma_200 || d.close,
    ]);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-base">
                    Technical Analysis
                    <div className="flex items-center gap-4 text-xs font-normal">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            SMA 50
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            SMA 200
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-6 rounded bg-slate-600/50" />
                            Bollinger Bands
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart
                        data={filteredData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#64748b" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#64748b" stopOpacity={0.05} />
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

                        {/* Bollinger Bands Area */}
                        <Area
                            type="monotone"
                            dataKey="bb_upper"
                            stroke="transparent"
                            fill="url(#bbGradient)"
                            fillOpacity={1}
                            dot={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="bb_lower"
                            stroke="transparent"
                            fill="#0f172a"
                            fillOpacity={1}
                            dot={false}
                        />

                        {/* Upper and Lower Band Lines */}
                        <Line
                            type="monotone"
                            dataKey="bb_upper"
                            stroke="#475569"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="bb_lower"
                            stroke="#475569"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            dot={false}
                        />

                        {/* SMA 200 */}
                        <Line
                            type="monotone"
                            dataKey="sma_200"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                        />

                        {/* SMA 50 */}
                        <Line
                            type="monotone"
                            dataKey="sma_50"
                            stroke="#F97316"
                            strokeWidth={2}
                            dot={false}
                        />

                        {/* Price Line */}
                        <Line
                            type="monotone"
                            dataKey="close"
                            stroke="#f8fafc"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: '#f8fafc',
                                stroke: '#0f172a',
                                strokeWidth: 2,
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
