import { formatCurrency, formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Bell, Search, Wifi, WifiOff, Menu } from 'lucide-react';
import { useTickerData } from '@/hooks/useTickerData';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { tickerData, loading } = useTickerData();

    return (
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl overflow-hidden">
            <div className="flex h-16 items-center justify-between px-4 md:px-6 relative">
                {/* Left: Date and Status (Fixed) */}
                <div className="flex items-center gap-4 z-20 bg-slate-950/80 pr-4">
                    <button 
                        onClick={onMenuClick}
                        className="md:hidden text-slate-400 hover:text-slate-100"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        {isSupabaseConfigured ? (
                            <Wifi className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <WifiOff className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-xs text-slate-500 hidden xl:inline">
                            {isSupabaseConfigured ? 'Live' : 'Demo Mode'}
                        </span>
                    </div>
                    <div className="hidden xl:block h-4 w-px bg-slate-800" />
                    <span className="hidden xl:block text-sm text-slate-400 min-w-max">
                        {formatDate(new Date())}
                    </span>
                </div>

                {/* Center: Infinite Ticker Tape */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden mask-linear-fade">
                    <div className="flex items-center gap-12 animate-ticker whitespace-nowrap">
                        {/* Duplicate the list to create seamless loop */}
                        {[...tickerData, ...tickerData, ...tickerData].map((item, idx) => (
                            <div key={`${item.symbol}-${idx}`} className="flex items-center gap-3">
                                <span className="font-bold text-slate-400 text-sm">{item.symbol}</span>
                                <span className="text-lg font-bold text-slate-100 tabular-nums">
                                    {formatCurrency(item.price)}
                                </span>
                                <span
                                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                        item.changePercent >= 0
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-rose-500/10 text-rose-500'
                                    }`}
                                >
                                    {item.changePercent >= 0 ? '▲' : '▼'}
                                    {Math.abs(item.changePercent).toFixed(2)}%
                                </span>
                            </div>
                        ))}
                        {loading && <span className="text-slate-500 text-sm">Loading market data...</span>}
                    </div>
                </div>

                {/* Right: Actions (Fixed) */}
                <div className="flex items-center gap-3 z-20 bg-slate-950/80 pl-4">
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
            
            {/* CSS for Ticker Animation */}
            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-ticker {
                    animation: ticker 30s linear infinite;
                }
                .mask-linear-fade {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </header>
    );
}
