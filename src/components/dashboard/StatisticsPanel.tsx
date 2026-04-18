import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Download, FileText, Activity, PieChart, BarChart3
} from 'lucide-react';

interface StatisticsPanelProps {
  buildingId: string;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString() + ' DZD';
};

const StatisticsPanel = ({ buildingId }: StatisticsPanelProps) => {
  const [period, setPeriod] = useState<'monthly' | 'yearly' | 'all'>('monthly');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageMonthly: 0,
    collectionRate: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    monthlyData: [] as { month: string; amount: number; paid: number }[],
    topResidents: [] as { name: string; amount: number }[],
    revenueGrowth: 0,
    projectedAnnual: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, [buildingId, period]);

  const fetchStatistics = async () => {
    setLoading(true);
    
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*, residents(full_name)')
        .eq('building_id', buildingId);
      
      if (error || !payments || payments.length === 0) {
        setLoading(false);
        return;
      }
      
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
      const collectionRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;
      
      const monthlyMap = new Map();
      payments.forEach(p => {
        const month = new Date(p.month).toLocaleDateString('en', { month: 'short', year: 'numeric' });
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { amount: 0, paid: 0 });
        }
        const data = monthlyMap.get(month);
        data.amount += p.amount;
        if (p.status === 'paid') data.paid += p.amount;
      });
      
      const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        amount: data.amount,
        paid: data.paid
      })).reverse();
      
      const residentMap = new Map();
      payments.forEach(p => {
        const name = p.residents?.full_name || 'Unknown';
        if (!residentMap.has(name)) {
          residentMap.set(name, 0);
        }
        if (p.status === 'paid') {
          residentMap.set(name, residentMap.get(name) + p.amount);
        }
      });
      
      const topResidents = Array.from(residentMap.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      const lastMonth = monthlyData[0]?.amount || 0;
      const previousMonth = monthlyData[1]?.amount || 0;
      const revenueGrowth = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
      const averageMonthly = monthlyData.reduce((sum, m) => sum + m.amount, 0) / (monthlyData.length || 1);
      const projectedAnnual = averageMonthly * 12;
      
      setStats({
        totalRevenue,
        averageMonthly,
        collectionRate,
        pendingAmount,
        paidAmount,
        totalInvoices: payments.length,
        paidInvoices: payments.filter(p => p.status === 'paid').length,
        pendingInvoices: payments.filter(p => p.status === 'pending').length,
        monthlyData,
        topResidents,
        revenueGrowth,
        projectedAnnual
      });
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvRows = [];
    csvRows.push(['Month', 'Total Amount (DZD)', 'Paid Amount (DZD)', 'Pending Amount (DZD)', 'Collection Rate (%)']);
    
    stats.monthlyData.forEach(data => {
      const pendingAmount = data.amount - data.paid;
      const rate = data.amount > 0 ? (data.paid / data.amount) * 100 : 0;
      csvRows.push([
        data.month,
        data.amount.toLocaleString(),
        data.paid.toLocaleString(),
        pendingAmount.toLocaleString(),
        rate.toFixed(1)
      ]);
    });
    
    csvRows.push([]);
    csvRows.push(['SUMMARY', '', '', '', '']);
    csvRows.push(['Total Revenue', stats.totalRevenue.toLocaleString(), '', '', '']);
    csvRows.push(['Collection Rate', stats.collectionRate.toFixed(1) + '%', '', '', '']);
    csvRows.push(['Average Monthly', stats.averageMonthly.toLocaleString(), '', '', '']);
    csvRows.push(['Projected Annual', stats.projectedAnnual.toLocaleString(), '', '', '']);
    csvRows.push([]);
    csvRows.push(['TOP PAYING RESIDENTS', '', '', '', '']);
    csvRows.push(['Rank', 'Resident Name', 'Total Paid (DZD)', '', '']);
    stats.topResidents.forEach((resident, idx) => {
      csvRows.push([(idx + 1).toString(), resident.name, resident.amount.toLocaleString(), '', '']);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-slate-500 mt-2">Loading statistics...</p>
      </div>
    );
  }

  if (stats.totalInvoices === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <FileText size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-400">No payment data available yet</p>
        <p className="text-xs text-slate-300 mt-1">Generate monthly fees to see statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
          {[
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' },
            { id: 'all', label: 'All Time' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === opt.id ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition"
        >
          <Download size={14} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-200 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm">
            {stats.revenueGrowth >= 0 ? (
              <TrendingUp size={14} className="text-green-300" />
            ) : (
              <TrendingDown size={14} className="text-red-300" />
            )}
            <span className={stats.revenueGrowth >= 0 ? 'text-green-300' : 'text-red-300'}>
              {Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm">Collection Rate</p>
              <p className="text-2xl font-bold text-slate-800">{stats.collectionRate.toFixed(1)}%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Activity size={20} className="text-green-600" />
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.collectionRate}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {formatCurrency(stats.paidAmount)} collected / {formatCurrency(stats.totalRevenue)} total
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm">Average Monthly</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.averageMonthly)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Projected Annual: {formatCurrency(stats.projectedAnnual)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm">Invoices</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalInvoices}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-green-600">{stats.paidInvoices} Paid</span>
            <span className="text-amber-600">{stats.pendingInvoices} Pending</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-orange-500" />
          Revenue Trend
        </h3>
        <div className="space-y-3">
          {stats.monthlyData.slice(0, 6).map((data, idx) => {
            const percentage = data.amount > 0 ? (data.paid / data.amount) * 100 : 0;
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{data.month}</span>
                  <span className="font-medium text-slate-800">{formatCurrency(data.amount)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-600">Collected: {formatCurrency(data.paid)}</span>
                  <span className="text-amber-600">Pending: {formatCurrency(data.amount - data.paid)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users size={18} className="text-orange-500" />
          Top Paying Residents
        </h3>
        <div className="space-y-3">
          {stats.topResidents.map((resident, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <span className="text-slate-700">{resident.name}</span>
              </div>
              <span className="font-semibold text-slate-800">{formatCurrency(resident.amount)}</span>
            </div>
          ))}
          {stats.topResidents.length === 0 && (
            <p className="text-slate-400 text-center py-4">No payment data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;