import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';
import { 
  TrendingUp, TrendingDown, DollarSign, Download, FileText,
  Printer, Wrench, Clock, CheckCircle, AlertCircle, Users, Home
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString() + ' DZD';
};

export default function StatisticsPage() {
  const router = useRouter();
  const [building, setBuilding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'monthly' | 'yearly' | 'all'>('monthly');
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
    projectedAnnual: 0,
    maintenanceTotal: 0,
    maintenancePending: 0,
    maintenanceInProgress: 0,
    maintenanceCompleted: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    fetchBuilding();
  }, []);

  useEffect(() => {
    if (building) {
      fetchStatistics();
      fetchMaintenanceStats();
    }
  }, [building, period]);

  const fetchBuilding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .single();
      setBuilding(data);
    }
    setLoading(false);
  };

  const fetchStatistics = async () => {
    if (!building) return;
    
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('*, residents(full_name)')
        .eq('building_id', building.id);
      
      if (!payments || payments.length === 0) {
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
      
      setStats(prev => ({
        ...prev,
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
      }));
      
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchMaintenanceStats = async () => {
    if (!building) return;
    
    try {
      const { data: requests } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('building_id', building.id);
      
      if (!requests || requests.length === 0) {
        return;
      }
      
      const total = requests.length;
      const pending = requests.filter(r => r.status === 'pending').length;
      const inProgress = requests.filter(r => r.status === 'in_progress').length;
      const completed = requests.filter(r => r.status === 'completed').length;
      
      let totalResponseTime = 0;
      let responseCount = 0;
      
      requests.forEach(r => {
        if (r.created_at && (r.status === 'in_progress' || r.status === 'completed')) {
          const created = new Date(r.created_at);
          const now = new Date();
          const hours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
          totalResponseTime += hours;
          responseCount++;
        }
      });
      
      const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
      
      setStats(prev => ({
        ...prev,
        maintenanceTotal: total,
        maintenancePending: pending,
        maintenanceInProgress: inProgress,
        maintenanceCompleted: completed,
        avgResponseTime,
      }));
      
    } catch (err) {
      console.error('Error fetching maintenance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(10, 26, 62);
    doc.text('SYNDIX Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(136, 146, 170);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Building: ${building?.name || 'N/A'}`, pageWidth / 2, 37, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(10, 26, 62);
    doc.text('Summary', 14, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', formatCurrency(stats.totalRevenue)],
        ['Collection Rate', `${stats.collectionRate.toFixed(1)}%`],
        ['Average Monthly', formatCurrency(stats.averageMonthly)],
        ['Projected Annual', formatCurrency(stats.projectedAnnual)],
        ['Total Invoices', stats.totalInvoices.toString()],
        ['Paid Invoices', stats.paidInvoices.toString()],
        ['Pending Invoices', stats.pendingInvoices.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [28, 43, 107], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
    });
    
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(10, 26, 62);
    doc.text('Maintenance Overview', 14, finalY);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Metric', 'Value']],
      body: [
        ['Total Requests', stats.maintenanceTotal.toString()],
        ['Pending', stats.maintenancePending.toString()],
        ['In Progress', stats.maintenanceInProgress.toString()],
        ['Completed', stats.maintenanceCompleted.toString()],
        ['Avg Response Time', `${stats.avgResponseTime} hours`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [28, 43, 107], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(10, 26, 62);
    doc.text('Monthly Breakdown', 14, finalY);
    
    const monthlyData = stats.monthlyData.map(d => [
      d.month,
      formatCurrency(d.amount),
      formatCurrency(d.paid),
      formatCurrency(d.amount - d.paid),
      `${((d.paid / d.amount) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Month', 'Total', 'Paid', 'Pending', 'Rate']],
      body: monthlyData,
      theme: 'striped',
      headStyles: { fillColor: [28, 43, 107], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 10;
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(10, 26, 62);
    doc.text('Top Paying Residents', 14, finalY);
    
    const topResidentsData = stats.topResidents.map((r, idx) => [
      (idx + 1).toString(),
      r.name,
      formatCurrency(r.amount)
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Rank', 'Resident Name', 'Total Paid']],
      body: topResidentsData,
      theme: 'striped',
      headStyles: { fillColor: [28, 43, 107], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
    });
    
    doc.save(`financial-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Export to CSV
  const exportToCSV = () => {
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
    csvRows.push(['MAINTENANCE', '', '', '', '']);
    csvRows.push(['Total Requests', stats.maintenanceTotal.toString(), '', '', '']);
    csvRows.push(['Pending', stats.maintenancePending.toString(), '', '', '']);
    csvRows.push(['In Progress', stats.maintenanceInProgress.toString(), '', '', '']);
    csvRows.push(['Completed', stats.maintenanceCompleted.toString(), '', '', '']);
    csvRows.push(['Avg Response Time', `${stats.avgResponseTime} hours`, '', '', '']);
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
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Loading SYNDIX…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <Layout title="Financial Statistics" subtitle="Track your building's financial performance">
      {stats.totalInvoices === 0 ? (
        <div className="fade-up" style={{
          background: T.white, borderRadius:20, padding:'48px 20px', textAlign:'center',
          border:`1px solid ${T.border}`
        }}>
          <FileText size={48} color={T.textSm} style={{ margin:'0 auto 12px', display:'block' }} />
          <p style={{ margin:0, fontSize:13, color:T.textSm }}>No payment data available yet</p>
          <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>Generate monthly fees to see statistics</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hero Section */}
          <div className="fade-up" style={{
            borderRadius:20, padding:'26px 30px',
            background: `linear-gradient(130deg, ${T.navyDeep} 0%, ${T.navy} 55%, #1A4D7C 100%)`,
            position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', right:-40, top:-40, width:220, height:220, borderRadius:'50%', background:`radial-gradient(circle, ${T.teal}20 0%, transparent 70%)`, pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${T.orange}, ${T.teal}, transparent)` }} />
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:T.green }} />
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Analytics Dashboard</span>
                </div>
                <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
                  Financial Overview 📊
                </h2>
                <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
                  {building?.name} · Collection rate: {stats.collectionRate.toFixed(1)}%
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={exportToPDF} style={{ padding:'8px 20px', borderRadius:30, background: 'rgba(255,255,255,0.08)', border: `1px solid ${T.orange}30`, display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <Printer size={16} color={T.orange} />
                  <span style={{ fontSize:13, color: T.orange, fontWeight:600 }}>PDF Report</span>
                </button>
                <button onClick={exportToCSV} style={{ padding:'8px 20px', borderRadius:30, background: 'rgba(255,255,255,0.08)', border: `1px solid ${T.teal}30`, display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <Download size={16} color={T.teal} />
                  <span style={{ fontSize:13, color: T.teal, fontWeight:600 }}>CSV Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="fade-up-2" style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', gap:8, background: T.surface, borderRadius:12, padding:4 }}>
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'yearly', label: 'Yearly' },
                { id: 'all', label: 'All Time' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id as any)}
                  style={{
                    padding: '6px 20px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: period === opt.id ? T.white : 'transparent',
                    color: period === opt.id ? T.navy : T.textMd,
                    border: period === opt.id ? `1px solid ${T.border}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: period === opt.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards - Financial */}
          <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyDeep})`, borderRadius: 16, padding: 18, color: T.white }}>
              <p style={{ margin:0, fontSize:11, color: 'rgba(255,255,255,0.6)' }}>TOTAL REVENUE</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800 }}>{formatCurrency(stats.totalRevenue)}</p>
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
                {stats.revenueGrowth >= 0 ? <TrendingUp size={12} color={T.green} /> : <TrendingDown size={12} color={T.red} />}
                <span>{Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month</span>
              </div>
            </div>

            <div style={{ background: T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
              <p style={{ margin:0, fontSize:11, color: T.textSm }}>COLLECTION RATE</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800, color: T.navy }}>{stats.collectionRate.toFixed(1)}%</p>
              <div style={{ width:'100%', height:6, background: T.border, borderRadius:99, overflow:'hidden' }}>
                <div style={{ width: `${stats.collectionRate}%`, height: '100%', background: T.green, borderRadius:99 }} />
              </div>
            </div>

            <div style={{ background: T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
              <p style={{ margin:0, fontSize:11, color: T.textSm }}>AVERAGE MONTHLY</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800, color: T.navy }}>{formatCurrency(stats.averageMonthly)}</p>
              <p style={{ margin:0, fontSize:10, color: T.textSm }}>Projected: {formatCurrency(stats.projectedAnnual)}/year</p>
            </div>

            <div style={{ background: T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
              <p style={{ margin:0, fontSize:11, color: T.textSm }}>INVOICES</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800, color: T.navy }}>{stats.totalInvoices}</p>
              <div style={{ display:'flex', gap:12, fontSize:10 }}>
                <span style={{ color: T.green }}>{stats.paidInvoices} Paid</span>
                <span style={{ color: T.orange }}>{stats.pendingInvoices} Pending</span>
              </div>
            </div>
          </div>

          {/* Simple Monthly Table instead of charts */}
          <div className="fade-up-3" style={{ background: T.white, borderRadius:18, padding:20, border:`1px solid ${T.border}` }}>
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color: T.navy }}>Monthly Revenue 📋</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: 12, color: T.textSm, fontWeight: 600 }}>Month</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontSize: 12, color: T.textSm, fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontSize: 12, color: T.textSm, fontWeight: 600 }}>Paid</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontSize: 12, color: T.textSm, fontWeight: 600 }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.monthlyData.map((data, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '10px', fontSize: 13, color: T.text }}>{data.month}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: T.navy }}>{formatCurrency(data.amount)}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontSize: 13, color: T.green }}>{formatCurrency(data.paid)}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontSize: 13, color: data.paid / data.amount > 0.7 ? T.green : T.orange }}>
                        {((data.paid / data.amount) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maintenance Section - Clean cards */}
          <div className="fade-up-3" style={{ background: T.white, borderRadius:18, padding:20, border:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Wrench size={18} color={T.orange} />
              <h3 style={{ margin:0, fontSize:15, fontWeight:700, color: T.navy }}>Maintenance Overview</h3>
            </div>
            
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
              <div style={{ textAlign:'center', padding:12, background:T.surface, borderRadius:12 }}>
                <p style={{ margin:0, fontSize:24, fontWeight:800, color:T.navy }}>{stats.maintenanceTotal}</p>
                <p style={{ margin:0, fontSize:11, color:T.textSm }}>Total</p>
              </div>
              <div style={{ textAlign:'center', padding:12, background:T.orangeLight, borderRadius:12 }}>
                <p style={{ margin:0, fontSize:24, fontWeight:800, color:T.orange }}>{stats.maintenancePending}</p>
                <p style={{ margin:0, fontSize:11, color:T.textSm }}>Pending</p>
              </div>
              <div style={{ textAlign:'center', padding:12, background:T.tealLight, borderRadius:12 }}>
                <p style={{ margin:0, fontSize:24, fontWeight:800, color:T.teal }}>{stats.maintenanceInProgress}</p>
                <p style={{ margin:0, fontSize:11, color:T.textSm }}>In Progress</p>
              </div>
              <div style={{ textAlign:'center', padding:12, background:T.greenLight, borderRadius:12 }}>
                <p style={{ margin:0, fontSize:24, fontWeight:800, color:T.green }}>{stats.maintenanceCompleted}</p>
                <p style={{ margin:0, fontSize:11, color:T.textSm }}>Completed</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: T.surface, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color={T.teal} />
                <span style={{ fontSize: 13, color: T.textMd }}>Average Response Time</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>{stats.avgResponseTime} <span style={{ fontSize: 12, fontWeight: 400, color: T.textSm }}>hours</span></span>
            </div>
          </div>

          {/* Top Residents */}
          <div className="fade-up-3" style={{ background: T.white, borderRadius:18, padding:20, border:`1px solid ${T.border}` }}>
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color: T.navy }}>Top Paying Residents 🏆</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {stats.topResidents.map((resident, idx) => (
                <div key={idx} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'12px 16px', borderRadius:12,
                  background: idx === 0 ? T.orangeLight : idx === 1 ? T.tealLight : T.surface,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{
                      width:28, height:28, borderRadius:14,
                      background: idx === 0 ? T.orange : idx === 1 ? T.teal : T.navy,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700, color: '#fff'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize:14, fontWeight:500, color: T.navy }}>{resident.name}</span>
                  </div>
                  <span style={{ fontSize:15, fontWeight:700, color: idx === 0 ? T.orange : T.navy }}>{formatCurrency(resident.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fade-up {
          animation: fadeUp 0.5s ease both;
        }
        .fade-up-2 {
          animation: fadeUp 0.5s 0.08s ease both;
        }
        .fade-up-3 {
          animation: fadeUp 0.5s 0.16s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </Layout>
  );
}