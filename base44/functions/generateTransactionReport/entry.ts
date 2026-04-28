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
    const { month, year, userRole } = body;

    if (!month || !year) {
      return Response.json({ error: 'Month and year required' }, { status: 400 });
    }

    // Determine date range
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // Fetch transactions
    let transactions = [];
    let userInfo = user.full_name;
    let reportTitle = '';
    let totalAmount = 0;

    if (userRole === 'provider') {
      // Provider: fetch payouts from bookings they provided
      const payouts = await base44.asServiceRole.entities.ProviderPayout.filter({
        provider_email: user.email
      });

      transactions = (payouts || []).filter(p => {
        const pDate = p.created_date || new Date().toISOString();
        return pDate >= startDate && pDate <= endDate;
      }).map(p => ({
        date: (p.created_date || '').split('T')[0],
        type: 'Booking Payout',
        description: `Payment for booking`,
        amount: p.amount,
        status: p.status,
        bookingId: p.booking_id
      }));

      reportTitle = 'Monthly Income Report';
      totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    } else {
      // Client: fetch payments made for bookings
      const payments = await base44.asServiceRole.entities.PaymentTransaction.filter({
        client_email: user.email
      });

      transactions = (payments || []).filter(p => {
        const pDate = p.created_date || new Date().toISOString();
        return pDate >= startDate && pDate <= endDate;
      }).map(p => ({
        date: (p.created_date || '').split('T')[0],
        type: p.type === 'escrow_deposit' ? 'Service Payment' : p.type,
        description: `Booking payment`,
        amount: p.amount,
        status: p.status,
        bookingId: p.booking_id
      }));

      reportTitle = 'Monthly Expense Report';
      totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 15;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text(reportTitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Period
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    doc.text(`Period: ${monthName}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // User info
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${userInfo}`, 15, yPos);
    yPos += 5;
    doc.text(`Email: ${user.email}`, 15, yPos);
    yPos += 8;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Transactions table
    if (transactions.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No transactions for this period', 15, yPos);
    } else {
      // Table headers
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(37, 99, 235);

      const tableTop = yPos;
      const colWidths = [25, 35, 50, 25, 25];
      const cols = ['Date', 'Type', 'Description', 'Amount', 'Status'];

      cols.forEach((col, i) => {
        const x = 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(col, x, tableTop + 5);
      });

      yPos = tableTop + 10;

      // Table rows
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);

      transactions.forEach((tx, idx) => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 15;
        }

        const bgColor = idx % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
        doc.setFillColor(...bgColor);
        doc.rect(15, yPos - 3, pageWidth - 30, 6, 'F');

        let colIdx = 0;
        const values = [
          tx.date,
          tx.type,
          tx.description,
          `$${tx.amount.toFixed(2)}`,
          tx.status
        ];

        values.forEach((val, i) => {
          const x = 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.text(val, x, yPos + 1);
        });

        yPos += 8;
      });

      // Summary
      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos, pageWidth - 15, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Total:', 15, yPos);
      doc.setFont(undefined, 'bold');
      doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    }

    // Footer
    yPos = pageHeight - 10;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | For business/tax purposes only`, 15, yPos);

    const pdfData = doc.output('arraybuffer');

    return Response.json({
      success: true,
      pdf_url: URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' })),
      fileName: `${userRole}_transactions_${year}-${String(month).padStart(2, '0')}.pdf`
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});