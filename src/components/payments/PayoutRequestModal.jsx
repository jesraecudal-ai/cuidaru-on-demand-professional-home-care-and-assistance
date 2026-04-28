import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PayoutRequestModal({ open, onClose, booking, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [cardLast4, setCardLast4] = useState('');
  const [cardBrand, setCardBrand] = useState('visa');
  const [payoutMethod, setPayoutMethod] = useState('debit_card');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardLast4 || cardLast4.length !== 4) { toast.error('Enter valid last 4 digits'); return; }
    setLoading(true);
    const res = await base44.functions.invoke('requestPayout', {
      booking_id: booking.id,
      provider_id: booking.provider_id,
      amount: booking.provider_payout,
      currency: 'usd',
      card_last4: cardLast4,
      card_brand: cardBrand,
      payout_method: payoutMethod,
    });
    setLoading(false);
    if (res.data?.success) {
      toast.success(`Payout of $${booking.provider_payout?.toFixed(2)} sent to your ${cardBrand} •••• ${cardLast4}`);
      onSuccess?.();
      onClose();
    } else {
      toast.error(res.data?.error || 'Payout failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <CreditCard className="w-5 h-5 text-blue-600" /> Request Payout
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Amount to receive</p>
            <p className="text-3xl font-bold text-blue-700">${booking?.provider_payout?.toFixed(2)}</p>
          </div>

          <div>
            <Label>Payout Method</Label>
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="prepaid_card">Prepaid Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Card Brand</Label>
            <Select value={cardBrand} onValueChange={setCardBrand}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="amex">Amex</SelectItem>
                <SelectItem value="discover">Discover</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Card Last 4 Digits</Label>
            <Input maxLength={4} value={cardLast4} onChange={e => setCardLast4(e.target.value.replace(/\D/g, ''))}
              placeholder="4242" className="mt-1.5 tracking-widest text-lg font-mono" />
          </div>

          <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3 text-xs text-green-700">
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Payouts are processed securely via Stripe. Funds typically arrive within 1–2 business days.
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Send Payout`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}