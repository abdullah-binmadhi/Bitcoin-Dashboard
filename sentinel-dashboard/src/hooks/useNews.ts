import { useState, useEffect, useCallback } from 'react';
import type { NewsItem } from '@/components/cards/NewsCard';

const FUNCTIONS_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co/functions/v1/fetch-news';

export function useNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(FUNCTIONS_URL);
            if (!response.ok) throw new Error('Failed to fetch live news');
            const data = await response.json();
            setNews(data);
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

    return { news, loading, error, refetch: fetchNews };
}