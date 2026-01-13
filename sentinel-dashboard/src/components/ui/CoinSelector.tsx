import { ChevronDown, Bitcoin, Hexagon, Coins, Gem } from 'lucide-react';

interface CoinSelectorProps {
    selectedCoin: 'BTC' | 'ETH' | 'XRP' | 'SOL';
    onChange: (coin: 'BTC' | 'ETH' | 'XRP' | 'SOL') => void;
}

export function CoinSelector({ selectedCoin, onChange }: CoinSelectorProps) {
    const getIcon = () => {
        switch (selectedCoin) {
            case 'BTC': return <Bitcoin className="h-4 w-4 text-orange-500" />;
            case 'ETH': return <Hexagon className="h-4 w-4 text-blue-500" />;
            case 'XRP': return <Coins className="h-4 w-4 text-slate-100" />;
            case 'SOL': return <Gem className="h-4 w-4 text-purple-500" />;
        }
    };

    return (
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {getIcon()}
            </div>
            <select
                value={selectedCoin}
                onChange={(e) => onChange(e.target.value as any)}
                className="appearance-none bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg pl-10 pr-8 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-800 transition-colors uppercase font-medium"
            >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="XRP">Ripple (XRP)</option>
                <option value="SOL">Solana (SOL)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>
    );
}
