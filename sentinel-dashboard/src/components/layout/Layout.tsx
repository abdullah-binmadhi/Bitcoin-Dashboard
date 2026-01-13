import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useCryptoData } from '@/hooks/useBitcoinData';
import { useState } from 'react';

export function Layout() {
    const { loading } = useCryptoData({ limit: 365 });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 bg-grid">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="md:ml-64 transition-all duration-300 ml-0">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-4 md:p-6">
                    {loading ? (
                        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-slate-800" />
                                    <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-emerald-500" />
                                </div>
                                <p className="text-sm text-slate-400">Loading market data...</p>
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    );
}
