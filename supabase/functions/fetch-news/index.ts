import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const NEWSAPI_KEY = '778d867706b247d3bd84d59f5f2473ef';
const NEWSAPI_URL = 'https://newsapi.org/v2/everything';
// Hardcoded Gemini Key for immediate use
const GEMINI_KEY = 'AIzaSyBUkcOviuRg5vha4r43p4ywWQMbo1XG-Mw';

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
        sentiment: 'neutral',
        score: 50
    }));

    let marketSummary = {
        sentiment: 'Neutral',
        score: 50,
        summary: "Market analysis unavailable.",
        bullish_driver: "None",
        bearish_driver: "None"
    };

    // 3. AI Analysis (Individual + Summary)
    if (GEMINI_KEY) {
        console.log("Gemini Key found, analyzing sentiment & summary...");
        try {
            const result = await analyzeMarketWithGemini(articles, GEMINI_KEY);
            articles = result.articles;
            marketSummary = result.summary;
        } catch (err) {
            console.error("AI Analysis failed, reverting to mock:", err);
            articles = addMockSentiment(articles);
        }
    } else {
        articles = addMockSentiment(articles);
    }

    // Return object with both articles AND summary
    return new Response(JSON.stringify({
        articles,
        summary: marketSummary
    }), {
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

// Helper: AI Analysis (Combined)
async function analyzeMarketWithGemini(articles: any[], apiKey: string) {
    const titles = articles.map((a, i) => `${i}: ${a.title}`).join('\n');
    
    const prompt = `
    You are a crypto market analyst. Analyze these headlines. 

    Part 1: Analyze individual sentiment for each headline.
    Part 2: Write a "Daily Intelligence Briefing" summarizing the overall market mood.

    Return a RAW JSON object with this exact structure:
    {
        "sentiments": [
            { "sentiment": "bullish"|"bearish"|"neutral", "score": number (0-100) },
            ... (one for each headline)
        ],
        "summary": {
            "sentiment": "Bullish"|"Bearish"|"Neutral"|"Greed"|"Fear",
            "score": number (0-100),
            "summary": "A concise 2-sentence summary of the market narrative based on these stories.",
            "bullish_driver": "The single most positive news topic/event from the list.",
            "bearish_driver": "The single most negative news topic/event from the list."
        }
    }

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
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(rawText);

    // Merge results
    const updatedArticles = articles.map((article, index) => {
        const sent = result.sentiments[index];
        return {
            ...article,
            sentiment: sent ? sent.sentiment : 'neutral',
            score: sent ? sent.score : 50
        };
    });

    return {
        articles: updatedArticles,
        summary: result.summary
    };
}

// Helper: Mock Fallback
function addMockSentiment(articles: any[]) {
    return articles.map(item => ({
        ...item,
        sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.6 ? 'bearish' : 'neutral',
        score: Math.floor(Math.random() * 40) + 60
    }));
}