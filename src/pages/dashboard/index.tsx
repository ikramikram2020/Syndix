import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';

import {
  Building2, Home, Users, DollarSign, TrendingUp, Activity,
  Rocket, PieChart, CreditCard, Wrench, ArrowRight, Zap, Target, Grid
} from 'lucide-react';


export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [building, setBuilding] = useState<any>(null);
  const [stats, setStats] = useState({
    totalApartments: 0,
    occupiedApartments: 0,
    totalResidents: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    pendingMaintenance: 0,
    collectionRate: 0,
    occupancyRate: 0,
    totalBuildings: 1,
    satisfactionRate: 94,
    responseTime: '2.4h',
    activeTickets: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .single();
      
      if (buildingData) {
        setBuilding(buildingData);
        await fetchStats(buildingData.id);
        await fetchRecentData(buildingData.id);
      }
    }
  };

  const fetchStats = async (buildingId: string) => {
    // Use proper typing and handle null values
    const { count: totalApartments } = await supabase
      .from('apartments')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId);
    
    const { count: occupiedApartmentsCount } = await supabase
      .from('apartments')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId)
      .not('resident_id', 'is', null);
    
    const { count: totalResidentsCount } = await supabase
      .from('residents')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId);
    
    const { count: pendingMaintenanceCount } = await supabase
      .from('maintenance_requests')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId)
      .in('status', ['pending', 'in_progress']);
    
    // Handle null values by providing default 0
    const totalApartmentsNum = totalApartments || 0;
    const occupiedApartmentsNum = occupiedApartmentsCount || 0;
    const totalResidentsNum = totalResidentsCount || 0;
    const pendingMaintenanceNum = pendingMaintenanceCount || 0;
    
    const occupancyRate = totalApartmentsNum > 0 ? (occupiedApartmentsNum / totalApartmentsNum) * 100 : 0;
    
    setStats({
      totalApartments: totalApartmentsNum,
      occupiedApartments: occupiedApartmentsNum,
      totalResidents: totalResidentsNum,
      monthlyRevenue: 125000,
      pendingPayments: 15000,
      pendingMaintenance: pendingMaintenanceNum,
      collectionRate: 89,
      occupancyRate,
      totalBuildings: 1,
      satisfactionRate: 94,
      responseTime: '2.4h',
      activeTickets: pendingMaintenanceNum,
    });
  };

  const fetchRecentData = async (buildingId: string) => {
    const { data: payments } = await supabase
      .from('payments')
      .select('*, residents(full_name, apartment_number)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(4);
    setRecentPayments(payments || []);
    
    const { data: requests } = await supabase
      .from('maintenance_requests')
      .select('*, residents(full_name, apartment_number)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(3);
    setRecentRequests(requests || []);
  };

  const statValues = [
    stats.totalBuildings,
    stats.totalApartments,
    stats.totalResidents,
    `${stats.monthlyRevenue.toLocaleString()} DZD`,
  ];

  const STAT_CARDS = [
    { key: 'buildings', label: 'Buildings', icon: Building2, accent: T.navy, bg: '#EEF1FB' },
    { key: 'apartments', label: 'Apartments', icon: Home, accent: T.teal, bg: '#E0F7FB' },
    { key: 'residents', label: 'Residents', icon: Users, accent: T.orange, bg: '#FFF4E0' },
    { key: 'revenue', label: 'Monthly Revenue', icon: DollarSign, accent: T.green, bg: '#E6FBF5' },
  ];

  return (
    <Layout title="Dashboard" subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}>
      {/* Hero Section */}
      <div className="fade-up" style={{
        marginBottom:24, borderRadius:20, padding:'26px 30px',
        background: `linear-gradient(130deg, ${T.navyDeep} 0%, ${T.navy} 55%, #1A4D7C 100%)`,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:220, height:220, borderRadius:'50%', background:`radial-gradient(circle, ${T.teal}20 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${T.orange}, ${T.teal}, transparent)` }} />
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:T.green }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>All Systems Operational</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Good morning, {user?.email?.split('@')[0]}! 👋
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {building?.name} · Here's your property overview for today
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
            <div style={{ padding:'8px 16px', borderRadius:30, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={13} color={T.teal} />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>Live Dashboard</span>
            </div>
            <div style={{ padding:'8px 16px', borderRadius:30, background:`rgba(245,166,35,0.15)`, border:`1px solid ${T.orange}30`, display:'flex', alignItems:'center', gap:8 }}>
              <Rocket size={13} color={T.orange} />
              <span style={{ fontSize:12, color:T.orange, fontWeight:600 }}>{stats.activeTickets} Active Tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="fade-up-2 grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {STAT_CARDS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="stat-card" style={{
              background: T.white, borderRadius:16, padding:'18px', border:`1px solid ${T.border}`,
              boxShadow:'0 2px 8px rgba(27,43,107,0.05)', cursor:'default',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={17} color={s.accent} strokeWidth={2} />
                </div>
                <TrendingUp size={11} color={T.green} />
              </div>
              <p style={{ margin:'0 0 2px', fontSize:22, fontWeight:800, color:T.navy }}>{statValues[i]}</p>
              <p style={{ margin:0, fontSize:12, color:T.textMd }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Metrics */}
      <div className="fade-up-3 grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Occupancy Rate', val:`${Math.round(stats.occupancyRate)}%`, pct:stats.occupancyRate, color:T.navy, icon:Home, sub:`${stats.occupiedApartments}/${stats.totalApartments} units occupied` },
          { label:'Collection Rate', val:`${Math.round(stats.collectionRate)}%`, pct:stats.collectionRate, color:T.teal, icon:Target, sub:`${stats.pendingPayments.toLocaleString()} DZD pending` },
          { label:'Avg Response Time', val:stats.responseTime, pct:stats.satisfactionRate, color:T.orange, icon:Zap, sub:`${stats.satisfactionRate}% resident satisfaction` },
        ].map((m)=>{
          const Icon = m.icon;
          return (
            <div key={m.label} style={{ background:T.white, borderRadius:16, padding:'16px 18px', border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Icon size={13} color={m.color} />
                  <span style={{ fontSize:12, fontWeight:600, color:T.textMd }}>{m.label}</span>
                </div>
                <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${m.color}12`, color:m.color, letterSpacing:0.5 }}>LIVE</span>
              </div>
              <p style={{ margin:'0 0 10px', fontSize:26, fontWeight:800, color:T.navy, letterSpacing:'-0.5px' }}>{m.val}</p>
              <div style={{ height:5, borderRadius:99, background:T.border, overflow:'hidden', marginBottom:7 }}>
                <div style={{ height:'100%', width:`${m.pct}%`, borderRadius:99, background:`linear-gradient(90deg, ${m.color}, ${m.color}70)`, transition:'width 1s ease' }} />
              </div>
              <p style={{ margin:0, fontSize:10, color:T.textSm }}>{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="fade-up-4 main-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* Recent Payments */}
        <div style={{ background: T.white, borderRadius:18, border:`1px solid ${T.border}`, padding:20 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:T.navy }}>Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <p style={{ textAlign:'center', color:T.textSm, padding:20 }}>No payments yet</p>
          ) : (
            recentPayments.map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:12, borderBottom:`1px solid ${T.border}` }}>
                <div>
                  <p style={{ margin:0, fontWeight:600 }}>{p.residents?.full_name || 'Unknown'}</p>
                  <p style={{ margin:0, fontSize:11, color:T.textSm }}>Apt {p.residents?.apartment_number || '?'}</p>
                </div>
                <p style={{ margin:0, fontWeight:700 }}>{p.amount?.toLocaleString()} DZD</p>
              </div>
            ))
          )}
        </div>

        {/* Recent Maintenance */}
        <div style={{ background: T.white, borderRadius:18, border:`1px solid ${T.border}`, padding:20 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:T.navy }}>Maintenance Requests</h3>
          {recentRequests.length === 0 ? (
            <p style={{ textAlign:'center', color:T.textSm, padding:20 }}>No requests yet</p>
          ) : (
            recentRequests.map(r => (
              <div key={r.id} style={{ padding:12, borderBottom:`1px solid ${T.border}` }}>
                <p style={{ margin:0, fontWeight:600 }}>{r.title}</p>
                <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>Apt {r.residents?.apartment_number || '?'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}