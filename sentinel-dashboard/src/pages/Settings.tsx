import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Database, Zap, Info, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export function Settings() {
    return (
        <div className="space-y-6 max-w-3xl">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-500/10 p-3">
                    <SettingsIcon className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
                    <p className="text-sm text-slate-400">Configure your Sentinel dashboard</p>
                </div>
            </div>

            {/* Connection Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Database className="h-5 w-5" />
                        Database Connection
                    </CardTitle>
                    <CardDescription>
                        Supabase connection status and configuration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div
                                className={`h-3 w-3 rounded-full ${isSupabaseConfigured
                                        ? 'bg-emerald-500 animate-pulse'
                                        : 'bg-amber-500'
                                    }`}
                            />
                            <div>
                                <p className="font-medium text-slate-100">
                                    {isSupabaseConfigured ? 'Connected to Supabase' : 'Demo Mode'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {isSupabaseConfigured
                                        ? 'Realtime updates enabled'
                                        : 'Using mock data - configure .env to connect'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {!isSupabaseConfigured && (
                        <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-200">
                                <strong>To enable live data:</strong> Create a <code className="px-1 py-0.5 bg-slate-800 rounded">.env</code> file
                                in the project root with:
                            </p>
                            <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-xs text-slate-300 overflow-x-auto">
                                {`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* n8n Integration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-5 w-5" />
                        n8n Automation
                    </CardTitle>
                    <CardDescription>
                        Workflow automation for live data updates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            The n8n workflow fetches live Bitcoin data from CoinGecko, calculates technical
                            indicators (SMA, RSI, Bollinger Bands), and updates your Supabase database hourly.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" size="sm">
                                <a
                                    href="https://n8n.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                >
                                    n8n Documentation
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button variant="outline" size="sm">
                                <a
                                    href="https://www.coingecko.com/en/api"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                >
                                    CoinGecko API
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Info className="h-5 w-5" />
                        About Sentinel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm text-slate-400">
                        <p>
                            <strong className="text-slate-300">Project Sentinel</strong> is a self-correcting,
                            real-time Bitcoin analytics terminal designed for traders and analysts.
                        </p>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>Built with React, Tailwind CSS, and Shadcn UI</li>
                            <li>Powered by Supabase for real-time data sync</li>
                            <li>Automated updates via n8n workflows</li>
                            <li>Technical indicators: SMA, RSI, Bollinger Bands</li>
                            <li>Risk metrics: Drawdown, Volatility, VaR</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
