import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3'
// Note: In Edge Functions, you set secrets via CLI: supabase secrets set COINGECKO_KEY=...
// For now, we will assume it's set or use the demo key in headers if needed.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const coingeckoKey = Deno.env.get('COINGECKO_KEY') ?? 'CG-unVU5nDtud2jHLq8eBU1shZ2'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. Fetch Data for BTC and ETH
    const results = await Promise.all([
      fetchData('bitcoin', coingeckoKey),
      fetchData('ethereum', coingeckoKey)
    ])

    // 3. Upsert to Database
    const btcData = processData(results[0], 'bitcoin')
    const ethData = processData(results[1], 'ethereum')

    // Upsert BTC
    if (btcData) {
      const { error } = await supabase.from('bitcoin_data').upsert(btcData, { onConflict: 'date' })
      if (error) throw error
    }

    // Upsert ETH
    if (ethData) {
      const { error } = await supabase.from('ethereum_data').upsert(ethData, { onConflict: 'date' })
      if (error) throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Crypto data updated successfully' }),
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
  // Fetch last 30 days to ensure we have enough for SMA/RSI calc
  const url = `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=60&interval=daily`
  const res = await fetch(url, {
    headers: { 'x-cg-demo-api-key': apiKey }
  })
  
  if (!res.ok) {
    throw new Error(`CoinGecko API Error for ${coinId}: ${res.statusText}`)
  }
  return await res.json()
}

function processData(data: any, coinId: string) {
  if (!data || !data.prices) return null

  // We only care about the very last completed day (yesterday) + today
  // But we need history for indicators.
  const prices = data.prices // [[ts, price], ...]
  
  // Extract simple price array for calculations
  const priceValues = prices.map((p: any) => p[1])
  
  // Calculate indicators for the LATEST data point
  const lastIndex = prices.length - 1
  const latestPrice = prices[lastIndex][1]
  const latestTs = prices[lastIndex][0]
  
  // Calculate Indicators
  const sma50 = calculateSMA(priceValues, 50)
  const sma200 = calculateSMA(priceValues, 200)
  const rsi = calculateRSI(priceValues, 14)
  const { upper, lower } = calculateBollingerBands(priceValues, 20)
  
  // Calculate Max Price for Drawdown (over loaded period)
  const maxPrice = Math.max(...priceValues)
  const drawdown = ((latestPrice - maxPrice) / maxPrice) * 100

  return {
    date: new Date(latestTs).toISOString().split('T')[0],
    close: latestPrice,
    // CoinGecko market_chart doesn't give OHLC, so we approximate
    open: latestPrice, 
    high: latestPrice, 
    low: latestPrice,
    volume: data.total_volumes[lastIndex][1] || 0,
    sma_50: sma50,
    sma_200: sma200,
    rsi: rsi,
    bb_upper: upper,
    bb_lower: lower,
    drawdown_pct: drawdown
  }
}

// Helper Functions
function calculateSMA(data: number[], period: number) {
  if (data.length < period) return null
  return data.slice(-period).reduce((a, b) => a + b, 0) / period
}

function calculateRSI(data: number[], period: number = 14) {
  if (data.length <= period) return null
  let gains = 0, losses = 0
  
  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i] - data[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
  }
  
  if (losses === 0) return 100
  return 100 - (100 / (1 + (gains / losses)))
}

function calculateBollingerBands(data: number[], period: number = 20) {
  if (data.length < period) return { upper: null, lower: null }
  const slice = data.slice(-period)
  const mean = slice.reduce((a, b) => a + b, 0) / period
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period
  const std = Math.sqrt(variance)
  return { upper: mean + 2 * std, lower: mean - 2 * std }
}
