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
        // AI Insight Generation
        const insight = await generateInsight(coin.id, processed);
        processed.market_insight = insight;

        const { error } = await supabase.from(coin.table).upsert(processed, { onConflict: 'date' })
        if (error) throw error
        return `${coin.id} updated with insight`
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

// AI Analysis Function
async function generateInsight(coin: string, data: any) {
    try {
        const prompt = `
        Act as a professional crypto technical analyst. 
        Analyze these indicators for ${coin.toUpperCase()}:
        - Price: $${data.close}
        - RSI (14): ${data.rsi.toFixed(2)}
        - 50 SMA: $${data.sma_50.toFixed(2)}
        - 200 SMA: $${data.sma_200.toFixed(2)}
        - Bollinger Bands: Upper $${data.bb_upper.toFixed(2)}, Lower $${data.bb_lower.toFixed(2)}
        - Drawdown: ${data.drawdown_pct.toFixed(2)}%

        Provide a ONE SENTENCE actionable insight. 
        Focus on whether it's overbought/oversold, trend direction (golden cross/death cross), or volatility squeeze.
        Do not state the numbers, just the conclusion.
        Example: "RSI indicates oversold conditions while price touches the lower Bollinger Band, suggesting a potential bounce."
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const resData = await response.json();
        return resData.candidates?.[0]?.content?.parts?.[0]?.text || "Market conditions are neutral.";

    } catch (e) {
        console.error("AI Insight Error:", e);
        return "Market data available, awaiting analysis.";
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
    drawdown_pct: drawdown,
    // market_insight will be added by the async function
  }
}

function calculateSMA(data: number[], period: number) {
  if (data.length < period) return 0 // Return 0 instead of null for safety
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
