import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Home, CreditCard, Wrench, Bell, User, LogOut, 
  DollarSign, Calendar, TrendingUp, CheckCircle, Shield,
  Sparkles, ArrowRight, Eye, Zap, Star, Award,
  Clock, ChevronRight
} from 'lucide-react';

export default function ResidentDashboard() {
  const router = useRouter();
  const [residentName, setResidentName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState({
    dueAmount: 0,
    lastPayment: null as string | null,
    paidCount: 0,
    pendingCount: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('resident_token');
    const name = localStorage.getItem('resident_name');
    const apartment = localStorage.getItem('resident_apartment');
    const building = localStorage.getItem('resident_building');
    
    if (!token) {
      router.push('/resident');
      return;
    }
    
    setResidentName(name || 'Resident');
    setApartmentNumber(apartment || '?');
    setBuildingName(building || 'Your Building');
    fetchDashboardStats();
    setLoading(false);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const residentData = localStorage.getItem('resident_data');
      if (residentData) {
        const resident = JSON.parse(residentData);
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('resident_id', resident.id)
          .eq('status', 'pending');
        
        const dueAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        
        const { data: lastPayment } = await supabase
          .from('payments')
          .select('paid_at')
          .eq('resident_id', resident.id)
          .eq('status', 'paid')
          .order('paid_at', { ascending: false })
          .limit(1)
          .single();
        
        setStats({
          dueAmount,
          lastPayment: lastPayment?.paid_at || null,
          paidCount: 0,
          pendingCount: payments?.length || 0
        });
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/resident');
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/resident/dashboard' },
    { id: 'payments', label: 'Payments', icon: CreditCard, href: '/resident/payments' },
    { id: 'maintenance', label: 'Requests', icon: Wrench, href: '/resident/maintenance' },
    { id: 'profile', label: 'Profile', icon: User, href: '/resident/profile' },
  ];

  const quickStats = [
    { label: 'Due Amount', value: `${stats.dueAmount.toLocaleString()} DZD`, icon: DollarSign, color: T.orange, bg: T.orangeLight, change: '+12%' },
    { label: 'Paid Invoices', value: stats.paidCount.toString(), icon: CheckCircle, color: T.green, bg: T.greenLight, change: '+2' },
    { label: 'Pending', value: stats.pendingCount.toString(), icon: Clock, color: T.teal, bg: T.tealLight, change: '3' },
  ];

  const recentActivity = [
    { icon: CreditCard, label: 'Payment Received', date: '2 days ago', amount: '25,000 DZD', color: T.green },
    { icon: Wrench, label: 'Maintenance Request', date: '5 days ago', status: 'In Progress', color: T.orange },
    { icon: Bell, label: 'Announcement', date: '1 week ago', title: 'Building Maintenance', color: T.teal },
  ];

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: T.canvasBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
      paddingBottom: 80
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .fade-in-up {
          animation: fadeInUp 0.5s ease both;
        }
        .fade-in {
          animation: fadeIn 0.3s ease both;
        }
        .pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(5,15,36,0.15);
        }
      `}</style>

      {/* Header - Darker Blue Gradient */}
      <div style={{
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        padding: '24px 20px 48px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles size={16} color={T.orange} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>RESIDENT PORTAL</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Welcome back,</h1>
              <h2 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{residentName}</h2>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              <LogOut size={20} color="#fff" />
            </button>
          </div>

          {/* Building Info Card */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            padding: '14px 18px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Your Apartment</p>
              <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: '#fff' }}>{buildingName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Apartment No.</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: T.orange }}>{apartmentNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ padding: '0 20px', marginTop: -30 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="fade-in-up card-hover"
                style={{ 
                  background: T.white, 
                  borderRadius: 20, 
                  padding: '16px 12px',
                  border: `1px solid ${T.border}`,
                  boxShadow: '0 4px 12px rgba(5,15,36,0.08)',
                  transitionDelay: `${index * 0.05}s`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={stat.color} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.green }}>{stat.change}</span>
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0A1A3E' }}>{stat.value}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: T.textSm }}>{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '24px 20px' }}>
        
        {/* Quick Actions Grid */}
        <div className="fade-in-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0A1A3E' }}>Quick Actions</h3>
            <span style={{ fontSize: 11, color: T.textSm }}>Tap to access</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { icon: CreditCard, label: 'Pay Fees', href: '/resident/payments', color: T.green, gradient: `linear-gradient(135deg, ${T.green}, ${T.greenLight})` },
              { icon: Wrench, label: 'Report', href: '/resident/maintenance', color: T.orange, gradient: `linear-gradient(135deg, ${T.orange}, ${T.orangeLight})` },
              { icon: Bell, label: 'News', href: '/resident/announcements', color: T.teal, gradient: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})` },
              { icon: Shield, label: 'Support', href: '/resident/help', color: T.navy, gradient: `linear-gradient(135deg, #0A1A3E, #0D2B5E)` },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="card-hover"
                  style={{
                    background: action.gradient,
                    border: 'none',
                    borderRadius: 18,
                    padding: '14px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={22} color="#fff" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#fff' }}>{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="fade-in-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0A1A3E' }}>Recent Activity</h3>
            <button style={{ fontSize: 12, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div 
                  key={index}
                  className="card-hover"
                  style={{
                    background: T.white,
                    borderRadius: 18,
                    padding: '14px 16px',
                    border: `1px solid ${T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (activity.label === 'Payment Received') router.push('/resident/payments');
                    if (activity.label === 'Maintenance Request') router.push('/resident/maintenance');
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${activity.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={activity.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0A1A3E' }}>{activity.label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: T.textSm }}>{activity.date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {activity.amount && <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.green }}>{activity.amount}</p>}
                    {activity.status && <p style={{ margin: 0, fontSize: 11, color: T.orange }}>{activity.status}</p>}
                    {activity.title && <p style={{ margin: 0, fontSize: 12, color: T.textMd }}>{activity.title}</p>}
                  </div>
                  <ChevronRight size={16} color={T.textSm} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Feature Card - Darker */}
        <div className="fade-in-up" style={{
          background: `linear-gradient(135deg, #050F24, #0A1A3E)`,
          borderRadius: 24,
          padding: 20,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `${T.teal}10` }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="pulse" style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${T.orange}, ${T.orangeDeep})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star size={28} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Premium Service</h4>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Get priority maintenance and exclusive benefits</p>
            </div>
            <Award size={32} color={T.orange} />
          </div>
        </div>
      </div>

      {/* Bottom Tab Navigation - Darker Active Tab */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: T.white,
        borderTop: `1px solid ${T.border}`,
        padding: '8px 20px 20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.push(tab.href);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 12,
                  transition: 'all 0.15s'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: isActive ? `linear-gradient(135deg, #0A1A3E, #0D2B5E)` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  <Icon size={22} color={isActive ? '#fff' : T.textMd} />
                </div>
                <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500, color: isActive ? '#0A1A3E' : T.textSm }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}