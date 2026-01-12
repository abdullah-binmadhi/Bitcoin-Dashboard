import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea,
    Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';

interface RSIChartProps {
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
        const rsi = data.rsi || 50;
        let status = 'Neutral';
        let color = 'text-slate-400';
        if (rsi >= 70) {
            status = 'Overbought';
            color = 'text-rose-500';
        } else if (rsi <= 30) {
            status = 'Oversold';
            color = 'text-emerald-500';
        }

        return (
            <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                <p className="text-sm font-medium text-slate-400">
                    {formatShortDate(data.date)}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${color}`}>
                        {rsi.toFixed(1)}
                    </span>
                    <span className={`text-sm ${color}`}>{status}</span>
                </div>
            </div>
        );
    }
    return null;
};

export function RSIChart({ data, height = 200 }: RSIChartProps) {
    const filteredData = data.filter((d) => d.rsi !== null);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                    <span>RSI (14)</span>
                    <div className="flex items-center gap-4 text-xs font-normal">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            Overbought (&gt;70)
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Oversold (&lt;30)
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart
                        data={filteredData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                            vertical={false}
                        />

                        {/* Overbought zone */}
                        <ReferenceArea
                            y1={70}
                            y2={100}
                            fill="#f43f5e"
                            fillOpacity={0.1}
                        />

                        {/* Oversold zone */}
                        <ReferenceArea
                            y1={0}
                            y2={30}
                            fill="#10b981"
                            fillOpacity={0.1}
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
                            domain={[0, 100]}
                            ticks={[0, 30, 50, 70, 100]}
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Reference lines */}
                        <ReferenceLine
                            y={70}
                            stroke="#f43f5e"
                            strokeDasharray="4 4"
                            strokeOpacity={0.5}
                        />
                        <ReferenceLine
                            y={30}
                            stroke="#10b981"
                            strokeDasharray="4 4"
                            strokeOpacity={0.5}
                        />
                        <ReferenceLine
                            y={50}
                            stroke="#475569"
                            strokeDasharray="4 4"
                            strokeOpacity={0.3}
                        />

                        <Line
                            type="monotone"
                            dataKey="rsi"
                            stroke="#a78bfa"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 5,
                                fill: '#a78bfa',
                                stroke: '#0f172a',
                                strokeWidth: 2,
                            }}
                        />
                        <Brush 
                            dataKey="date" 
                            height={30} 
                            stroke="#a78bfa" 
                            fill="#1e293b"
                            tickFormatter={(date) => formatShortDate(date)}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
