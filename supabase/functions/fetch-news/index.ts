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
    // 1. Fetch Crypto News
    const url = `${NEWSAPI_URL}?q=crypto OR bitcoin OR ethereum&sortBy=publishedAt&language=en&pageSize=15&apiKey=${NEWSAPI_KEY}`;
    console.log(`Fetching news...`);
    
    const newsResponse = await fetch(url);
    const newsData = await newsResponse.json();

    if (newsData.status !== 'ok') {
        throw new Error(newsData.message || 'NewsAPI Error');
    }

    // 2. Prepare Articles
    let articles = newsData.articles.map((item: any, index: number) => ({
        id: `news-${index}-${new Date().getTime()}`,
        title: item.title,
        source: item.source.name,
        published_at: item.publishedAt,
        url: item.url,
        // Default values (will be overwritten if AI succeeds)
        sentiment: 'neutral',
        score: 50
    }));

    // 3. AI Sentiment Analysis
    const geminiKey = 'AIzaSyBUkcOviuRg5vha4r43p4ywWQMbo1XG-Mw';
    
    if (geminiKey) {
        console.log("Gemini Key found, analyzing sentiment...");
        try {
            articles = await analyzeSentimentWithGemini(articles, geminiKey);
        } catch (err) {
            console.error("AI Analysis failed, reverting to mock:", err);
            articles = addMockSentiment(articles);
        }
    } else {
        console.log("No GEMINI_API_KEY found. Using mock data.");
        articles = addMockSentiment(articles);
    }

    return new Response(JSON.stringify(articles), {
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

// Helper: AI Analysis
async function analyzeSentimentWithGemini(articles: any[], apiKey: string) {
    const titles = articles.map((a, i) => `${i}: ${a.title}`).join('\n');
    
    const prompt = `
    Analyze the sentiment of these crypto headlines. 
    Return a RAW JSON array of objects (no markdown, no code blocks) corresponding to the order of headlines.
    Each object must have:
    - "sentiment": "bullish", "bearish", or "neutral"
    - "score": number 0-100 (0=extreme fear, 100=extreme greed)

    Headlines:
    ${titles}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0].content) {
        throw new Error("Invalid AI response structure");
    }

    let rawText = data.candidates[0].content.parts[0].text;
    // Clean up potential markdown code blocks
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const sentiments = JSON.parse(rawText);

    // Merge results
    return articles.map((article, index) => {
        const result = sentiments[index];
        return {
            ...article,
            sentiment: result ? result.sentiment : 'neutral',
            score: result ? result.score : 50
        };
    });
}

// Helper: Mock Fallback
function addMockSentiment(articles: any[]) {
    return articles.map(item => ({
        ...item,
        sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.6 ? 'bearish' : 'neutral',
        score: Math.floor(Math.random() * 40) + 60
    }));
}
