import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PrescriptionForm({ doctor, patientEmail, patientName, patientDob, onCreated }) {
  const [consultation, setConsultation] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [downloadPrice, setDownloadPrice] = useState(5);
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const updateMedicine = (idx, field, value) => {
    const updated = [...medicines];
    updated[idx][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consultation.trim() || medicines.some(m => !m.name || !m.dosage || !m.frequency)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const prescription = {
        doctor_id: doctor.id,
        doctor_email: doctor.user_email,
        doctor_name: doctor.full_name,
        patient_email: patientEmail,
        patient_name: patientName,
        patient_dob: patientDob,
        consultation_result: consultation,
        recommendation: recommendation,
        medicines: medicines.filter(m => m.name),
        download_price: downloadPrice,
        status: 'issued',
        issued_date: today,
        expiry_date: expiryDate.toISOString().split('T')[0]
      };

      await base44.entities.Prescription.create(prescription);
      toast.success('Prescription created successfully');
      onCreated?.();
    } catch (error) {
      toast.error(error.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>📋 Create Prescription</span>
          <Badge variant="secondary">Valid 30 days</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-gray-700">Patient</p>
            <p className="text-sm text-gray-600">{patientName} • DOB: {patientDob}</p>
          </div>

          {/* Consultation Result */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultation Result <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={consultation}
              onChange={(e) => setConsultation(e.target.value)}
              placeholder="Enter consultation findings and diagnosis..."
              className="min-h-24"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            <Textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Enter any recommendations for the patient..."
              className="min-h-20"
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Medicines <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedicine}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Add Medicine
              </Button>
            </div>

            <div className="space-y-4">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-4 rounded-lg space-y-3 relative"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Medicine name *"
                      value={med.name}
                      onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Dosage (e.g., 500mg) *"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Frequency (e.g., 2x daily) *"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Duration (e.g., 7 days)"
                      value={med.duration}
                      onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Input
                    placeholder="Instructions (optional)"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                    className="text-sm"
                  />

                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Download Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Download Fee (USD) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-blue-600">$</span>
              <Input
                type="number"
                min="0.50"
                step="0.50"
                value={downloadPrice}
                onChange={(e) => setDownloadPrice(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-500">Patients pay this to download</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-10"
          >
            <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Prescription'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}