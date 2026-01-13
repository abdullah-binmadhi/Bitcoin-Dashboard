import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkYears() {
    console.log("📊 Checking Yearly Data Counts...");

    const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

    console.log("\n--- BITCOIN ---");
    for (const year of years) {
        const { count } = await supabase
            .from('bitcoin_data')
            .select('id', { count: 'exact', head: true })
            .gte('date', `${year}-01-01`)
            .lte('date', `${year}-12-31`);
        
        console.log(`${year}: ${count} rows`);
    }

    console.log("\n--- ETHEREUM ---");
    for (const year of years) {
        const { count } = await supabase
            .from('ethereum_data')
            .select('id', { count: 'exact', head: true })
            .gte('date', `${year}-01-01`)
            .lte('date', `${year}-12-31`);
        
        console.log(`${year}: ${count} rows`);
    }
}

checkYears();
