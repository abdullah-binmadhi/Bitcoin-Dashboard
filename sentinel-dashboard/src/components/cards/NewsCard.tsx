import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCompactDate } from '@/lib/utils';

export interface NewsItem {
    id: string;
    title: string;
    source: string;
    published_at: string;
    url: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number; // 0-100
}

interface NewsCardProps {
    item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
    const sentimentConfig = {
        bullish: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: TrendingUp },
        bearish: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: TrendingDown },
        neutral: { color: 'text-slate-400', bg: 'bg-slate-500/10', icon: Minus },
    };

    const config = sentimentConfig[item.sentiment];
    const Icon = config.icon;

    return (
        <Card className="hover:bg-slate-900/50 transition-colors border-slate-800">
            <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-300">{item.source}</span>
                            <span>•</span>
                            <span>{formatCompactDate(item.published_at)}</span>
                        </div>
                        <h3 className="font-medium text-slate-100 leading-snug line-clamp-2">
                            {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`} title="Analyzed by Gemini AI">
                                <Icon className="h-3 w-3" />
                                {item.sentiment.toUpperCase()} ({item.score})
                                <span className="ml-1 text-[10px] opacity-70">✨ AI</span>
                            </span>
                        </div>
                    </div>
                    <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-blue-400 transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
