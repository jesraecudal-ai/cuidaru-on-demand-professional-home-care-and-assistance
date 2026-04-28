import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import PrescriptionCard from '@/components/prescriptions/PrescriptionCard';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Prescriptions() {
  const { profile } = useUserProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [paidPrescriptions, setPaidPrescriptions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const user = profile;
  const isDoctor = profile?.role === 'provider' || profile?.role === 'both';

  // Check payment status
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const prescriptionId = searchParams.get('prescription_id');

    if (paymentStatus === 'success' && prescriptionId) {
      toast.success('Payment successful! You can now download the prescription.');
      setPaidPrescriptions(prev => new Set([...prev, prescriptionId]));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        if (isDoctor) {
          // Doctor sees prescriptions they created
          const docs = await base44.entities.Prescription.filter({
            doctor_email: user?.email
          });
          setPrescriptions(docs || []);
        } else {
          // Patient sees prescriptions for them
          const patientRx = await base44.entities.Prescription.filter({
            patient_email: user?.email
          });
          setPrescriptions(patientRx || []);
        }
      } catch (error) {
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchPrescriptions();
    }
  }, [user?.email, isDoctor]);

  const handleDownloadClick = async (prescription) => {
    if (prescription.doctor_email === user?.email) {
      // Doctor can download freely
      const response = await base44.functions.invoke('generatePrescriptionPDF', {
        prescriptionId: prescription.id
      });

      const link = document.createElement('a');
      link.href = response.data.pdf_url;
      link.download = `prescription_${prescription.id}.pdf`;
      link.click();
      toast.success('Prescription downloaded');
    } else {
      // Patient needs to pay
      try {
        const response = await base44.functions.invoke('downloadPrescriptionPayment', {
          prescriptionId: prescription.id
        });

        if (response.data.checkout_url) {
          window.location.href = response.data.checkout_url;
        }
      } catch (error) {
        toast.error('Failed to process payment');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (isDoctor) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescriptions</h1>
          <p className="text-gray-600">Create and manage prescriptions for your patients</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="issued">
              Issued ({prescriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="border border-gray-100 shadow-sm bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Create prescriptions during consultations</p>
                  <p className="text-sm text-blue-800 mt-1">Set your own download fee so patients can pay to receive their prescription/receta</p>
                </div>
              </div>
            </Card>

            {/* Patient Selection */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Select Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter patient email..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    onChange={(e) => {
                      const email = e.target.value;
                      if (email) {
                        setSelectedPatient({
                          email,
                          name: email.split('@')[0],
                          dob: ''
                        });
                      }
                    }}
                  />
                  {selectedPatient && (
                    <div className="space-y-3 mt-4 pt-4 border-t">
                      <input
                        type="text"
                        placeholder="Patient full name"
                        value={selectedPatient.name}
                        onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="date"
                        value={selectedPatient.dob}
                        onChange={(e) => setSelectedPatient({ ...selectedPatient, dob: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedPatient?.dob && (
              <PrescriptionForm
                doctor={profile}
                patientEmail={selectedPatient.email}
                patientName={selectedPatient.name}
                patientDob={selectedPatient.dob}
                onCreated={() => {
                  setSelectedPatient(null);
                  base44.entities.Prescription.filter({ doctor_email: user?.email }).then(setPrescriptions);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="issued" className="space-y-4">
            {prescriptions.length === 0 ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-8 text-center text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-700">No prescriptions yet</p>
                  <p className="text-sm">Create your first prescription to get started</p>
                </CardContent>
              </Card>
            ) : (
              prescriptions.map(rx => (
                <PrescriptionCard
                  key={rx.id}
                  prescription={rx}
                  userEmail={user?.email}
                  isPaid={true}
                  onDownload={handleDownloadClick}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Patient view
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
        <p className="text-gray-600">View and download prescriptions from your doctors</p>
      </div>

      {prescriptions.length === 0 ? (
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No prescriptions</p>
            <p className="text-sm">You don't have any prescriptions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map(rx => (
            <PrescriptionCard
              key={rx.id}
              prescription={rx}
              userEmail={user?.email}
              isPaid={paidPrescriptions.has(rx.id)}
              onDownload={handleDownloadClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}