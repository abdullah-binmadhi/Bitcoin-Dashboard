/**
 * Project Sentinel - n8n Workflow Configuration
 * 
 * This file contains the JavaScript code for the n8n Code node
 * that calculates technical indicators from CoinGecko API data.
 * 
 * WORKFLOW STRUCTURE:
 * 1. Cron Trigger -> Every 60 minutes
 * 2. HTTP Request -> GET CoinGecko API
 * 3. Code Node -> This script
 * 4. Supabase Node -> Upsert to bitcoin_data table
 */

// =============================================
// n8n Code Node - Technical Indicator Calculator
// =============================================

// Input: Raw price data from CoinGecko API
// The HTTP Request node should call:
// https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365

// Helper Functions
function calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateRSI(prices, period = 14) {
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
    return 100 - (100 / (1 + rs));
}

function calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return { upper: null, lower: null };

    const slice = prices.slice(-period);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
        upper: sma + (stdDev * std),
        lower: sma - (stdDev * std)
    };
}

// Main processing function
function processMarketData(items) {
    // Get the raw data from the HTTP Request node
    const rawData = items[0].json;

    // CoinGecko returns: { prices: [[timestamp, price], ...], ... }
    const priceData = rawData.prices || [];

    if (priceData.length === 0) {
        throw new Error('No price data received from CoinGecko API');
    }

    // Extract just the closing prices and track max for drawdown
    const closePrices = [];
    let maxPrice = 0;

    const results = [];

    for (const [timestamp, price] of priceData) {
        closePrices.push(price);

        // Update max price
        if (price > maxPrice) maxPrice = price;

        // Convert timestamp to date string
        const date = new Date(timestamp).toISOString().split('T')[0];

        // Calculate indicators
        const sma50 = calculateSMA(closePrices, 50);
        const sma200 = calculateSMA(closePrices, 200);
        const rsi = calculateRSI(closePrices, 14);
        const { upper: bbUpper, lower: bbLower } = calculateBollingerBands(closePrices, 20, 2);
        const drawdownPct = ((price - maxPrice) / maxPrice) * 100;

        results.push({
            date,
            close: Math.round(price * 100) / 100,
            open: Math.round(price * 100) / 100, // CoinGecko doesn't provide OHLC in this endpoint
            high: Math.round(price * 100) / 100,
            low: Math.round(price * 100) / 100,
            volume: 0, // Volume not available in this endpoint
            sma_50: sma50 ? Math.round(sma50 * 100) / 100 : null,
            sma_200: sma200 ? Math.round(sma200 * 100) / 100 : null,
            rsi: rsi ? Math.round(rsi * 100) / 100 : null,
            bb_upper: bbUpper ? Math.round(bbUpper * 100) / 100 : null,
            bb_lower: bbLower ? Math.round(bbLower * 100) / 100 : null,
            drawdown_pct: Math.round(drawdownPct * 100) / 100
        });
    }

    // Return only the last 30 days for upsert (to avoid duplicates)
    // Or you can return all and rely on Supabase's upsert on date
    return results.slice(-30);
}

// n8n Code Node entry point
// Uncomment this when using in n8n:
// return items.map(item => {
//   const processedData = processMarketData($input.all());
//   return processedData.map(row => ({ json: row }));
// }).flat();

// For testing outside n8n:
module.exports = { processMarketData, calculateSMA, calculateRSI, calculateBollingerBands };


// =============================================
// n8n WORKFLOW JSON TEMPLATE
// =============================================
/*
{
  "name": "Sentinel Bitcoin Data Sync",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "hoursInterval": 1 }]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart",
        "options": {},
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "x-cg-demo-api-key", "value": "CG-unVU5nDtud2jHLq8eBU1shZ2" }
          ]
        },
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            { "name": "vs_currency", "value": "usd" },
            { "name": "days", "value": "365" }
          ]
        }
      },
      "name": "CoinGecko API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "// Paste the processMarketData function and helper functions here\n// Then call: return processMarketData($input.all());"
      },
      "name": "Calculate Indicators",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "resource": "row",
        "operation": "upsert",
        "projectId": "YOUR_PROJECT_ID",
        "tableId": "bitcoin_data",
        "fieldsUi": {
          "fieldValues": [
            { "fieldName": "date", "fieldValue": "={{ $json.date }}" },
            { "fieldName": "close", "fieldValue": "={{ $json.close }}" },
            { "fieldName": "sma_50", "fieldValue": "={{ $json.sma_50 }}" },
            { "fieldName": "sma_200", "fieldValue": "={{ $json.sma_200 }}" },
            { "fieldName": "rsi", "fieldValue": "={{ $json.rsi }}" },
            { "fieldName": "bb_upper", "fieldValue": "={{ $json.bb_upper }}" },
            { "fieldName": "bb_lower", "fieldValue": "={{ $json.bb_lower }}" },
            { "fieldName": "drawdown_pct", "fieldValue": "={{ $json.drawdown_pct }}" }
          ]
        },
        "options": {
          "conflictColumn": "date"
        }
      },
      "name": "Supabase Upsert",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [850, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": { "main": [[{ "node": "CoinGecko API", "type": "main", "index": 0 }]] },
    "CoinGecko API": { "main": [[{ "node": "Calculate Indicators", "type": "main", "index": 0 }]] },
    "Calculate Indicators": { "main": [[{ "node": "Supabase Upsert", "type": "main", "index": 0 }]] }
  }
}
*/
