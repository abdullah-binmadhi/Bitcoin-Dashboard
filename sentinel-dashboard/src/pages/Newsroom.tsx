import { useState, useMemo } from 'react';
import { Newspaper, Flame, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NewsCard, type NewsItem } from '@/components/cards/NewsCard';

const MOCK_NEWS: NewsItem[] = [
    { id: '1', title: "Bitcoin Surges Past $90k as Institutional Demand Grows", source: "CoinDesk", published_at: new Date().toISOString(), url: "#", sentiment: 'bullish', score: 85 },
    { id: '2', title: "SEC Delays Decision on Ethereum ETF Applications", source: "The Block", published_at: new Date(Date.now() - 3600000).toISOString(), url: "#", sentiment: 'bearish', score: 60 },
    { id: '3', title: "Solana Network Experiences Brief Congestion", source: "Decrypt", published_at: new Date(Date.now() - 7200000).toISOString(), url: "#", sentiment: 'neutral', score: 45 },
    { id: '4', title: "Ripple Wins Another Legal Battle in ongoing Lawsuit", source: "CryptoSlate", published_at: new Date(Date.now() - 10800000).toISOString(), url: "#", sentiment: 'bullish', score: 92 },
    { id: '5', title: "Crypto Market Analysis: Week Ahead", source: "CoinTelegraph", published_at: new Date(Date.now() - 14400000).toISOString(), url: "#", sentiment: 'neutral', score: 50 },
    { id: '6', title: "Whales Accumulating BTC at Record Pace", source: "Glassnode", published_at: new Date(Date.now() - 86400000).toISOString(), url: "#", sentiment: 'bullish', score: 88 },
];

const TRENDING_TOPICS = [
    { tag: 'Bitcoin ETF', count: 124 },
    { tag: 'Halving', count: 98 },
    { tag: 'Regulation', count: 85 },
    { tag: 'Solana DeFi', count: 72 },
    { tag: 'NFTs', count: 54 },
    { tag: 'ZK-Rollups', count: 45 },
];

export function Newsroom() {
    const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish'>('all');

    const filteredNews = useMemo(() => {
        if (filter === 'all') return MOCK_NEWS;
        return MOCK_NEWS.filter(n => n.sentiment === filter);
    }, [filter]);

    return (
        <div className="space-y-6 max-w-[1920px] mx-auto">
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
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Latest Headlines
                        </h2>
                        <div className="flex gap-2">
                            {['all', 'bullish', 'bearish'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                                        filter === f 
                                        ? 'bg-slate-700 text-white' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {filteredNews.map(item => (
                            <NewsCard key={item.id} item={item} />
                        ))}
                    </div>
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
                                Based on analysis of 500+ news articles today.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
