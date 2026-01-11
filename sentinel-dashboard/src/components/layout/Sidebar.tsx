import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Orbit,
    Wrench,
    Shield,
    Bitcoin,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
}

const navItems: NavItem[] = [
    {
        to: '/',
        icon: Orbit,
        label: 'Orbit',
        description: 'Executive Overview',
    },
    {
        to: '/mechanic',
        icon: Wrench,
        label: 'The Mechanic',
        description: 'Technical Analysis',
    },
    {
        to: '/risk-officer',
        icon: Shield,
        label: 'Risk Officer',
        description: 'Drawdown Analysis',
    },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl transition-all duration-300',
                collapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
                <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
                    <div className="relative">
                        <Bitcoin className="h-8 w-8 text-emerald-500" />
                        <Activity className="absolute -bottom-1 -right-1 h-4 w-4 text-emerald-400 animate-pulse" />
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="text-lg font-bold text-slate-100">SENTINEL</h1>
                            <p className="text-xs text-slate-500">Live Analytics</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200',
                                isActive
                                    ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/5'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                            )
                        }
                    >
                        <item.icon
                            className={cn(
                                'h-5 w-5 flex-shrink-0 transition-all duration-200',
                                collapsed ? 'mx-auto' : ''
                            )}
                        />
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{item.label}</span>
                                <span className="text-xs text-slate-500 group-hover:text-slate-400">
                                    {item.description}
                                </span>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-3">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        cn(
                            'flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200',
                            isActive
                                ? 'bg-slate-800 text-slate-100'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
                            collapsed && 'justify-center'
                        )
                    }
                >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Settings</span>}
                </NavLink>
            </div>
        </aside>
    );
}
