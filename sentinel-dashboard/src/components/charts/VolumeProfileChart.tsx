import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { BitcoinData } from '@/types/database';
import { useMemo } from 'react';

interface VolumeProfileProps {
    data: BitcoinData[];
    height?: number;
}

export function VolumeProfileChart({ data, height = 450 }: VolumeProfileProps) {
    const profileData = useMemo(() => {
        if (data.length === 0) return [];

        const prices = data.map(d => d.close);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const buckets = 24; // Number of price levels
        const step = (max - min) / buckets;

        const histogram = Array(buckets).fill(0).map((_, i) => ({
            rangeStart: min + (i * step),
            rangeEnd: min + ((i + 1) * step),
            mid: min + (i * step) + (step / 2),
            volume: 0,
            label: `$${formatNumber(min + (i * step) + (step / 2), 0)}`
        }));

        data.forEach(d => {
            const bucketIndex = Math.min(
                Math.floor((d.close - min) / step), 
                buckets - 1
            );
            if (bucketIndex >= 0) {
                histogram[bucketIndex].volume += d.volume;
            }
        });

        // Find Point of Control (POC) - level with max volume
        const maxVol = Math.max(...histogram.map(h => h.volume));
        
        return histogram.map(h => ({
            ...h,
            isPOC: h.volume === maxVol
        }));
    }, [data]);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between">
                    <span>Volume Profile (VPVR)</span>
                    <span className="text-xs text-slate-400 font-normal">Vol by Price Level</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-4">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        layout="vertical"
                        data={profileData}
                        margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="label" 
                            type="category" 
                            width={60}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-lg text-xs">
                                            <p className="text-slate-300">Price: {formatCurrency(data.mid, 0)}</p>
                                            <p className="text-emerald-400">Vol: {formatNumber(data.volume, 0)}</p>
                                            {data.isPOC && <p className="text-amber-400 font-bold">POINT OF CONTROL</p>}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                            {profileData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.isPOC ? '#f59e0b' : '#3b82f6'} 
                                    fillOpacity={entry.isPOC ? 1 : 0.6}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
