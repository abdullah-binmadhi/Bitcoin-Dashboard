import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

// Configuration
const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const COINGECKO_KEY = 'CG-unVU5nDtud2jHLq8eBU1shZ2';
const BATCH_SIZE = 500;

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

// Convert date "YYYY-MM-DD" to UNIX timestamp
function toUnix(dateStr: string) {
    return Math.floor(new Date(dateStr).getTime() / 1000);
}

async function fetchRange(start: string, end: string): Promise<any> {
    const from = toUnix(start);
    const to = toUnix(end);
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.coingecko.com',
            path: `/api/v3/coins/ethereum/market_chart/range?vs_currency=usd&from=${from}&to=${to}`,
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
    console.log("🚀 Starting Chunked Historical Fetch for Ethereum...");

    // Ranges to fetch (Overlapping slightly to ensure continuity)
    const ranges = [
        { start: '2025-01-01', end: '2026-01-13' }, // Current
        { start: '2024-01-01', end: '2025-01-02' },
        { start: '2023-01-01', end: '2024-01-02' },
        { start: '2022-01-01', end: '2023-01-02' },
        { start: '2021-01-01', end: '2022-01-02' },
        { start: '2020-01-01', end: '2021-01-02' },
        { start: '2019-01-01', end: '2020-01-02' },
        { start: '2018-01-01', end: '2019-01-02' },
        { start: '2017-01-01', end: '2018-01-02' },
        { start: '2016-01-01', end: '2017-01-02' },
        { start: '2015-08-07', end: '2016-01-02' } // ETH Genesis approx
    ];

    let allPrices: [number, number][] = [];

    // 1. Fetch ALL raw data first
    for (const range of ranges) {
        console.log(`📥 Fetching ${range.start} to ${range.end}...`);
        const data = await fetchRange(range.start, range.end);
        
        if (data.prices && Array.isArray(data.prices)) {
            console.log(`   ✅ Got ${data.prices.length} points`);
            allPrices = [...allPrices, ...data.prices];
        } else {
            console.error(`   ❌ Error fetching range:`, data);
        }
        
        // Wait 2s to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
    }

    // 2. Sort and Deduplicate
    allPrices.sort((a, b) => a[0] - b[0]);
    const uniquePricesMap = new Map();
    allPrices.forEach(([ts, price]) => {
        // Normalize to date string to dedupe daily points
        const date = new Date(ts).toISOString().split('T')[0];
        uniquePricesMap.set(date, price); // Last write wins
    });

    console.log(`📊 Total Unique Days: ${uniquePricesMap.size}`);

    // 3. Process Indicators
    const closePrices: number[] = [];
    let maxPrice = 0;
    const processed = [];

    // Convert map to sorted array for processing
    const sortedEntries = Array.from(uniquePricesMap.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

    for (const [date, price] of sortedEntries) {
        closePrices.push(price);
        if (price > maxPrice) maxPrice = price;

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

    // 4. Upload
    console.log("🚀 Uploading full history to Supabase...");
    for (let i = 0; i < processed.length; i += BATCH_SIZE) {
        const batch = processed.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('ethereum_data').upsert(batch, { onConflict: 'date' });
        if (error) {
            console.error("Error upserting:", error);
        } else {
            console.log(`✅ Upserted ${i + batch.length}/${processed.length}`);
        }
    }

    console.log("🎉 Complete!");
}

run().catch(console.error);
