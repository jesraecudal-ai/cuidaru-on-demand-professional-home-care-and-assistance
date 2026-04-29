import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsAndConditionsModal({ open, onAccept, onDecline }) {
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
          <DialogTitle>Terms and Conditions</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Please review and accept our Terms and Conditions to continue
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4 text-sm leading-relaxed pr-4">
            <section>
              <h3 className="font-semibold text-base mb-2">Our Role</h3>
              <p className="text-muted-foreground mb-2">
                Cuidaru is ONLY a technology platform that connects clients with independent service providers. We are not a service provider ourselves.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Cuidaru does NOT employ or supervise service providers</li>
                <li>All providers are independent contractors</li>
                <li>Cuidaru does NOT guarantee service quality or outcome</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Your Responsibility</h3>
              <p className="text-muted-foreground">
                You are responsible for verifying information, selecting providers carefully, and assuming all risks when engaging with other users.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Payments and Escrow</h3>
              <p className="text-muted-foreground mb-2">
                All payments are processed through Cuidaru using our escrow system:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Payment held safely after booking</li>
                <li>Released after service completion</li>
                <li>Client has 24 hours to release or dispute</li>
                <li>Auto-releases if no dispute is filed</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Platform Fees</h3>
              <p className="text-muted-foreground">
                Cuidaru charges a 10% service fee per transaction. Fees may be waived with an active premium subscription and may vary by country.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Tax Responsibility</h3>
              <p className="text-muted-foreground mb-2 font-semibold">
                ⚠️ Important: You are responsible for all taxes on your income or expenses
              </p>
              <p className="text-muted-foreground">
                Cuidaru does NOT calculate, collect, or report taxes on behalf of users. Service providers must declare all income and pay applicable taxes as required by law.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Limitation of Liability</h3>
              <p className="text-muted-foreground">
                Cuidaru is NOT liable for service quality, injuries, damages, or disputes between users. You use the platform at your own risk.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">No Off-Platform Transactions</h3>
              <p className="text-muted-foreground">
                You must not arrange payments or services outside the platform. Violations may result in account suspension or termination.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Account Suspension</h3>
              <p className="text-muted-foreground">
                Cuidaru may suspend or terminate accounts for fraud, abuse, illegal activity, or violation of these terms.
              </p>
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
            <span className="text-sm leading-relaxed">
              I have read and agree to the Terms and Conditions. I understand that Cuidaru is a marketplace platform only, and I accept full responsibility for my actions and transactions.
            </span>
          </label>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={!agreed}
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}