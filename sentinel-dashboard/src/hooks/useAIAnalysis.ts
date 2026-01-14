import { useState, useEffect } from 'react';

const FUNCTION_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co/functions/v1/analyze-data';

export function useAIAnalysis(context: any, prompt: string, shouldRun: boolean = true) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!shouldRun || !context) return;

        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const response = await fetch(FUNCTION_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ context, prompt })
                });
                const data = await response.json();
                setInsight(data.insight);
            } catch (err) {
                console.error("AI Analysis failed:", err);
                setInsight("Live analysis temporarily unavailable.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [shouldRun]); // Only run once when enabled (or if context deeply changes, but we avoid that loop)

    return { insight, loading };
}
