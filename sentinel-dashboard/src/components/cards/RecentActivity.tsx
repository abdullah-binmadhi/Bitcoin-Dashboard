import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatCompactDate } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { BitcoinData } from '@/types/database';

interface RecentActivityProps {
    data: BitcoinData[];
    limit?: number;
    maxHeight?: number;
}

export function RecentActivity({ data, limit = 7, maxHeight = 380 }: RecentActivityProps) {
    const recentData = data.slice(-limit).reverse();

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="overflow-auto" style={{ maxHeight: `${maxHeight}px` }}>
                    <Table>
                        <TableHeader className="sticky top-0 bg-slate-900 z-10">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400 text-xs py-2 whitespace-nowrap">Date</TableHead>
                                <TableHead className="text-right text-slate-400 text-xs py-2 whitespace-nowrap">Close</TableHead>
                                <TableHead className="text-right text-slate-400 text-xs py-2 whitespace-nowrap">High</TableHead>
                                <TableHead className="text-right text-slate-400 text-xs py-2 whitespace-nowrap">Low</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentData.map((row, index) => {
                                const prevRow = recentData[index + 1];
                                const change = prevRow
                                    ? ((row.close - prevRow.close) / prevRow.close) * 100
                                    : 0;
                                const isPositive = change >= 0;

                                return (
                                    <TableRow
                                        key={row.date}
                                        className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                                    >
                                        <TableCell className="font-medium text-slate-100 py-2 text-xs whitespace-nowrap">
                                            {formatCompactDate(row.date)}
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-slate-100 tabular-nums text-xs">
                                                    {formatCurrency(row.close, 0)}
                                                </span>
                                                {prevRow && (
                                                    <span
                                                        className={`flex items-center ${isPositive ? 'text-emerald-500' : 'text-rose-500'
                                                            }`}
                                                    >
                                                        {isPositive ? (
                                                            <TrendingUp className="h-3 w-3" />
                                                        ) : (
                                                            <TrendingDown className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400 tabular-nums py-2 text-xs whitespace-nowrap">
                                            {formatCurrency(row.high, 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400 tabular-nums py-2 text-xs whitespace-nowrap">
                                            {formatCurrency(row.low, 0)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
