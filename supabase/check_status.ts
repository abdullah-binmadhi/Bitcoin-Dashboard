import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

// Configuration
const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const COINGECKO_KEY = 'CG-unVU5nDtud2jHLq8eBU1shZ2';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function fetchCoinGeckoPrice(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.coingecko.com',
            path: `/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
            headers: { 'x-cg-demo-api-key': COINGECKO_KEY }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function check() {
    console.log("🔍 Checking Database Status...");

    // 1. Check Bitcoin
    const { data: btcData, error: btcError } = await supabase
        .from('bitcoin_data')
        .select('date, close')
        .order('date', { ascending: false })
        .limit(1);

    if (btcError) console.error("❌ BTC DB Error:", btcError);
    const btcDB = btcData?.[0];

    // 2. Check Ethereum
    const { data: ethData, error: ethError } = await supabase
        .from('ethereum_data')
        .select('date, close')
        .order('date', { ascending: false })
        .limit(1);

    if (ethError) console.error("❌ ETH DB Error:", ethError);
    const ethDB = ethData?.[0];

    // 3. Check Live Prices
    const livePrices = await fetchCoinGeckoPrice('bitcoin,ethereum');
    
    console.log("\n--- BITCOIN (BTC) ---");
    console.log(`📅 DB Latest Date: ${btcDB?.date || 'N/A'}`);
    console.log(`💰 DB Close Price: $${btcDB?.close?.toLocaleString() || 'N/A'}`);
    console.log(`🟢 Live Price:     $${livePrices?.bitcoin?.usd?.toLocaleString() || 'N/A'}`);

    console.log("\n--- ETHEREUM (ETH) ---");
    console.log(`📅 DB Latest Date: ${ethDB?.date || 'N/A'}`);
    console.log(`💰 DB Close Price: $${ethDB?.close?.toLocaleString() || 'N/A'}`);
    console.log(`🟢 Live Price:     $${livePrices?.ethereum?.usd?.toLocaleString() || 'N/A'}`);

    // Validation
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (btcDB?.date !== today && btcDB?.date !== yesterday) {
        console.log("\n⚠️  WARNING: Bitcoin data is outdated!");
    } else {
        console.log("\n✅ Bitcoin data is up-to-date.");
    }

    if (ethDB?.date !== today && ethDB?.date !== yesterday) {
        console.log("⚠️  WARNING: Ethereum data is outdated!");
    } else {
        console.log("✅ Ethereum data is up-to-date.");
    }
}

check().catch(console.error);
