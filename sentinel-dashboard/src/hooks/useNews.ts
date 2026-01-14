import { useState, useEffect, useCallback } from 'react';
import type { NewsItem } from '@/components/cards/NewsCard';

const FUNCTIONS_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co/functions/v1/fetch-news';

export interface MarketSummary {
    sentiment: string;
    score: number;
    summary: string;
    bullish_driver: string;
    bearish_driver: string;
}

export function useNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(FUNCTIONS_URL);
            if (!response.ok) throw new Error('Failed to fetch live news');
            
            const data = await response.json();
            
            // Handle both old format (array) and new format (object) for backward compatibility
            if (Array.isArray(data)) {
                setNews(data);
                setSummary(null);
            } else {
                setNews(data.articles || []);
                setSummary(data.summary || null);
            }
        } catch (err) {
            console.error('News fetch error:', err);
            setError(err instanceof Error ? err.message : 'Unknown news error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    return { news, summary, loading, error, refetch: fetchNews };
}
