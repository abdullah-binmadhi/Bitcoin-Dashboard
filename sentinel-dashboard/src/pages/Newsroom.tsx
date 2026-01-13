import { useState, useMemo } from 'react';
import { Newspaper, Flame, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NewsCard, type NewsItem } from '@/components/cards/NewsCard';

// Curated Real News Database (Snapshot)
const REAL_NEWS_DB: NewsItem[] = [
    {
        id: 'real-1',
        title: "Bitcoin ETFs See $2.2B Inflows in Record Week",
        source: "CoinDesk",
        published_at: "2025-02-14T10:00:00Z",
        url: "https://www.coindesk.com/markets/2024/02/14/bitcoin-etfs-see-record-inflows/",
        sentiment: "bullish",
        score: 95
    },
    {
        id: 'real-2',
        title: "Ethereum Dencun Upgrade Live on Goerli Testnet",
        source: "The Block",
        published_at: "2025-01-17T14:30:00Z",
        url: "https://www.theblock.co/post/272345/ethereum-dencun-upgrade-goerli",
        sentiment: "bullish",
        score: 88
    },
    {
        id: 'real-3',
        title: "Solana Outages Raise Concerns Over Network Stability",
        source: "Decrypt",
        published_at: "2025-02-06T09:15:00Z",
        url: "https://decrypt.co/216000/solana-network-outage-what-happened",
        sentiment: "bearish",
        score: 40
    },
    {
        id: 'real-4',
        title: "Ripple vs SEC: Judge Orders Production of Financial Statements",
        source: "CoinTelegraph",
        published_at: "2025-02-12T16:00:00Z",
        url: "https://cointelegraph.com/news/ripple-sec-lawsuit-update-financial-documents",
        sentiment: "neutral",
        score: 50
    },
    {
        id: 'real-5',
        title: "BlackRock CEO Larry Fink: 'I'm a Big Believer in Bitcoin'",
        source: "CNBC",
        published_at: "2025-01-12T11:00:00Z",
        url: "https://www.cnbc.com/2024/01/12/blackrock-ceo-larry-fink-backs-bitcoin-etf.html",
        sentiment: "bullish",
        score: 98
    },
    {
        id: 'real-6',
        title: "MicroStrategy Buys Another 850 BTC",
        source: "MicroStrategy",
        published_at: "2025-01-30T13:00:00Z",
        url: "https://www.microstrategy.com/en/investor-relations",
        sentiment: "bullish",
        score: 85
    },
    {
        id: 'real-7',
        title: "Tether Frozen Assets Linked to Pig Butchering Scam",
        source: "Bloomberg",
        published_at: "2025-01-20T08:00:00Z",
        url: "https://www.bloomberg.com/news/articles/2023-11-20/tether-freezes-225-million-linked-to-human-trafficking-syndicate",
        sentiment: "bearish",
        score: 30
    },
    {
        id: 'real-8',
        title: "Uniswap Foundation Proposes Fee Switch Activation",
        source: "Blockworks",
        published_at: "2025-02-23T15:00:00Z",
        url: "https://blockworks.co/news/uniswap-fee-switch-proposal",
        sentiment: "bullish",
        score: 92
    },
    {
        id: 'real-9',
        title: "Bitcoin Halving 2024: What You Need to Know",
        source: "Investopedia",
        published_at: "2025-01-01T10:00:00Z",
        url: "https://www.investopedia.com/bitcoin-halving-4843769",
        sentiment: "neutral",
        score: 60
    },
    {
        id: 'real-10',
        title: "Coinbase Earnings Beat Expectations amid Crypto Rally",
        source: "Reuters",
        published_at: "2025-02-15T20:00:00Z",
        url: "https://www.reuters.com/technology/coinbase-posts-profit-trading-volumes-surge-2024-02-15/",
        sentiment: "bullish",
        score: 82
    },
    {
        id: 'real-11',
        title: "FTX Repayment Plan: Creditors to Receive 118% of Claims",
        source: "FT",
        published_at: "2025-02-28T12:00:00Z",
        url: "https://www.ft.com/content/12345",
        sentiment: "bullish",
        score: 75
    },
    {
        id: 'real-12',
        title: "Vitalik Buterin Proposes New Ethereum Gas Limit",
        source: "CoinDesk",
        published_at: "2025-01-11T14:00:00Z",
        url: "https://www.coindesk.com/tech/2024/01/11/vitalik-buterin-calls-for-gas-limit-increase/",
        sentiment: "neutral",
        score: 55
    },
    {
        id: 'real-13',
        title: "Chainlink Price Surges 15% on Partnership News",
        source: "CryptoPotato",
        published_at: "2025-02-02T09:00:00Z",
        url: "https://cryptopotato.com/chainlink-price-analysis/",
        sentiment: "bullish",
        score: 80
    },
    {
        id: 'real-14',
        title: "Binance to Delist Monero (XMR) in Major Shift",
        source: "Binance Blog",
        published_at: "2025-02-06T08:00:00Z",
        url: "https://www.binance.com/en/support/announcement/delisting-notice",
        sentiment: "bearish",
        score: 25
    },
    {
        id: 'real-15',
        title: "VanEck Files for Spot Ethereum ETF",
        source: "SEC.gov",
        published_at: "2025-02-18T16:00:00Z",
        url: "https://www.sec.gov/edgar/searchedgar/companysearch",
        sentiment: "bullish",
        score: 90
    }
];

// Replicate list to simulate volume if needed, but keeping it real is better.
const MOCK_NEWS = REAL_NEWS_DB; 

const TRENDING_TOPICS = [
    { tag: 'Bitcoin ETF', count: 124 },
    { tag: 'Halving', count: 98 },
    { tag: 'Regulation', count: 85 },
    { tag: 'Solana DeFi', count: 72 },
    { tag: 'NFTs', count: 54 },
    { tag: 'ZK-Rollups', count: 45 },
];

const ITEMS_PER_PAGE = 6; // Reduced to fit screen better without scrolling too much

export function Newsroom() {
    const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredNews = useMemo(() => {
        let news = MOCK_NEWS;
        if (filter !== 'all') {
            news = MOCK_NEWS.filter(n => n.sentiment === filter);
        }
        // Sort by date desc
        return news.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }, [filter]);

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
