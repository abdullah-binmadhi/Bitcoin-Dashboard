import { ChevronDown } from 'lucide-react';

interface YearFilterProps {
    selectedYear: string | number;
    onChange: (year: string | number) => void;
    startYear?: number;
}

const CURRENT_YEAR = new Date().getFullYear(); // 2026

export function YearFilter({ selectedYear, onChange, startYear = 2014 }: YearFilterProps) {
    const years = Array.from(
        { length: CURRENT_YEAR - startYear + 1 },
        (_, i) => CURRENT_YEAR - i
    );

    return (
        <div className="relative group">
            <select
                value={selectedYear}
                onChange={(e) => onChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="appearance-none bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-800 transition-colors"
            >
                <option value="ALL">All Time</option>
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>
    );
}
