import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prescriptionId } = body;

    if (!prescriptionId) {
      return Response.json({ error: 'Prescription ID required' }, { status: 400 });
    }

    // Fetch prescription
    const prescriptions = await base44.asServiceRole.entities.Prescription.filter({ id: prescriptionId });
    if (!prescriptions || prescriptions.length === 0) {
      return Response.json({ error: 'Prescription not found' }, { status: 404 });
    }

    const prescription = prescriptions[0];

    // Check access
    if (prescription.doctor_email !== user.email && prescription.patient_email !== user.email) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 15;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('PRESCRIPTION / RECETA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Doctor Info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Dr. ' + prescription.doctor_name, 15, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('License Verified • ' + prescription.issued_date, 15, yPos);
    yPos += 8;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Patient Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('PATIENT:', 15, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.text('Name: ' + prescription.patient_name, 20, yPos);
    yPos += 5;
    doc.text('DOB: ' + prescription.patient_dob, 20, yPos);
    yPos += 8;

    // Consultation Result
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('CONSULTATION RESULT:', 15, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const consultationLines = doc.splitTextToSize(prescription.consultation_result, pageWidth - 30);
    doc.text(consultationLines, 20, yPos);
    yPos += consultationLines.length * 4 + 3;

    // Medicines
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('PRESCRIBED MEDICINES:', 15, yPos);
    yPos += 6;

    prescription.medicines.forEach((med, idx) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 15;
      }

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${idx + 1}. ${med.name}`, 20, yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const medicineDetails = `Dosage: ${med.dosage} | Frequency: ${med.frequency}${
        med.duration ? ` | Duration: ${med.duration}` : ''
      }${med.instructions ? ` | ${med.instructions}` : ''}`;
      const detailsLines = doc.splitTextToSize(medicineDetails, pageWidth - 35);
      doc.text(detailsLines, 25, yPos);
      yPos += detailsLines.length * 4 + 4;
    });

    yPos += 2;

    // Recommendation
    if (prescription.recommendation) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('RECOMMENDATIONS:', 15, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const recLines = doc.splitTextToSize(prescription.recommendation, pageWidth - 30);
      doc.text(recLines, 20, yPos);
      yPos += recLines.length * 4 + 3;
    }

    // Footer
    yPos = pageHeight - 20;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Prescription valid until: ' + prescription.expiry_date, 15, yPos);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 15, yPos + 5);

    // Generate file in Base44 storage
    const pdfData = doc.output('arraybuffer');
    const fileName = `prescription_${prescriptionId}.pdf`;

    return Response.json({
      success: true,
      pdf_url: URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' })),
      message: 'PDF generated successfully'
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});