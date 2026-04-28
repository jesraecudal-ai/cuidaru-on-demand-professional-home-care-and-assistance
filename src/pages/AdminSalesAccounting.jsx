import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';

export default function AdminSalesAccounting() {
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalFees: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    completedBookings: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txns, bkgs] = await Promise.all([
          base44.entities.PaymentTransaction.list(),
          base44.entities.Booking.list()
        ]);

        setTransactions(txns || []);
        setBookings(bkgs || []);

        // Calculate metrics
        const completed = (bkgs || []).filter(b => b.status === 'completed');
        const totalFee = (txns || [])
          .filter(t => t.type === 'platform_fee')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalPayout = (txns || [])
          .filter(t => t.type === 'payout_released')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const pending = (txns || [])
          .filter(t => t.status === 'pending' && t.type === 'payout_released')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const totalRev = (txns || [])
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        setMetrics({
          totalRevenue: totalRev,
          totalFees: totalFee,
          totalPayouts: totalPayout,
          pendingPayouts: pending,
          completedBookings: completed.length,
          totalTransactions: txns?.length || 0
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMonthlyRevenue = () => {
    const months = {};
    (transactions || [])
      .filter(t => t.status === 'completed')
      .forEach(t => {
        const date = new Date(t.created_date);
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months[month] = (months[month] || 0) + (t.amount || 0);
      });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  };

  const getRevenueByCountry = () => {
    const countries = {};
    (bookings || [])
      .filter(b => b.status === 'completed' && b.country)
      .forEach(b => {
        countries[b.country] = (countries[b.country] || 0) + (b.platform_fee || 0);
      });
    return Object.entries(countries).map(([country, fee]) => ({ country, fee }));
  };

  const getTransactionTypes = () => {
    const types = {};
    (transactions || []).forEach(t => {
      const type = t.type || 'other';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  };

  const colors = ['#0066cc', '#00b366', '#ff9900', '#cc0000', '#9900cc'];
  const recentTransactions = (transactions || []).slice(0, 10);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales & Accounting</h1>
          <p className="text-gray-600">Platform financial overview and transaction tracking</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">{metrics.totalTransactions} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalFees.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">From completed jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provider Payouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalPayouts.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">Released to providers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.pendingPayouts.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting release</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completedBookings}</div>
              <p className="text-xs text-gray-600 mt-1">Successful jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(metrics.totalFees - (metrics.pendingPayouts > 0 ? metrics.pendingPayouts : metrics.totalPayouts)).toFixed(2)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Fees minus payouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMonthlyRevenue()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#0066cc" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Country */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Country</CardTitle>
              <CardDescription>Platform fees collected</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getRevenueByCountry()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="fee" fill="#00b366" name="Fees" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transaction Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Types</CardTitle>
              <CardDescription>Distribution of transaction types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getTransactionTypes()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {getTransactionTypes().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(txn.created_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{txn.type}</Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold">${(txn.amount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={txn.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {txn.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{txn.booking_id?.slice(0, 8)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}