import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  escrow_deposit:  { label: 'Escrow Deposit',   icon: ArrowUpCircle,   color: 'text-blue-600',   bg: 'bg-blue-50' },
  payout_released: { label: 'Payout Released',  icon: ArrowDownCircle, color: 'text-green-600',  bg: 'bg-green-50' },
  refund:          { label: 'Refund',            icon: ArrowDownCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
  platform_fee:    { label: 'Platform Fee',      icon: ArrowUpCircle,   color: 'text-gray-500',   bg: 'bg-gray-50' },
};

const STATUS_BADGE = {
  completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pending',   class: 'bg-amber-100 text-amber-700' },
  failed:    { label: 'Failed',    class: 'bg-red-100 text-red-700' },
  refunded:  { label: 'Refunded',  class: 'bg-gray-100 text-gray-700' },
};

export default function TransactionList({ transactions, symbol = '$' }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="divide-y divide-gray-50">
      {sorted.map(tx => {
        const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.escrow_deposit;
        const statusCfg = STATUS_BADGE[tx.status] || STATUS_BADGE.pending;
        const Icon = cfg.icon;
        return (
          <div key={tx.id} className="flex items-center gap-4 py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{cfg.label}</p>
              <p className="text-xs text-gray-400 truncate">{tx.description || `Booking ${tx.booking_id?.slice(0,8)}`}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold ${tx.type === 'payout_released' || tx.type === 'refund' ? 'text-green-600' : 'text-gray-900'}`}>
                {tx.type === 'payout_released' || tx.type === 'refund' ? '+' : '-'}{symbol}{(tx.amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                {tx.created_date && format(new Date(tx.created_date), 'MMM d, yyyy')}
              </p>
            </div>
            <Badge className={`text-xs border-0 flex-shrink-0 ${statusCfg.class}`}>{statusCfg.label}</Badge>
          </div>
        );
      })}
    </div>
  );
}