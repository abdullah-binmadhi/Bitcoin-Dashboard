import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const COINGECKO_KEY = 'CG-unVU5nDtud2jHLq8eBU1shZ2';
const BATCH_SIZE = 500;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Indicators (Reused)
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
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    return { upper: mean + 2 * std, lower: mean - 2 * std };
}

function toUnix(dateStr: string) { return Math.floor(new Date(dateStr).getTime() / 1000); }

async function fetchRange(coinId: string, start: string, end: string): Promise<any> {
    const from = toUnix(start);
    const to = toUnix(end);
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.coingecko.com',
            path: `/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`,
            headers: { 'x-cg-demo-api-key': COINGECKO_KEY }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function populateCoin(coinId: string, table: string, startYear: number) {
    console.log(`🚀 Starting ${coinId} history fetch (from ${startYear})...`);
    
    // Generate ranges from startYear to 2026
    const ranges = [];
    for (let y = 2026; y >= startYear; y--) {
        ranges.push({ start: `${y}-01-01`, end: `${y+1}-01-02` });
    }

    let allPrices: [number, number][] = [];

    for (const range of ranges) {
        console.log(`   📥 Fetching ${range.start} to ${range.end}...`);
        const data = await fetchRange(coinId, range.start, range.end);
        
        if (data.prices && Array.isArray(data.prices)) {
            allPrices = [...allPrices, ...data.prices];
        } else {
            console.warn(`   ⚠️ Warning: No data for range or error:`, data.error || 'Empty');
        }
        await new Promise(r => setTimeout(r, 1500)); // Rate limit
    }

    // Deduplicate
    allPrices.sort((a, b) => a[0] - b[0]);
    const uniqueMap = new Map();
    allPrices.forEach(([ts, price]) => {
        const date = new Date(ts).toISOString().split('T')[0];
        uniqueMap.set(date, price);
    });

    console.log(`   📊 Processing ${uniqueMap.size} unique days...`);

    const closePrices: number[] = [];
    let maxPrice = 0;
    const processed = [];
    const sortedEntries = Array.from(uniqueMap.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

    for (const [date, price] of sortedEntries) {
        closePrices.push(price);
        if (price > maxPrice) maxPrice = price;
        const { upper, lower } = calculateBollingerBands(closePrices, 20);

        processed.push({
            date,
            close: price,
            open: price, high: price, low: price, volume: 0, // Simplified OHLC
            sma_50: calculateSMA(closePrices, 50),
            sma_200: calculateSMA(closePrices, 200),
            rsi: calculateRSI(closePrices, 14),
            bb_upper: upper, bb_lower: lower,
            drawdown_pct: ((price - maxPrice) / maxPrice) * 100
        });
    }

    console.log(`   💾 Uploading to ${table}...`);
    for (let i = 0; i < processed.length; i += BATCH_SIZE) {
        const batch = processed.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(table).upsert(batch, { onConflict: 'date' });
        if (error) console.error("   ❌ Upsert Error:", error.message);
    }
    console.log(`   ✅ ${coinId} Done!`);
}

async function run() {
    await populateCoin('ripple', 'xrp_data', 2014);
    await populateCoin('solana', 'solana_data', 2020);
}

run().catch(console.error);
