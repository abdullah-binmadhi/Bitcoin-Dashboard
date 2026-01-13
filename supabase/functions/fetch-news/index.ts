import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const NEWSAPI_KEY = '778d867706b247d3bd84d59f5f2473ef';
const NEWSAPI_URL = 'https://newsapi.org/v2/everything';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Fetch Crypto News (Last 3 days, sorted by popularity)
    // q=crypto OR bitcoin OR ethereum
    const url = `${NEWSAPI_URL}?q=crypto OR bitcoin OR ethereum&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`;
    
    console.log(`Fetching news from: ${url}`);
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
        throw new Error(data.message || 'NewsAPI Error');
    }

    // 2. Transform Data
    const newsItems = data.articles.map((item: any, index: number) => ({
        id: `news-${index}-${new Date().getTime()}`,
        title: item.title,
        source: item.source.name,
        published_at: item.publishedAt,
        url: item.url, // Direct link
        // Mock sentiment since NewsAPI doesn't provide it
        sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.6 ? 'bearish' : 'neutral',
        score: Math.floor(Math.random() * 40) + 60
    }));

    return new Response(JSON.stringify(newsItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});