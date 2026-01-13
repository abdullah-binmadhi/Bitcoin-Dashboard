import { cn, formatCurrency, formatPercent, getFearGreedStatus, getTrendStatus } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    BarChart3,
} from 'lucide-react';
import type { KPIData } from '@/types/database';

interface KPICardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    gradientClass?: string;
    glowClass?: string;
}

function KPICard({
    title,
    value,
    subtitle,
    icon,
    trend,
    gradientClass = '',
    glowClass = '',
}: KPICardProps) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
                gradientClass,
                glowClass
            )}
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                            {title}
                        </span>
                        <span
                            className={cn(
                                'text-2xl font-bold tabular-nums',
                                trend === 'up' && 'text-emerald-500',
                                trend === 'down' && 'text-rose-500',
                                trend === 'neutral' && 'text-slate-100'
                            )}
                        >
                            {value}
                        </span>
                        {subtitle && (
                            <span className="text-sm text-slate-400">{subtitle}</span>
                        )}
                    </div>
                    <div
                        className={cn(
                            'rounded-xl p-3',
                            trend === 'up' && 'bg-emerald-500/10 text-emerald-500',
                            trend === 'down' && 'bg-rose-500/10 text-rose-500',
                            trend === 'neutral' && 'bg-slate-500/10 text-slate-400'
                        )}
                    >
                        {icon}
                    </div>
                </div>
            </div>
            {/* Decorative gradient orb */}
            <div
                className={cn(
                    'absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl',
                    trend === 'up' && 'bg-emerald-500',
                    trend === 'down' && 'bg-rose-500',
                    trend === 'neutral' && 'bg-blue-500'
                )}
            />
        </Card>
    );
}

interface KPIGridProps {
    kpiData: KPIData | null;
}

export function KPIGrid({ kpiData }: KPIGridProps) {
    if (!kpiData) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="h-32 animate-pulse bg-slate-900/50" />
                ))}
            </div>
        );
    }

    const isPositive = kpiData.priceChange >= 0;
    const fearGreed = getFearGreedStatus(kpiData.rsi);
    const trendStatus = getTrendStatus(kpiData.price, kpiData.sma200);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Live Price */}
            <KPICard
                title="Current Price"
                value={formatCurrency(kpiData.price)}
                subtitle={formatPercent(kpiData.priceChangePercent)}
                icon={isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                trend={isPositive ? 'up' : 'down'}
            />

            {/* Fear/Greed */}
            <KPICard
                title="Market Sentiment"
                value={fearGreed.label}
                subtitle={`RSI: ${kpiData.rsi.toFixed(0)}`}
                icon={<Activity className="h-6 w-6" />}
                trend={kpiData.rsi >= 70 ? 'up' : kpiData.rsi <= 30 ? 'down' : 'neutral'}
            />

            {/* Distance to ATH */}
            <KPICard
                title="From All-Time High"
                value={formatPercent(kpiData.drawdown)}
                subtitle="Drawdown"
                icon={<Target className="h-6 w-6" />}
                trend={kpiData.drawdown > -10 ? 'up' : 'down'}
            />

            {/* Trend */}
            <KPICard
                title="Market Trend"
                value={trendStatus.label}
                subtitle={trendStatus.icon === 'up' ? '> SMA 200' : '< SMA 200'}
                icon={
                    trendStatus.icon === 'up' ? (
                        <BarChart3 className="h-6 w-6" />
                    ) : (
                        <BarChart3 className="h-6 w-6 rotate-180" />
                    )
                }
                trend={trendStatus.icon === 'up' ? 'up' : 'down'}
            />
        </div>
    );
}
