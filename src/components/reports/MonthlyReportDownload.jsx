import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MonthlyReportDownload({ userRole }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateTransactionReport', {
        month: selectedMonth,
        year: selectedYear,
        userRole: userRole
      });

      if (response.data.pdf_url) {
        const link = document.createElement('a');
        link.href = response.data.pdf_url;
        link.download = response.data.fileName;
        link.click();
        toast.success('Report downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const reportTitle = userRole === 'provider' ? 'Income Report' : 'Expense Report';

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Download Monthly {reportTitle}
          <Badge variant="secondary" className="ml-auto">For Tax Purposes</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {userRole === 'provider'
              ? 'Download a complete record of your monthly earnings and payouts for business accounting and tax filing.'
              : 'Download a complete record of your monthly service expenses for business accounting and tax filing.'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Month Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Period Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Selected Period:</span>{' '}
              {months[selectedMonth - 1]} {selectedYear}
            </p>
          </div>

          <Button
            onClick={handleDownload}
            disabled={loading}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-10"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Generating PDF...' : 'Download Report'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            PDF files include all transactions, amounts, and dates for your records
          </p>
        </div>
      </CardContent>
    </Card>
  );
}