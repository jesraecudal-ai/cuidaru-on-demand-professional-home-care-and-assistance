import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/lib/i18n';

export default function TermsAndConditionsModal({ open, onAccept, onDecline }) {
  const { t } = useI18n();
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      onAccept();
      setAgreed(false);
    }
  };

  const handleDecline = () => {
    onDecline();
    setAgreed(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{t('terms_title')}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">{t('terms_subtitle')}</p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4 text-sm leading-relaxed pr-4">
            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_our_role')}</h3>
              <p className="text-muted-foreground mb-2">{t('terms_our_role_desc')}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>{t('terms_our_role_li1')}</li>
                <li>{t('terms_our_role_li2')}</li>
                <li>{t('terms_our_role_li3')}</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_your_responsibility')}</h3>
              <p className="text-muted-foreground">{t('terms_your_responsibility_desc')}</p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_payments')}</h3>
              <p className="text-muted-foreground mb-2">{t('terms_payments_desc')}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>{t('terms_payments_li1')}</li>
                <li>{t('terms_payments_li2')}</li>
                <li>{t('terms_payments_li3')}</li>
                <li>{t('terms_payments_li4')}</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_fees')}</h3>
              <p className="text-muted-foreground">{t('terms_fees_desc')}</p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_tax')}</h3>
              <p className="text-muted-foreground mb-2 font-semibold">{t('terms_tax_warning')}</p>
              <p className="text-muted-foreground">{t('terms_tax_desc')}</p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_liability')}</h3>
              <p className="text-muted-foreground">{t('terms_liability_desc')}</p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_off_platform')}</h3>
              <p className="text-muted-foreground">{t('terms_off_platform_desc')}</p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">{t('terms_suspension')}</h3>
              <p className="text-muted-foreground">{t('terms_suspension_desc')}</p>
            </section>
          </div>
        </ScrollArea>

        <div className="border-t p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-1"
            />
            <span className="text-sm leading-relaxed">{t('terms_agree_checkbox')}</span>
          </label>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
            >
              {t('terms_decline')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={!agreed}
            >
              {t('terms_accept')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}