import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatShortDate } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { BitcoinData } from '@/types/database';

interface RecentActivityProps {
    data: BitcoinData[];
    limit?: number;
}

export function RecentActivity({ data, limit = 5 }: RecentActivityProps) {
    const recentData = data.slice(-limit).reverse();

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-right text-slate-400">Close</TableHead>
                            <TableHead className="text-right text-slate-400">High</TableHead>
                            <TableHead className="text-right text-slate-400">Low</TableHead>
                            <TableHead className="text-right text-slate-400">Volume</TableHead>
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
                                    <TableCell className="font-medium text-slate-100">
                                        {formatShortDate(row.date)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-slate-100 tabular-nums">
                                                {formatCurrency(row.close)}
                                            </span>
                                            {prevRow && (
                                                <span
                                                    className={`flex items-center text-xs ${isPositive ? 'text-emerald-500' : 'text-rose-500'
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
                                    <TableCell className="text-right text-slate-400 tabular-nums">
                                        {formatCurrency(row.high)}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-400 tabular-nums">
                                        {formatCurrency(row.low)}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-400 tabular-nums">
                                        ${formatNumber(row.volume / 1e9, 2)}B
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
