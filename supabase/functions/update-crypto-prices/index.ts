import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
// Hardcoded Gemini Key for immediate use
const GEMINI_KEY = 'AIzaSyBUkcOviuRg5vha4r43p4ywWQMbo1XG-Mw';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const coingeckoKey = Deno.env.get('COINGECKO_KEY') ?? 'CG-unVU5nDtud2jHLq8eBU1shZ2'
    const supabase = createClient(supabaseUrl, supabaseKey)

    const coins = [
      { id: 'bitcoin', table: 'bitcoin_data' },
      { id: 'ethereum', table: 'ethereum_data' },
      { id: 'ripple', table: 'xrp_data' },
      { id: 'solana', table: 'solana_data' }
    ]

    const updates = await Promise.all(coins.map(async (coin) => {
      const raw = await fetchData(coin.id, coingeckoKey)
      const processed = processData(raw)
      
      if (processed) {
        // AI Insight Generation (Multi-Persona)
        const insights = await generatePersonaInsights(coin.id, processed);
        
        // Merge insights into the data object
        processed.orbit_insight = insights.orbit;
        processed.mechanic_insight = insights.mechanic;
        processed.risk_insight = insights.risk;
        processed.market_insight = insights.mechanic; // Keep backward compatibility for Architect

        const { error } = await supabase.from(coin.table).upsert(processed, { onConflict: 'date' })
        if (error) throw error
        return `${coin.id} updated with 3-persona insights`
      }
      return `${coin.id} skipped`
    }))

    return new Response(
      JSON.stringify({ success: true, updates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function fetchData(coinId: string, apiKey: string) {
  const url = `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=60&interval=daily`
  const res = await fetch(url, { headers: { 'x-cg-demo-api-key': apiKey } })
  if (!res.ok) throw new Error(`CoinGecko API Error for ${coinId}: ${res.statusText}`)
  return await res.json()
}

// AI Analysis Function (Multi-Persona)
async function generatePersonaInsights(coin: string, data: any) {
    try {
        const prompt = `
        Analyze this crypto data for ${coin.toUpperCase()}:
        Price: $${data.close}
        RSI (14): ${data.rsi.toFixed(2)}
        50 SMA: $${data.sma_50.toFixed(2)}
        200 SMA: $${data.sma_200.toFixed(2)}
        Bollinger: Upper $${data.bb_upper.toFixed(2)}, Lower $${data.bb_lower.toFixed(2)}
        Drawdown: ${data.drawdown_pct.toFixed(2)}%

        Generate 3 distinct insights (1 sentence each) in JSON format:
        1. "orbit": Executive Summary. Is the trend generally healthy? Key level to watch.
        2. "mechanic": Technical detail. Mention specific indicators (RSI divergence, SMA cross, BB squeeze).
        3. "risk": Risk Assessment. Is it overextended? Safe to enter? Volatility warning.

        Return strictly RAW JSON:
        {
            "orbit": "...",
            "mechanic": "...",
            "risk": "..."
        }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const resData = await response.json();
        
        let rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("No AI response");

        // Clean markdown
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(rawText);

    } catch (e) {
        console.error("AI Insight Error:", e);
        return {
            orbit: "Market data analysis unavailable.",
            mechanic: "Technical indicators require fresh data.",
            risk: "Risk metrics calculation pending."
        };
    }
}

function processData(data: any) {
  if (!data || !data.prices) return null
  const prices = data.prices
  const priceValues = prices.map((p: any) => p[1])
  const lastIndex = prices.length - 1
  const latestPrice = prices[lastIndex][1]
  const latestTs = prices[lastIndex][0]
  
  const sma50 = calculateSMA(priceValues, 50)
  const sma200 = calculateSMA(priceValues, 200)
  const rsi = calculateRSI(priceValues, 14)
  const { upper, lower } = calculateBollingerBands(priceValues, 20)
  const maxPrice = Math.max(...priceValues)
  const drawdown = ((latestPrice - maxPrice) / maxPrice) * 100

  return {
    date: new Date(latestTs).toISOString().split('T')[0],
    close: latestPrice, open: latestPrice, high: latestPrice, low: latestPrice,
    volume: data.total_volumes[lastIndex][1] || 0,
    sma_50: sma50, sma_200: sma200, rsi: rsi, bb_upper: upper, bb_lower: lower,
    drawdown_pct: drawdown
  }
}

function calculateSMA(data: number[], period: number) {
  if (data.length < period) return 0
  return data.slice(-period).reduce((a, b) => a + b, 0) / period
}

function calculateRSI(data: number[], period: number = 14) {
  if (data.length <= period) return 50
  let gains = 0, losses = 0
  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i] - data[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
  }
  return losses === 0 ? 100 : 100 - (100 / (1 + (gains / Math.abs(losses))))
}

function calculateBollingerBands(data: number[], period: number = 20) {
  if (data.length < period) return { upper: 0, lower: 0 }
  const slice = data.slice(-period)
  const mean = slice.reduce((a, b) => a + b, 0) / period
  const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period)
  return { upper: mean + 2 * std, lower: mean - 2 * std }
}