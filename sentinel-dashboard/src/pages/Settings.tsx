import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Database, Info, ExternalLink, Sliders, Monitor } from 'lucide-react';
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
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Database className="h-5 w-5 text-emerald-500" />
                        Database Connection
                    </CardTitle>
                    <CardDescription>
                        Supabase connection status and configuration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800 bg-slate-950/50">
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

            {/* Application Preferences */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Sliders className="h-5 w-5 text-blue-500" />
                        Preferences
                    </CardTitle>
                    <CardDescription>
                        Customize your viewing experience
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-2">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium text-slate-200">Default Coin</label>
                            <p className="text-xs text-slate-500">Asset to load on dashboard start</p>
                        </div>
                        <select className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg p-2.5">
                            <option>Bitcoin (BTC)</option>
                            <option>Ethereum (ETH)</option>
                            <option>Solana (SOL)</option>
                        </select>
                    </div>
                    <div className="border-t border-slate-800 my-2" />
                    <div className="flex items-center justify-between p-2">
                         <div className="space-y-0.5">
                            <label className="text-sm font-medium text-slate-200">Chart Density</label>
                            <p className="text-xs text-slate-500">Adjust the amount of historical data shown</p>
                        </div>
                         <select className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg p-2.5">
                            <option>Compact (Latest 100)</option>
                            <option>Standard (1 Year)</option>
                            <option>Deep (All History)</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Info className="h-5 w-5 text-purple-500" />
                        About Sentinel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm text-slate-400">
                        <p>
                            <strong className="text-slate-300">Sentinel</strong> is a professional-grade crypto analytics terminal designed for institutional-style market analysis.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                             <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
                                    <Monitor className="h-3 w-3" /> Tech Stack
                                </h4>
                                <ul className="text-xs space-y-1 list-disc list-inside">
                                    <li>React 18 + TypeScript</li>
                                    <li>Vite + Tailwind CSS</li>
                                    <li>Recharts for Visualization</li>
                                    <li>Supabase Realtime</li>
                                </ul>
                             </div>
                             <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <h4 className="font-semibold text-slate-200 mb-1">Analytics</h4>
                                <ul className="text-xs space-y-1 list-disc list-inside">
                                    <li>Multi-Asset Correlation</li>
                                    <li>On-Chain Whale Tracking</li>
                                    <li>Technical Risk Metrics</li>
                                </ul>
                             </div>
                        </div>
                        
                        <div className="pt-4 flex gap-3">
                             <Button variant="outline" size="sm" className="w-full">
                                <a href="https://github.com/abdullah-binmadhi/Bitcoin-Dashboard" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                                    <ExternalLink className="h-3 w-3" /> View Source
                                </a>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}