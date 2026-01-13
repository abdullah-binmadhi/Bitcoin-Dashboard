import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

// Configuration
const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const COINGECKO_KEY = 'CG-unVU5nDtud2jHLq8eBU1shZ2';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function calculateSMA(prices: number[], period: number) {
    if (prices.length < period) return null;
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateRSI(prices: number[], period: number = 14) {
    if (prices.length < period + 1) return null;
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff > 0) gains += diff; else losses -= diff;
    }
    const rs = (gains / period) / (losses / period);
    return 100 - (100 / (1 + rs));
}

function calculateBollingerBands(prices: number[], period: number = 20) {
    if (prices.length < period) return { upper: null, lower: null };
    const slice = prices.slice(-period);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    return { upper: sma + 2 * std, lower: sma - 2 * std };
}

async function fetchHistory(coin: 'bitcoin' | 'ethereum', days: number): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.coingecko.com',
            path: `/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
            headers: { 'x-cg-demo-api-key': COINGECKO_KEY }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function processAndUpload(coin: 'bitcoin' | 'ethereum', table: string) {
    console.log(`📥 Fetching ${coin} data...`);
    const rawData = await fetchHistory(coin, 90); // Last 90 days to repair recent history
    
    if (!rawData.prices) {
        console.error(`❌ Error fetching ${coin}:`, rawData);
        return;
    }

    const prices = rawData.prices;
    console.log(`📊 Processing ${prices.length} days for ${coin}...`);
    
    const closePrices: number[] = [];
    let maxPrice = 0;
    const processed = [];

    for (const [ts, price] of prices) {
        closePrices.push(price);
        if (price > maxPrice) maxPrice = price;
        
        const date = new Date(ts).toISOString().split('T')[0];
        const { upper, lower } = calculateBollingerBands(closePrices, 20);
        
        processed.push({
            date,
            close: Math.round(price * 100) / 100,
            open: Math.round(price * 100) / 100, // CG doesn't give OHLC here, using Close as proxy
            high: Math.round(price * 100) / 100,
            low: Math.round(price * 100) / 100,
            volume: 0,
            sma_50: calculateSMA(closePrices, 50),
            sma_200: calculateSMA(closePrices, 200),
            rsi: calculateRSI(closePrices, 14),
            bb_upper: upper,
            bb_lower: lower,
            drawdown_pct: ((price - maxPrice) / maxPrice) * 100
        });
    }

    // Deduplicate by date (keep the last occurrence)
    const uniqueProcessed = Array.from(
        new Map(processed.map(item => [item.date, item])).values()
    );

    console.log(`🚀 Updating ${table} with ${uniqueProcessed.length} unique rows...`);
    const { error } = await supabase.from(table).upsert(uniqueProcessed, { onConflict: 'date' });
    
    if (error) console.error(`❌ Error updating ${table}:`, error);
    else console.log(`✅ ${coin} updated successfully!`);
}

async function run() {
    await processAndUpload('bitcoin', 'bitcoin_data');
    await processAndUpload('ethereum', 'ethereum_data');
}

run().catch(console.error);
