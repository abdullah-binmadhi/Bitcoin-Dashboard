import { useBitcoinData } from '@/hooks/useBitcoinData';
import { KPIGrid } from '@/components/cards/KPICard';
import { RecentActivity } from '@/components/cards/RecentActivity';
import { PriceChart } from '@/components/charts/PriceChart';
import { Orbit as OrbitIcon } from 'lucide-react';

export function Orbit() {
    const { data, kpiData, loading } = useBitcoinData(365);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-3">
                    <OrbitIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Orbit</h1>
                    <p className="text-sm text-slate-400">Executive Overview</p>
                </div>
            </div>

            {/* KPI Grid */}
            <KPIGrid kpiData={kpiData} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Price Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <PriceChart data={data} title="Bitcoin Price (1 Year)" height={400} />
                </div>

                {/* Recent Activity - Takes 1 column */}
                <div className="lg:col-span-1">
                    <RecentActivity data={data} limit={7} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard
                    label="52 Week High"
                    value={`$${Math.max(...data.map((d) => d.high)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    subtext="Maximum"
                    color="text-emerald-500"
                />
                <StatCard
                    label="52 Week Low"
                    value={`$${Math.min(...data.map((d) => d.low)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    subtext="Minimum"
                    color="text-rose-500"
                />
                <StatCard
                    label="Avg Daily Volume"
                    value={`$${(
                        data.reduce((sum, d) => sum + d.volume, 0) /
                        data.length /
                        1e9
                    ).toFixed(1)}B`}
                    subtext="Per day"
                    color="text-blue-500"
                />
                <StatCard
                    label="Data Points"
                    value={data.length.toString()}
                    subtext="Days of history"
                    color="text-purple-500"
                />
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    subtext: string;
    color: string;
}

function StatCard({ label, value, subtext, color }: StatCardProps) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-bold ${color} tabular-nums mt-1`}>{value}</p>
            <p className="text-xs text-slate-400">{subtext}</p>
        </div>
    );
}
