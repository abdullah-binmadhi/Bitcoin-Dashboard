import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const BATCH_SIZE = 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const XRP_TRENDS = [
    { date: '2014-01-01', price: 0.02 },
    { date: '2015-01-01', price: 0.006 },
    { date: '2017-01-01', price: 0.006 },
    { date: '2018-01-04', price: 3.84 }, // All-time peak
    { date: '2018-12-31', price: 0.35 },
    { date: '2020-01-01', price: 0.19 },
    { date: '2021-04-14', price: 1.80 },
    { date: '2022-01-01', price: 0.83 },
    { date: '2023-01-01', price: 0.34 },
    { date: '2024-01-01', price: 0.62 },
    { date: '2025-01-01', price: 2.40 }
];

const SOL_TRENDS = [
    { date: '2020-04-10', price: 0.95 },
    { date: '2021-01-01', price: 1.50 },
    { date: '2021-11-06', price: 260 }, // 2021 Peak
    { date: '2022-12-29', price: 8.00 }, // FTX Bottom
    { date: '2023-01-01', price: 10 },
    { date: '2024-01-01', price: 101 },
    { date: '2025-01-01', price: 190 }
];

function interpolatePrice(dateStr: string, trends: { date: string, price: number }[]) {
    const targetDate = new Date(dateStr).getTime();
    for (let i = 0; i < trends.length - 1; i++) {
        const start = new Date(trends[i].date).getTime();
        const end = new Date(trends[i+1].date).getTime();
        if (targetDate >= start && targetDate <= end) {
            const progress = (targetDate - start) / (end - start);
            const price = trends[i].price + (trends[i+1].price - trends[i].price) * progress;
            return price + (price * (Math.random() * 0.1 - 0.05));
        }
    }
    return trends[trends.length - 1].price;
}

function generateHistory(coin: string, trends: any[], stopDate: string) {
    console.log(`Generating history for ${coin}...`);
    const data = [];
    const startDate = new Date(trends[0].date);
    const endDate = new Date(stopDate);
    const prices: number[] = [];
    let maxPrice = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const price = Math.abs(interpolatePrice(dateStr, trends));
        prices.push(price);
        if (price > maxPrice) maxPrice = price;

        const sma50 = prices.length >= 50 ? prices.slice(-50).reduce((a,b)=>a+b,0)/50 : null;
        const sma200 = prices.length >= 200 ? prices.slice(-200).reduce((a,b)=>a+b,0)/200 : null;
        
        let bbUpper = null, bbLower = null;
        if (prices.length >= 20) {
            const slice = prices.slice(-20);
            const mean = slice.reduce((a,b)=>a+b,0)/20;
            const std = Math.sqrt(slice.reduce((a,b)=>a+Math.pow(b-mean,2),0)/20);
            bbUpper = mean + (2 * std);
            bbLower = mean - (2 * std);
        }

        let rsi = null;
        if (prices.length > 14) {
            let gains = 0, losses = 0;
            for(let k=1; k<=14; k++) {
                const diff = prices[prices.length-k] - prices[prices.length-k-1];
                if(diff > 0) gains += diff; else losses -= diff;
            }
            rsi = 100 - (100 / (1 + (gains/losses || 1)));
        }

        data.push({
            date: dateStr,
            close: price, open: price, high: price, low: price, volume: Math.floor(Math.random() * 500000000),
            sma_50: sma50, sma_200: sma200, rsi: rsi, bb_upper: bbUpper, bb_lower: bbLower,
            drawdown_pct: maxPrice > 0 ? ((price - maxPrice) / maxPrice) * 100 : 0
        });
    }
    return data;
}

async function upload(table: string, data: any[]) {
    console.log(`Uploading ${data.length} rows to ${table}...`);
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(table).upsert(batch, { onConflict: 'date', ignoreDuplicates: true });
        if (error) console.error('Error:', error.message);
    }
}

async function run() {
    const xrpData = generateHistory('xrp', XRP_TRENDS, '2025-01-01');
    await upload('xrp_data', xrpData);

    const solData = generateHistory('solana', SOL_TRENDS, '2025-01-01');
    await upload('solana_data', solData);
}

run().catch(console.error);
