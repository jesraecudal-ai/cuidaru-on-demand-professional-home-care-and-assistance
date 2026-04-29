import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Loader2, ShieldCheck, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PayoutRequestModal({ open, onClose, booking, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [useManual, setUseManual] = useState(false);

  // Manual entry fields (fallback)
  const [cardLast4, setCardLast4] = useState('');
  const [cardBrand, setCardBrand] = useState('visa');
  const [payoutMethod, setPayoutMethod] = useState('debit_card');

  useEffect(() => {
    if (!open) return;
    setLoadingCards(true);
    base44.auth.me().then(user => {
      if (!user) { setLoadingCards(false); return; }
      base44.entities.SavedPaymentMethod.filter({ user_email: user.email, user_role: 'provider' })
        .then(cards => {
          setSavedCards(cards);
          if (cards.length > 0) {
            const def = cards.find(c => c.is_default) || cards[0];
            setSelectedCardId(def.id);
            setUseManual(false);
          } else {
            setUseManual(true);
          }
          setLoadingCards(false);
        })
        .catch(() => { setUseManual(true); setLoadingCards(false); });
    });
  }, [open]);

  const getCardDetails = () => {
    if (!useManual && selectedCardId) {
      const card = savedCards.find(c => c.id === selectedCardId);
      if (card) return { last4: card.card_last4, brand: card.card_brand, method: card.card_type === 'prepaid' ? 'prepaid_card' : 'debit_card' };
    }
    return { last4: cardLast4, brand: cardBrand, method: payoutMethod };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { last4, brand, method } = getCardDetails();
    if (!last4 || last4.length !== 4) { toast.error('Enter valid last 4 digits'); return; }
    setLoading(true);
    const res = await base44.functions.invoke('requestPayout', {
      booking_id: booking.id,
      provider_id: booking.provider_id,
      amount: booking.provider_payout,
      currency: 'usd',
      card_last4: last4,
      card_brand: brand,
      payout_method: method,
    });
    setLoading(false);
    if (res.data?.success) {
      toast.success(`Payout of $${booking.provider_payout?.toFixed(2)} sent to ${brand} •••• ${last4}`);
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

          {loadingCards ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : savedCards.length > 0 && !useManual ? (
            <>
              <div>
                <Label>Pay to card</Label>
                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a card" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedCards.map(card => (
                      <SelectItem key={card.id} value={card.id}>
                        <span className="capitalize">{card.card_brand}</span> •••• {card.card_last4}
                        {card.is_default && <span className="ml-2 text-xs text-blue-500">(default)</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                onClick={() => setUseManual(true)}
              >
                <Plus className="w-3 h-3" /> Use a different card
              </button>
            </>
          ) : (
            <>
              {savedCards.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-blue-500 hover:underline"
                  onClick={() => setUseManual(false)}
                >
                  ← Back to saved cards
                </button>
              )}
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
                <Input
                  maxLength={4}
                  value={cardLast4}
                  onChange={e => setCardLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="4242"
                  className="mt-1.5 tracking-widest text-lg font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3 text-xs text-green-700">
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Payouts are processed securely via Stripe. Funds typically arrive within 1–2 business days.
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading || loadingCards}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Payout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}