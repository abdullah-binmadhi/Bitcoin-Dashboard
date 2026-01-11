import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';

interface DrawdownChartProps {
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
        const drawdown = data.drawdown_pct || 0;

        return (
            <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                <p className="text-sm font-medium text-slate-400">
                    {formatShortDate(data.date)}
                </p>
                <div className="mt-2">
                    <span
                        className={`text-2xl font-bold ${drawdown > -10 ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                    >
                        {drawdown.toFixed(2)}%
                    </span>
                    <p className="text-xs text-slate-500 mt-1">from all-time high</p>
                </div>
            </div>
        );
    }
    return null;
};

export function DrawdownChart({ data, height = 300 }: DrawdownChartProps) {
    const filteredData = data.filter((d) => d.drawdown_pct !== null);

    // Get min drawdown for Y axis
    const drawdowns = filteredData.map((d) => d.drawdown_pct || 0);
    const minDrawdown = Math.min(...drawdowns);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    Underwater Plot (Drawdown from ATH)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart
                        data={filteredData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.1} />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
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
                            domain={[Math.floor(minDrawdown / 10) * 10, 0]}
                            tickFormatter={(value) => `${value}%`}
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Reference lines for significant levels */}
                        <ReferenceLine
                            y={0}
                            stroke="#10b981"
                            strokeWidth={2}
                            label={{
                                value: 'ATH',
                                position: 'right',
                                fill: '#10b981',
                                fontSize: 11,
                            }}
                        />
                        <ReferenceLine
                            y={-20}
                            stroke="#f97316"
                            strokeDasharray="4 4"
                            strokeOpacity={0.5}
                        />
                        <ReferenceLine
                            y={-50}
                            stroke="#f43f5e"
                            strokeDasharray="4 4"
                            strokeOpacity={0.5}
                        />

                        <Area
                            type="monotone"
                            dataKey="drawdown_pct"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            fill="url(#drawdownGradient)"
                            dot={false}
                            activeDot={{
                                r: 5,
                                fill: '#f43f5e',
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
