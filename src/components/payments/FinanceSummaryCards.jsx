import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Clock, Wallet, TrendingUp } from 'lucide-react';

const fmt = (n, symbol = '$') => `${symbol}${(n || 0).toFixed(2)}`;

export default function FinanceSummaryCards({ summary, role, symbol = '$' }) {
  const cards = role === 'client'
    ? [
        { icon: ArrowUpCircle, label: 'Total Paid', value: fmt(summary.totalIn, symbol), color: 'text-red-500', bg: 'bg-red-50' },
        { icon: Clock, label: 'Pending (Escrow)', value: fmt(summary.pending, symbol), color: 'text-amber-500', bg: 'bg-amber-50' },
        { icon: Wallet, label: 'Platform Fees Paid', value: fmt(summary.totalFees, symbol), color: 'text-gray-500', bg: 'bg-gray-50' },
        { icon: TrendingUp, label: 'Bookings Paid', value: summary.count || 0, color: 'text-blue-500', bg: 'bg-blue-50' },
      ]
    : [
        { icon: ArrowDownCircle, label: 'Total Earned', value: fmt(summary.totalIn, symbol), color: 'text-green-600', bg: 'bg-green-50' },
        { icon: Wallet, label: 'Available Balance', value: fmt(summary.balance, symbol), color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: ArrowUpCircle, label: 'Total Paid Out', value: fmt(summary.totalOut, symbol), color: 'text-purple-500', bg: 'bg-purple-50' },
        { icon: Clock, label: 'In Escrow', value: fmt(summary.pending, symbol), color: 'text-amber-500', bg: 'bg-amber-50' },
      ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className={`border-0 shadow-sm ${c.bg}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}