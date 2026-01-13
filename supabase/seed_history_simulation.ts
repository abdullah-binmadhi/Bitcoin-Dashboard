import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const BATCH_SIZE = 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Macro trends to guide the simulation (Approximate price targets)
const BTC_TRENDS = [
    { date: '2014-01-01', price: 750 },
    { date: '2015-01-01', price: 315 },
    { date: '2016-01-01', price: 430 },
    { date: '2017-01-01', price: 990 },
    { date: '2017-12-17', price: 19000 }, // 2017 Peak
    { date: '2018-12-15', price: 3200 },  // 2018 Bottom
    { date: '2019-06-26', price: 12000 },
    { date: '2020-03-12', price: 5000 },  // Covid crash
    { date: '2021-04-14', price: 63000 }, // 2021 Peak 1
    { date: '2021-11-08', price: 67000 }, // 2021 Peak 2
    { date: '2022-11-21', price: 16000 }, // FTX Crash
    { date: '2023-01-01', price: 16600 },
    { date: '2024-01-01', price: 42000 },
    { date: '2025-01-01', price: 95000 }  // Recent
];

const ETH_TRENDS = [
    { date: '2015-08-07', price: 2.77 },
    { date: '2016-01-01', price: 0.94 },
    { date: '2017-01-01', price: 8.00 },
    { date: '2017-06-12', price: 400 },
    { date: '2018-01-13', price: 1400 },  // 2018 Peak
    { date: '2018-12-15', price: 85 },    // 2018 Bottom
    { date: '2019-06-26', price: 330 },
    { date: '2020-03-12', price: 110 },
    { date: '2021-05-11', price: 4100 },  // 2021 Peak 1
    { date: '2021-11-08', price: 4800 },  // 2021 Peak 2
    { date: '2022-06-18', price: 1000 },
    { date: '2023-01-01', price: 1200 },
    { date: '2024-01-01', price: 2300 },
    { date: '2025-01-01', price: 3400 }
];

function interpolatePrice(dateStr: string, trends: { date: string, price: number }[]) {
    const targetDate = new Date(dateStr).getTime();
    
    // Find surrounding trend points
    for (let i = 0; i < trends.length - 1; i++) {
        const start = new Date(trends[i].date).getTime();
        const end = new Date(trends[i+1].date).getTime();
        
        if (targetDate >= start && targetDate <= end) {
            const progress = (targetDate - start) / (end - start);
            const price = trends[i].price + (trends[i+1].price - trends[i].price) * progress;
            // Add some random noise/volatility (±5%)
            const noise = price * (Math.random() * 0.1 - 0.05);
            return price + noise;
        }
    }
    return trends[trends.length - 1].price;
}

function generateHistory(coin: 'bitcoin' | 'ethereum', trends: any[]) {
    console.log(`Generating history for ${coin}...`);
    const data = [];
    const startDate = new Date(trends[0].date);
    const endDate = new Date('2025-01-01'); // Stop before recent real data starts
    const prices: number[] = [];
    let maxPrice = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const price = Math.abs(interpolatePrice(dateStr, trends)); // Ensure positive
        
        prices.push(price);
        if (price > maxPrice) maxPrice = price;

        const sma50 = prices.length >= 50 ? prices.slice(-50).reduce((a,b) => a+b, 0)/50 : null;
        const sma200 = prices.length >= 200 ? prices.slice(-200).reduce((a,b) => a+b, 0)/200 : null;
        
        // Simple BB calc
        let bbUpper = null, bbLower = null;
        if (prices.length >= 20) {
            const slice = prices.slice(-20);
            const mean = slice.reduce((a,b) => a+b,0)/20;
            const std = Math.sqrt(slice.reduce((a,b) => a + Math.pow(b-mean,2),0)/20);
            bbUpper = mean + (2 * std);
            bbLower = mean - (2 * std);
        }

        // RSI
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
            close: price,
            open: price * (1 + (Math.random() * 0.02 - 0.01)),
            high: price * (1 + Math.random() * 0.03),
            low: price * (1 - Math.random() * 0.03),
            volume: Math.floor(Math.random() * 1000000000),
            sma_50: sma50,
            sma_200: sma200,
            rsi: rsi,
            bb_upper: bbUpper,
            bb_lower: bbLower,
            drawdown_pct: maxPrice > 0 ? ((price - maxPrice) / maxPrice) * 100 : 0
        });
    }
    return data;
}

async function upload(table: string, data: any[]) {
    console.log(`Uploading ${data.length} rows to ${table}...`);
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        // On conflict, we DO NOT update if it exists (preserve real data if any)
        // Actually, we use ignoreDuplicates: true to only fill gaps
        const { error } = await supabase.from(table).upsert(batch, { onConflict: 'date', ignoreDuplicates: true });
        if (error) console.error('Error:', error);
        else console.log(`   Batch ${Math.floor(i/BATCH_SIZE)+1} done.`);
    }
}

async function run() {
    const btcData = generateHistory('bitcoin', BTC_TRENDS);
    await upload('bitcoin_data', btcData);

    const ethData = generateHistory('ethereum', ETH_TRENDS);
    await upload('ethereum_data', ethData);
}

run().catch(console.error);
