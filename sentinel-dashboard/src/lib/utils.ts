import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, decimals = 2): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

export function getRSIStatus(rsi: number): { label: string; color: string } {
    if (rsi >= 70) {
        return { label: 'Overbought', color: 'text-rose-500' };
    } else if (rsi <= 30) {
        return { label: 'Oversold', color: 'text-emerald-500' };
    }
    return { label: 'Neutral', color: 'text-slate-400' };
}

export function getFearGreedStatus(rsi: number): { label: string; color: string; bgClass: string } {
    if (rsi >= 70) {
        return { label: 'GREED', color: 'text-emerald-500', bgClass: 'gradient-green' };
    } else if (rsi <= 30) {
        return { label: 'FEAR', color: 'text-rose-500', bgClass: 'gradient-red' };
    }
    return { label: 'NEUTRAL', color: 'text-slate-400', bgClass: 'gradient-blue' };
}

export function getTrendStatus(price: number, sma200: number): { label: string; color: string; icon: 'up' | 'down' } {
    if (price > sma200) {
        return { label: 'BULLISH', color: 'text-emerald-500', icon: 'up' };
    }
    return { label: 'BEARISH', color: 'text-rose-500', icon: 'down' };
}
