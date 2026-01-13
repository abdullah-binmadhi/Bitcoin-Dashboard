import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

// Configuration
const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const COINGECKO_KEY = 'CG-unVU5nDtud2jHLq8eBU1shZ2';
const BATCH_SIZE = 100;

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

async function fetchFromCoinGecko(): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.coingecko.com',
            path: '/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=365&interval=daily',
            headers: { 'x-cg-demo-api-key': COINGECKO_KEY }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function run() {
    console.log("📥 Fetching full Ethereum history from CoinGecko...");
    const rawData = await fetchFromCoinGecko();
    
    if (!rawData.prices) {
        console.error("❌ Error from CoinGecko:", rawData);
        return;
    }
    
    const prices = rawData.prices; // [[ts, price], ...]
    
    console.log(`📊 Processing ${prices.length} days of data...`);
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
            open: Math.round(price * 100) / 100,
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

    console.log("🚀 Uploading to Supabase...");
    for (let i = 0; i < processed.length; i += BATCH_SIZE) {
        const batch = processed.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('ethereum_data').upsert(batch, { onConflict: 'date' });
        if (error) {
            console.error("Error upserting:", error);
            break;
        }
        console.log(`✅ Progress: ${i + batch.length}/${processed.length}`);
    }
    console.log("🎉 Ethereum history is now fully populated!");
}

run().catch(console.error);
