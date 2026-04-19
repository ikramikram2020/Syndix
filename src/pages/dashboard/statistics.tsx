import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';

import { 
  TrendingUp, TrendingDown, DollarSign, Users, Download, FileText,
  Activity, PieChart, BarChart3
} from 'lucide-react';



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
    projectedAnnual: 0
  });

  useEffect(() => {
    fetchBuilding();
  }, []);

  useEffect(() => {
    if (building) {
      fetchStatistics();
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
    setLoading(true);
    
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('*, residents(full_name)')
        .eq('building_id', building.id);
      
      if (!payments || payments.length === 0) {
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
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, fontFamily:'system-ui', margin:0 }}>Loading SYNDIX…</p>
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
        <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              <button
                onClick={exportReport}
                style={{
                  padding:'8px 20px', borderRadius:30,
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${T.orange}30`,
                  display:'flex', alignItems:'center', gap:8, cursor:'pointer'
                }}>
                <Download size={16} color={T.orange} />
                <span style={{ fontSize:13, color: T.orange, fontWeight:600 }}>Export Report</span>
              </button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="fade-up-2" style={{
            display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12
          }}>
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

          {/* Stats Cards */}
          <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {/* Total Revenue Card */}
            <div style={{
              background: `linear-gradient(135deg, ${T.navy}, ${T.navyDeep})`,
              borderRadius: 16, padding: 18, color: T.white
            }}>
              <p style={{ margin:0, fontSize:11, color: 'rgba(255,255,255,0.6)', letterSpacing:0.5 }}>TOTAL REVENUE</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800 }}>{formatCurrency(stats.totalRevenue)}</p>
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
                {stats.revenueGrowth >= 0 ? <TrendingUp size={12} color={T.green} /> : <TrendingDown size={12} color={T.red} />}
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month</span>
              </div>
            </div>

            {/* Collection Rate Card */}
            <div style={{ background: T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
              <p style={{ margin:0, fontSize:11, color: T.textSm, letterSpacing:0.5 }}>COLLECTION RATE</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800, color: T.navy }}>{stats.collectionRate.toFixed(1)}%</p>
              <div style={{ width:'100%', height:6, background: T.border, borderRadius:99, overflow:'hidden' }}>
                <div style={{ width: `${stats.collectionRate}%`, height: '100%', background: T.green, borderRadius:99 }} />
              </div>
            </div>

            {/* Average Monthly Card */}
            <div style={{ background: T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
              <p style={{ margin:0, fontSize:11, color: T.textSm, letterSpacing:0.5 }}>AVERAGE MONTHLY</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800, color: T.navy }}>{formatCurrency(stats.averageMonthly)}</p>
              <p style={{ margin:0, fontSize:10, color: T.textSm }}>Projected Annual: {formatCurrency(stats.projectedAnnual)}</p>
            </div>

            {/* Invoices Card */}
            <div style={{ background: T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
              <p style={{ margin:0, fontSize:11, color: T.textSm, letterSpacing:0.5 }}>INVOICES</p>
              <p style={{ margin:'8px 0 4px', fontSize:22, fontWeight:800, color: T.navy }}>{stats.totalInvoices}</p>
              <div style={{ display:'flex', gap:12, fontSize:10 }}>
                <span style={{ color: T.green }}>{stats.paidInvoices} Paid</span>
                <span style={{ color: T.orange }}>{stats.pendingInvoices} Pending</span>
              </div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="fade-up-3" style={{ background: T.white, borderRadius:18, padding:20, border:`1px solid ${T.border}` }}>
            <h3 style={{ margin:'0 0 20px', fontSize:15, fontWeight:700, color: T.navy }}>Revenue Trend</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {stats.monthlyData.slice(0, 6).map((data, idx) => {
                const percentage = data.amount > 0 ? (data.paid / data.amount) * 100 : 0;
                return (
                  <div key={idx}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, color: T.textMd }}>{data.month}</span>
                      <span style={{ fontSize:12, fontWeight:600, color: T.navy }}>{formatCurrency(data.amount)}</span>
                    </div>
                    <div style={{ width:'100%', height:8, background: T.border, borderRadius:99, overflow:'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: `linear-gradient(90deg, ${T.teal}, ${T.green})`, borderRadius:99 }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                      <span style={{ fontSize:10, color: T.textSm }}>Paid: {formatCurrency(data.paid)}</span>
                      <span style={{ fontSize:10, color: T.textSm }}>{percentage.toFixed(0)}% collected</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Residents */}
          <div className="fade-up-3" style={{ background: T.white, borderRadius:18, padding:20, border:`1px solid ${T.border}` }}>
            <h3 style={{ margin:'0 0 20px', fontSize:15, fontWeight:700, color: T.navy }}>Top Paying Residents</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {stats.topResidents.map((resident, idx) => (
                <div key={idx} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 12px', borderRadius:10, transition:'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{
                      width:28, height:28, borderRadius:8,
                      background: idx === 0 ? T.orangeLight : idx === 1 ? T.tealLight : T.surface,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700,
                      color: idx === 0 ? T.orange : idx === 1 ? T.teal : T.textMd
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize:13, fontWeight:500, color: T.text }}>{resident.name}</span>
                  </div>
                  <span style={{ fontSize:14, fontWeight:700, color: T.navy }}>{formatCurrency(resident.amount)}</span>
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
        .space-y-6 > * + * {
          margin-top: 24px;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </Layout>
  );
}