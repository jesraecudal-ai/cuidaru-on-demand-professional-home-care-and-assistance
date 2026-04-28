import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ConsultationCard from '@/components/consultations/ConsultationCard';
import { useUserProfile } from '@/lib/useUserProfile';

export default function Consultations() {
  const { user, profile } = useUserProfile();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [providerProfile, setProviderProfile] = useState(null);

  const isDoctor = profile?.role === 'provider' || profile?.role === 'both';

  useEffect(() => {
    if (!user) return;

    const loadConsultations = async () => {
      setLoading(true);
      try {
        let data = [];
        if (isDoctor) {
          // Doctor: see consultations they received
          const providers = await base44.entities.ServiceProvider.filter({ user_email: user.email });
          if (providers.length > 0) {
            setProviderProfile(providers[0]);
            data = await base44.entities.Consultation.filter({ doctor_id: providers[0].id });
          }
        } else {
          // Client: see consultations they booked
          data = await base44.entities.Consultation.filter({ client_email: user.email });
        }
        setConsultations(data || []);
      } catch (error) {
        console.error('Failed to load consultations', error);
        toast.error('Failed to load consultations');
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, [user, isDoctor]);

  const upcomingConsultations = consultations.filter(c => new Date(c.scheduled_date) > new Date());
  const completedConsultations = consultations.filter(c => new Date(c.scheduled_date) <= new Date() && c.status === 'completed');
  const pendingConsultations = consultations.filter(c => c.status === 'pending');

  const handleChat = (consultation) => {
    // Navigate to messages with consultation conversation ID
    window.location.href = `/messages?conversation=${consultation.conversation_id}`;
  };

  const handlePay = async (consultation) => {
    if (window.self !== window.top) {
      toast.error('Checkout only works from the published app.');
      return;
    }

    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        consultation_id: consultation.id,
        amount: consultation.fee,
        currency: 'usd',
        doctor_name: consultation.doctor_name,
        description: `${consultation.consultation_type} consultation with ${consultation.doctor_name}`,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Failed to start checkout');
      }
    } catch (error) {
      toast.error('Payment error');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" /> Consultations
          </h1>
          <p className="text-gray-500 mt-1">
            {isDoctor ? 'Manage your consultation bookings' : 'View your consultation appointments'}
          </p>
        </div>
      </div>

      {isDoctor && providerProfile && !providerProfile.consultation_fee && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Set your consultation fee</p>
              <p className="text-xs text-amber-700 mt-1">Go to your profile to set your consultation fee so clients can book.</p>
              <Button size="sm" variant="outline" className="mt-2 gap-1.5 text-amber-700 border-amber-300"
                onClick={() => window.location.href = '/my-profile'}>
                <DollarSign className="w-3.5 h-3.5" /> Set Fee
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming" className="gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Upcoming
            {upcomingConsultations.length > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5">{upcomingConsultations.length}</span>
            )}
          </TabsTrigger>
          {isDoctor && (
            <TabsTrigger value="pending" className="gap-1.5">
              Pending Approval
              {pendingConsultations.length > 0 && (
                <span className="ml-1 bg-amber-600 text-white text-xs rounded-full px-1.5">{pendingConsultations.length}</span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="completed" className="gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingConsultations.length === 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No upcoming consultations</p>
                <p className="text-sm text-gray-400 mt-1">
                  {isDoctor ? 'Consultations will appear here when clients book.' : 'Book a consultation with a doctor to get started.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingConsultations.map(c => (
                <ConsultationCard
                  key={c.id}
                  consultation={c}
                  onChat={handleChat}
                  onPay={handlePay}
                  isDoctor={isDoctor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {isDoctor && (
          <TabsContent value="pending">
            {pendingConsultations.length === 0 ? (
              <Card className="border border-gray-100">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No pending consultations</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingConsultations.map(c => (
                  <ConsultationCard
                    key={c.id}
                    consultation={c}
                    onChat={handleChat}
                    onPay={handlePay}
                    isDoctor={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="completed">
          {completedConsultations.length === 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No completed consultations</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedConsultations.map(c => (
                <ConsultationCard
                  key={c.id}
                  consultation={c}
                  onChat={handleChat}
                  onPay={handlePay}
                  isDoctor={isDoctor}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}