import { formatCurrency, formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import type { KPIData } from '@/types/database';

interface HeaderProps {
    kpiData: KPIData | null;
}

export function Header({ kpiData }: HeaderProps) {
    const isPositive = kpiData && kpiData.priceChange >= 0;

    return (
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left: Date and Status */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isSupabaseConfigured ? (
                            <Wifi className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <WifiOff className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-xs text-slate-500">
                            {isSupabaseConfigured ? 'Live' : 'Demo Mode'}
                        </span>
                    </div>
                    <div className="h-4 w-px bg-slate-800" />
                    <span className="text-sm text-slate-400">
                        {formatDate(new Date())}
                    </span>
                </div>

                {/* Center: Live Price Ticker */}
                {kpiData && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-100 tabular-nums">
                                {formatCurrency(kpiData.price)}
                            </span>
                            <span
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${isPositive
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-rose-500/10 text-rose-500'
                                    }`}
                            >
                                {isPositive ? '▲' : '▼'}
                                {Math.abs(kpiData.priceChangePercent).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                        <Search className="h-5 w-5" />
                    </button>
                    <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500" />
                    </button>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500" />
                </div>
            </div>
        </header>
    );
}
