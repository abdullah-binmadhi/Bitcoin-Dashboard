import { formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Wifi, WifiOff, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left: Date and Status */}
                <div className="flex items-center gap-4">
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


            </div>
        </header>
    );
}
