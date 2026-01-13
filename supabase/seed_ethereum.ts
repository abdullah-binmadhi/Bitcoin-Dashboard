import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uzxocjwuisgzldbtppnk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
const CSV_PATH = path.join(__dirname, '../ethereum.csv');
const TABLE_NAME = 'ethereum_data';
const BATCH_SIZE = 500;

interface CSVRow {
    Date: string;
    Close: string;
    High: string;
    Low: string;
    Open: string;
    Volume: string;
}

// Reuse calculation functions (In a real app, these would be shared)
function calculateSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateRSI(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;
    let gains = 0;
    let losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff > 0) gains += diff; else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    if (prices.length < period) return { upper: null, lower: null };
    const slice = prices.slice(-period);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    return { upper: sma + stdDev * std, lower: sma - stdDev * std };
}

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
    console.log(`🚀 Starting Ethereum Database Seed...`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log(`📁 Reading CSV from: ${CSV_PATH}`);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const rows = parseCSV(csvContent);
    console.log(`✅ Found ${rows.length} rows`);

    const prices: number[] = [];
    let maxPrice = 0;
    const processedData: any[] = [];

    for (const row of rows) {
        const close = parseFloat(row.Close);
        prices.push(close);
        if (close > maxPrice) maxPrice = close;

        const sma50 = calculateSMA(prices, 50);
        const sma200 = calculateSMA(prices, 200);
        const rsi = calculateRSI(prices, 14);
        const { upper: bbUpper, lower: bbLower } = calculateBollingerBands(prices, 20, 2);
        const drawdownPct = maxPrice > 0 ? ((close - maxPrice) / maxPrice) * 100 : 0;

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

    console.log(`💾 Upserting to ${TABLE_NAME}...`);
    for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
        const batch = processedData.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(TABLE_NAME).upsert(batch, { onConflict: 'date' });
        if (error) throw error;
        console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} rows`);
    }

    console.log(`\n✅ Ethereum Seed Complete!`);
}

seedDatabase().catch(console.error);
