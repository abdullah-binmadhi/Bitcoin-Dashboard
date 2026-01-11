import type { BitcoinData } from '@/types/database';

// Generate realistic mock Bitcoin data with technical indicators
export function generateMockData(days: number): BitcoinData[] {
    const data: BitcoinData[] = [];
    const today = new Date();

    // Start with a base price and simulate realistic price movement
    let price = 45000;
    let maxPrice = price;
    const volatility = 0.03; // 3% daily volatility

    // Arrays for calculating moving averages
    const prices: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Simulate realistic price movement with trend
        const trend = Math.sin((days - i) / 30) * 0.001; // Slow oscillation
        const randomWalk = (Math.random() - 0.5) * 2 * volatility;
        const change = trend + randomWalk;

        price = price * (1 + change);
        price = Math.max(price, 10000); // Floor at $10k
        price = Math.min(price, 100000); // Cap at $100k

        prices.push(price);

        // Calculate Open, High, Low
        const dailyVolatility = price * volatility * 0.5;
        const open = price * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(price, open) + Math.random() * dailyVolatility;
        const low = Math.min(price, open) - Math.random() * dailyVolatility;

        // Calculate SMA 50
        let sma50: number | null = null;
        if (prices.length >= 50) {
            const last50 = prices.slice(-50);
            sma50 = last50.reduce((a, b) => a + b, 0) / 50;
        }

        // Calculate SMA 200
        let sma200: number | null = null;
        if (prices.length >= 200) {
            const last200 = prices.slice(-200);
            sma200 = last200.reduce((a, b) => a + b, 0) / 200;
        }

        // Calculate RSI (simplified)
        let rsi: number | null = null;
        if (prices.length >= 15) {
            const last15 = prices.slice(-15);
            let gains = 0;
            let losses = 0;
            for (let j = 1; j < last15.length; j++) {
                const diff = last15[j] - last15[j - 1];
                if (diff > 0) gains += diff;
                else losses -= diff;
            }
            const avgGain = gains / 14;
            const avgLoss = losses / 14;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi = 100 - 100 / (1 + rs);
        }

        // Calculate Bollinger Bands
        let bbUpper: number | null = null;
        let bbLower: number | null = null;
        if (prices.length >= 20) {
            const last20 = prices.slice(-20);
            const sma20 = last20.reduce((a, b) => a + b, 0) / 20;
            const variance = last20.reduce((a, b) => a + Math.pow(b - sma20, 2), 0) / 20;
            const stdDev = Math.sqrt(variance);
            bbUpper = sma20 + 2 * stdDev;
            bbLower = sma20 - 2 * stdDev;
        }

        // Calculate Drawdown
        if (price > maxPrice) maxPrice = price;
        const drawdownPct = ((price - maxPrice) / maxPrice) * 100;

        // Generate realistic volume
        const baseVolume = 30000000000; // $30B base
        const volumeVariation = 0.5;
        const volume = baseVolume * (1 + (Math.random() - 0.5) * 2 * volumeVariation);

        data.push({
            id: days - i,
            date: date.toISOString().split('T')[0],
            close: Math.round(price * 100) / 100,
            open: Math.round(open * 100) / 100,
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            volume: Math.round(volume),
            sma_50: sma50 ? Math.round(sma50 * 100) / 100 : null,
            sma_200: sma200 ? Math.round(sma200 * 100) / 100 : null,
            rsi: rsi ? Math.round(rsi * 100) / 100 : null,
            bb_upper: bbUpper ? Math.round(bbUpper * 100) / 100 : null,
            bb_lower: bbLower ? Math.round(bbLower * 100) / 100 : null,
            drawdown_pct: Math.round(drawdownPct * 100) / 100,
        });
    }

    return data;
}

// Generate daily returns for histogram
export function calculateDailyReturns(data: BitcoinData[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
        const pctChange = ((data[i].close - data[i - 1].close) / data[i - 1].close) * 100;
        returns.push(Math.round(pctChange * 100) / 100);
    }
    return returns;
}

// Bin returns for histogram
export function binReturns(returns: number[], bins = 20): { bin: string; count: number; start: number; end: number }[] {
    if (returns.length === 0) return [];

    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const binWidth = (max - min) / bins;

    const histogram: { bin: string; count: number; start: number; end: number }[] = [];

    for (let i = 0; i < bins; i++) {
        const start = min + i * binWidth;
        const end = start + binWidth;
        const count = returns.filter((r) => r >= start && r < end).length;
        histogram.push({
            bin: `${start.toFixed(1)}%`,
            count,
            start,
            end,
        });
    }

    return histogram;
}
