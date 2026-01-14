import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Hardcoded Gemini Key
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
    const { context, prompt } = await req.json();

    if (!context || !prompt) {
        throw new Error("Missing context or prompt");
    }

    const fullPrompt = `
    You are an expert crypto analyst.
    
    Context Data:
    ${JSON.stringify(context)}

    Task:
    ${prompt}

    Output:
    Provide a concise, 1-2 sentence professional insight. Do not use markdown. Do not be generic.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
        })
    });

    const data = await response.json();
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";

    return new Response(JSON.stringify({ insight }), {
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
