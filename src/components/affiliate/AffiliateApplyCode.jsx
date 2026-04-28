import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export default function AffiliateApplyCode({ userEmail, onApplied }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke('affiliateApplyCode', { affiliate_code: code.trim() });
    setLoading(false);
    if (res.data?.success) {
      setApplied(true);
      toast.success(`Code applied! Thanks for using a referral code.`);
      if (onApplied) onApplied();
    } else {
      toast.error(res.data?.error || 'Could not apply code');
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm font-medium">
        <CheckCircle2 className="w-5 h-5" /> Referral code applied successfully!
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter affiliate code (e.g. JOHN1A2B)"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        className="font-mono uppercase tracking-wider"
        onKeyDown={e => e.key === 'Enter' && handleApply()}
      />
      <Button onClick={handleApply} disabled={loading || !code.trim()} className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
        {loading ? '...' : 'Apply'}
      </Button>
    </div>
  );
}