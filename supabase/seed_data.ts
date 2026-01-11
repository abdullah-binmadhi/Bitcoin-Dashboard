/**
 * Project Sentinel - CSV Seed Script
 * 
 * This script reads the Bitcoin CSV data, calculates technical indicators,
 * and seeds the Supabase database.
 * 
 * Usage:
 *   1. Install dependencies: npm install @supabase/supabase-js papaparse dotenv
 *   2. Create a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   3. Run: npx ts-node seed_data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration - Update these or use environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CSV_PATH = path.join(__dirname, '../bitcoin (1).csv');
const BATCH_SIZE = 500;

interface CSVRow {
    Date: string;
    Close: string;
    High: string;
    Low: string;
    Open: string;
    Volume: string;
}

interface BitcoinData {
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
    drawdown_pct: number;
}

// Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

// Calculate RSI
function calculateRSI(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
}

// Calculate Bollinger Bands
function calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stdDev: number = 2
): { upper: number | null; lower: number | null } {
    if (prices.length < period) return { upper: null, lower: null };

    const slice = prices.slice(-period);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
        upper: sma + stdDev * std,
        lower: sma - stdDev * std,
    };
}

// Parse CSV manually (simple implementation)
function parseCSV(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map((line) => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });
        return row as unknown as CSVRow;
    });
}

async function seedDatabase() {
    console.log('🚀 Starting Sentinel Database Seed...\n');

    // Validate configuration
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    // Read and parse CSV
    console.log(`📁 Reading CSV from: ${CSV_PATH}`);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const rows = parseCSV(csvContent);
    console.log(`✅ Found ${rows.length} rows in CSV\n`);

    // Calculate indicators and transform data
    console.log('📊 Calculating technical indicators...');
    const prices: number[] = [];
    let maxPrice = 0;
    const processedData: BitcoinData[] = [];

    for (const row of rows) {
        const close = parseFloat(row.Close);
        prices.push(close);

        // Track max price for drawdown calculation
        if (close > maxPrice) maxPrice = close;

        const sma50 = calculateSMA(prices, 50);
        const sma200 = calculateSMA(prices, 200);
        const rsi = calculateRSI(prices, 14);
        const { upper: bbUpper, lower: bbLower } = calculateBollingerBands(prices, 20, 2);
        const drawdownPct = ((close - maxPrice) / maxPrice) * 100;

        processedData.push({
            date: row.Date,
            close,
            open: parseFloat(row.Open),
            high: parseFloat(row.High),
            low: parseFloat(row.Low),
            volume: parseFloat(row.Volume),
            sma_50: sma50 ? Math.round(sma50 * 100) / 100 : null,
            sma_200: sma200 ? Math.round(sma200 * 100) / 100 : null,
            rsi: rsi ? Math.round(rsi * 100) / 100 : null,
            bb_upper: bbUpper ? Math.round(bbUpper * 100) / 100 : null,
            bb_lower: bbLower ? Math.round(bbLower * 100) / 100 : null,
            drawdown_pct: Math.round(drawdownPct * 100) / 100,
        });
    }

    console.log(`✅ Processed ${processedData.length} data points with indicators\n`);

    // Batch upsert to Supabase
    console.log(`💾 Upserting data to Supabase in batches of ${BATCH_SIZE}...`);
    let totalUpserted = 0;
    const totalBatches = Math.ceil(processedData.length / BATCH_SIZE);

    for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
        const batch = processedData.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;

        const { error } = await supabase
            .from('bitcoin_data')
            .upsert(batch, { onConflict: 'date' });

        if (error) {
            console.error(`❌ Error upserting batch ${batchNum}:`, error);
            throw error;
        }

        totalUpserted += batch.length;
        console.log(`   Batch ${batchNum}/${totalBatches}: ${batch.length} rows upserted (${totalUpserted} total)`);
    }

    console.log(`\n✅ Successfully seeded ${totalUpserted} rows to Supabase!`);
    console.log('\n🎉 Database seed complete. Your Sentinel dashboard is ready!');
}

// Run the seed
seedDatabase().catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
});
