import { useState, useMemo } from 'react';
import { Newspaper, Flame, Hash, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NewsCard } from '@/components/cards/NewsCard';
import { useNews } from '@/hooks/useNews';

const TRENDING_TOPICS = [
    { tag: 'Bitcoin ETF', count: 124 },
    { tag: 'Halving', count: 98 },
    { tag: 'Regulation', count: 85 },
    { tag: 'Solana DeFi', count: 72 },
    { tag: 'NFTs', count: 54 },
    { tag: 'ZK-Rollups', count: 45 },
];

const ITEMS_PER_PAGE = 6;

export function Newsroom() {
    const { news, loading, error, refetch } = useNews();
    const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredNews = useMemo(() => {
        if (loading || !news) return [];
        let data = news;
        if (filter !== 'all') {
            data = news.filter(n => n.sentiment === filter);
        }
        return data; // API already sorts by date
    }, [filter, news, loading]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
    const paginatedNews = filteredNews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (f: 'all' | 'bullish' | 'bearish') => {
        setFilter(f);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 max-w-[1920px] mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-500/10 p-3">
                        <Newspaper className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">The Newsroom</h1>
                        <p className="text-sm text-slate-400">Live Market Intelligence</p>
                    </div>
                </div>
                <button 
                    onClick={() => refetch()}
                    className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                    title="Refresh News"
                >
                    <RefreshCw className={`h-5 w-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Latest Headlines
                        </h2>
                        <div className="flex gap-2">
                            {['all', 'bullish', 'bearish'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f as any)}
                                    className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                                        filter === f 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-8 w-8 border-4 border-slate-700 border-t-blue-500 rounded-full" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-rose-500">
                            <p>Failed to load news feed.</p>
                            <button onClick={() => refetch()} className="text-sm underline mt-2">Retry</button>
                        </div>
                    ) : (
                        <div className="grid gap-3 min-h-[600px]">
                            {paginatedNews.map(item => (
                                <NewsCard key={item.id} item={item} />
                            ))}
                            {paginatedNews.length === 0 && (
                                <p className="text-center text-slate-500 py-10">No news found for this filter.</p>
                            )}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="text-sm text-slate-400">
                                Page <span className="text-slate-100 font-medium">{currentPage}</span> of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Trending Topics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Hash className="h-4 w-4 text-emerald-500" />
                                Trending Topics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {TRENDING_TOPICS.map(topic => (
                                    <span 
                                        key={topic.tag} 
                                        className="px-3 py-1.5 bg-slate-900 text-slate-300 rounded-lg text-sm border border-slate-800 flex items-center gap-2 hover:border-slate-600 transition-colors cursor-pointer"
                                    >
                                        #{topic.tag}
                                        <span className="text-xs text-slate-500 bg-slate-950 px-1.5 rounded">{topic.count}</span>
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sentiment Summary */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-base text-slate-200">AI Market Mood</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <div className="text-4xl font-bold text-emerald-500 mb-1">Greed</div>
                                <div className="text-sm text-slate-400">Score: 78/100</div>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500 w-[78%]" />
                            </div>
                            <p className="text-xs text-center text-slate-500 mt-2">
                                Based on analysis of {news?.length || 0} articles today.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    // Pagination Logic
    const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
    const paginatedNews = filteredNews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (f: 'all' | 'bullish' | 'bearish') => {
        setFilter(f);
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    return (
        <div className="space-y-6 max-w-[1920px] mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                    <Newspaper className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">The Newsroom</h1>
                    <p className="text-sm text-slate-400">Market Sentiment & Intelligence</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Latest Headlines
                        </h2>
                        <div className="flex gap-2">
                            {['all', 'bullish', 'bearish'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f as any)}
                                    className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                                        filter === f 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 min-h-[600px]">
                        {paginatedNews.map(item => (
                            <NewsCard key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="text-sm text-slate-400">
                                Page <span className="text-slate-100 font-medium">{currentPage}</span> of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Trending Topics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Hash className="h-4 w-4 text-emerald-500" />
                                Trending Topics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {TRENDING_TOPICS.map(topic => (
                                    <span 
                                        key={topic.tag} 
                                        className="px-3 py-1.5 bg-slate-900 text-slate-300 rounded-lg text-sm border border-slate-800 flex items-center gap-2 hover:border-slate-600 transition-colors cursor-pointer"
                                    >
                                        #{topic.tag}
                                        <span className="text-xs text-slate-500 bg-slate-950 px-1.5 rounded">{topic.count}</span>
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sentiment Summary */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-base text-slate-200">AI Market Mood</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <div className="text-4xl font-bold text-emerald-500 mb-1">Greed</div>
                                <div className="text-sm text-slate-400">Score: 78/100</div>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500 w-[78%]" />
                            </div>
                            <p className="text-xs text-center text-slate-500 mt-2">
                                Based on analysis of {MOCK_NEWS.length} articles.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
