import { useTickerData, type TickerItem } from '@/hooks/useTickerData';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

function TickerItemDisplay({ item }: { item: TickerItem }) {
    const isPositive = item.changePercent >= 0;

    return (
        <div className="flex items-center gap-3 px-4 py-2 whitespace-nowrap">
            <span className="font-bold text-slate-100">{item.symbol}</span>
            <span className="text-slate-300 tabular-nums">
                ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={cn(
                "flex items-center gap-1 text-sm tabular-nums",
                isPositive ? "text-emerald-500" : "text-rose-500"
            )}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
            </span>
        </div>
    );
}

export function TickerTape() {
    const { tickerData, loading } = useTickerData();

    if (loading || tickerData.length === 0) {
        return (
            <div className="h-10 bg-slate-900/80 border-b border-slate-800 flex items-center justify-center">
                <span className="text-xs text-slate-500">Loading prices...</span>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 border-b border-slate-800 overflow-hidden">
            <div className="flex animate-marquee">
                {/* Duplicate the items for seamless scroll */}
                {[...tickerData, ...tickerData, ...tickerData].map((item, index) => (
                    <TickerItemDisplay key={`${item.symbol}-${index}`} item={item} />
                ))}
            </div>
        </div>
    );
}
