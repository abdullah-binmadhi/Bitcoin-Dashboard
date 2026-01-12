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
    X
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

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 md:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    collapsed ? 'md:w-20' : 'md:w-64',
                    'w-64' // Always full width on mobile when open
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
                    <div className={cn('flex items-center gap-3', collapsed && 'md:justify-center')}>
                        <div className="relative">
                            <Bitcoin className="h-8 w-8 text-emerald-500" />
                            <Activity className="absolute -bottom-1 -right-1 h-4 w-4 text-emerald-400 animate-pulse" />
                        </div>
                        {(!collapsed || isOpen) && (
                            <div className="md:block block">
                                <h1 className="text-lg font-bold text-slate-100">SENTINEL</h1>
                                <p className="text-xs text-slate-500">Live Analytics</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:block rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
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
                            onClick={() => onClose()} // Close on mobile navigation
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
                                    collapsed ? 'md:mx-auto' : ''
                                )}
                            />
                            {(!collapsed || isOpen) && (
                                <div className={cn("flex flex-col", collapsed && "md:hidden")}>
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
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200',
                                isActive
                                    ? 'bg-slate-800 text-slate-100'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
                                collapsed && 'md:justify-center'
                            )
                        }
                    >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        {(!collapsed || isOpen) && <span className={cn("text-sm font-medium", collapsed && "md:hidden")}>Settings</span>}
                    </NavLink>
                </div>
            </aside>
        </>
    );
}
