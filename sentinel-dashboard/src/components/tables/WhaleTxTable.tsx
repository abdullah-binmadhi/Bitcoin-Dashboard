import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export interface WhaleTx {
    id: string;
    hash: string;
    amount_usd: number;
    amount_coin: number;
    coin: string;
    from: string;
    to: string;
    type: 'inflow' | 'outflow' | 'transfer';
    timestamp: string;
    is_anomaly?: boolean; // New field for ML detection
    anomaly_score?: number; // Z-Score
}

interface WhaleTxTableProps {
    transactions: WhaleTx[];
}

export function WhaleTxTable({ transactions }: WhaleTxTableProps) {
    return (
        <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-900">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Time</TableHead>
                        <TableHead className="text-slate-400">Type</TableHead>
                        <TableHead className="text-right text-slate-400">Amount (USD)</TableHead>
                        <TableHead className="text-right text-slate-400">Amount (Coin)</TableHead>
                        <TableHead className="hidden md:table-cell text-slate-400">From / To</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-900/50">
                            <TableCell className="font-mono text-xs text-slate-400">
                                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell>
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md w-fit ${
                                    tx.type === 'inflow' ? 'bg-rose-500/10 text-rose-500' :
                                    tx.type === 'outflow' ? 'bg-emerald-500/10 text-emerald-500' :
                                    'bg-slate-800 text-slate-300'
                                }`}>
                                    {tx.type === 'inflow' ? <ArrowDownLeft className="h-3 w-3" /> : 
                                     tx.type === 'outflow' ? <ArrowUpRight className="h-3 w-3" /> : null}
                                    {tx.type.toUpperCase()}
                                </span>
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-200">
                                <div className="flex flex-col items-end">
                                    <span>{formatCurrency(tx.amount_usd, 0)}</span>
                                    {tx.is_anomaly && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-500 text-white rounded animate-pulse">
                                            🚨 ANOMALY (Z: {tx.anomaly_score?.toFixed(1)})
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-slate-400 font-mono text-xs">
                                {tx.amount_coin.toLocaleString()} {tx.coin}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs font-mono text-slate-500">
                                <div className="flex flex-col">
                                    <span className="truncate w-24">Fr: {tx.from}</span>
                                    <span className="truncate w-24">To: {tx.to}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
