import { ChevronDown, Bitcoin } from 'lucide-react';

interface CoinSelectorProps {
    selectedCoin: 'BTC' | 'ETH';
    onChange: (coin: 'BTC' | 'ETH') => void;
}

export function CoinSelector({ selectedCoin, onChange }: CoinSelectorProps) {
    return (
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {selectedCoin === 'BTC' ? (
                    <Bitcoin className="h-4 w-4 text-orange-500" />
                ) : (
                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                    </svg>
                )}
            </div>
            <select
                value={selectedCoin}
                onChange={(e) => onChange(e.target.value as 'BTC' | 'ETH')}
                className="appearance-none bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-800 transition-colors uppercase font-medium"
            >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>
    );
}
