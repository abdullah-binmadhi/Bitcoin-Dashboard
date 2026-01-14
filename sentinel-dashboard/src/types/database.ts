export interface BitcoinData {
    id: number;
    date: string;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    sma_50: number | null;
    sma_200: number | null;
    rsi: number | null;
    bb_upper: number | null;
    bb_lower: number | null;
    drawdown_pct: number | null;
    market_insight?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Database {
    public: {
        Tables: {
            bitcoin_data: {
                Row: BitcoinData;
                Insert: Omit<BitcoinData, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<BitcoinData, 'id'>>;
            };
        };
    };
}

export interface KPIData {
    price: number;
    priceChange: number;
    priceChangePercent: number;
    rsi: number;
    drawdown: number;
    trend: 'bullish' | 'bearish';
    sma50: number;
    sma200: number;
    bbUpper: number;
    bbLower: number;
}
