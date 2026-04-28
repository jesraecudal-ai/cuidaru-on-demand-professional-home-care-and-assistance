import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const METHODS = [
  { key: 'stripe', label: 'Stripe Payout', icon: Zap, desc: 'Instant to your Stripe account', color: 'border-purple-300 bg-purple-50' },
  { key: 'debit_card', label: 'Debit Card', icon: CreditCard, desc: 'Transfer to your debit card', color: 'border-blue-300 bg-blue-50' },
  { key: 'prepaid_card', label: 'Prepaid Card', icon: Banknote, desc: 'Send to a prepaid card', color: 'border-green-300 bg-green-50' },
];

export default function AffiliateWithdrawModal({ open, onClose, balance, onSuccess }) {
  const [method, setMethod] = useState('stripe');
  const [amount, setAmount] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || amt > balance) {
      toast.error('Invalid amount');
      return;
    }
    if (!payoutDetails.trim()) {
      toast.error('Please provide your payout details');
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke('affiliateWithdraw', {
      amount: amt,
      method,
      payout_details: payoutDetails,
    });
    setLoading(false);
    if (res.data?.success) {
      toast.success(`$${amt.toFixed(2)} withdrawal submitted!`);
      onSuccess();
      onClose();
    } else {
      toast.error(res.data?.error || 'Withdrawal failed');
    }
  };

  const placeholder = method === 'stripe'
    ? 'Your Stripe email or account ID'
    : method === 'debit_card'
      ? 'Card last 4 digits (e.g. 1234)'
      : 'Prepaid card number or email';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Commission</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="p-3 bg-gray-50 rounded-xl text-center">
            <p className="text-sm text-gray-500">Available balance</p>
            <p className="text-3xl font-bold text-green-600">${balance.toFixed(2)}</p>
          </div>

          {/* Method selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Payout Method</Label>
            <div className="space-y-2">
              {METHODS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${method === m.key ? m.color + ' border-opacity-100' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <m.icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <Input
                type="number"
                className="pl-7"
                placeholder="0.00"
                value={amount}
                max={balance}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <button className="text-xs text-purple-600 mt-1 hover:underline" onClick={() => setAmount(balance.toFixed(2))}>
              Use full balance (${balance.toFixed(2)})
            </button>
          </div>

          {/* Payout details */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Payout Details</Label>
            <Input
              placeholder={placeholder}
              value={payoutDetails}
              onChange={e => setPayoutDetails(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}