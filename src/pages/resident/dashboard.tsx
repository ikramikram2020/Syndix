import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Home, CreditCard, Wrench, Bell, User, LogOut, 
  DollarSign, CheckCircle, Shield, Sparkles, Star, Award,
  Clock, ChevronRight, Ticket, Zap
} from 'lucide-react';

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResidentDashboard() {
  const router = useRouter();
  
  // ============================================
  // STATE
  // ============================================
  
  const [residentName, setResidentName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [ticketStats, setTicketStats] = useState({ pending: 0, resolved: 0 });
  const [stats, setStats] = useState({
    dueAmount: 0,
    paidCount: 0,
    pendingCount: 0
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeDashboard = async () => {
      try {
        const token = localStorage.getItem('resident_token');
        const name = localStorage.getItem('resident_name');
        const apartment = localStorage.getItem('resident_apartment');
        const building = localStorage.getItem('resident_building');
        
        if (!token) {
          router.push('/resident');
          return;
        }
        
        if (isMounted) {
          setResidentName(name || 'Resident');
          setApartmentNumber(apartment || '?');
          setBuildingName(building || 'Your Building');
        }
        
        await fetchDashboardStats();
        await fetchTicketStats();
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initializeDashboard();
    return () => { isMounted = false; };
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================
  
  const fetchTicketStats = async () => {
    try {
      const residentData = localStorage.getItem('resident_data');
      if (!residentData) return;
      
      const resident = JSON.parse(residentData);
      const { data: tickets } = await supabase
        .from('tickets')
        .select('status')
        .eq('resident_id', resident.id);
      
      if (tickets) {
        setTicketStats({
          pending: tickets.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
          resolved: tickets.filter(t => t.status === 'resolved').length
        });
      }
    } catch (err) {
      console.error('Ticket stats error:', err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const residentData = localStorage.getItem('resident_data');
      if (!residentData) return;
      
      const resident = JSON.parse(residentData);
      
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('resident_id', resident.id)
        .eq('status', 'pending');
      
      const dueAmount = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const pendingCount = payments?.length || 0;
      
      const { count: paidCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('resident_id', resident.id)
        .eq('status', 'paid');
      
      setStats({ dueAmount, paidCount: paidCount || 0, pendingCount });
      
    } catch (err) {
      console.error('Dashboard stats error:', err);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/resident');
  };

  // ============================================
  // NAVIGATION TABS (with scale effect)
  // ============================================
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/resident/dashboard' },
    { id: 'payments', label: 'Payments', icon: CreditCard, href: '/resident/payments' },
    { id: 'maintenance', label: 'Requests', icon: Wrench, href: '/resident/maintenance' },
    { id: 'tickets', label: 'Tickets', icon: Ticket, href: '/resident/tickets' },
    { id: 'profile', label: 'Profile', icon: User, href: '/resident/profile' },
  ];

  // ============================================
  // QUICK ACTIONS (Pay Fees highlighted)
  // ============================================
  
  const quickActions = [
    { icon: CreditCard, label: 'Pay Fees', href: '/resident/payments', color: T.navy, primary: true },
    { icon: Wrench, label: 'Maintenance', href: '/resident/maintenance', color: T.orange, primary: false },
    { icon: Ticket, label: 'Tickets', href: '/resident/tickets', color: T.teal, primary: false },
    { icon: Bell, label: 'News', href: '/resident/announcements', color: T.green, primary: false },
  ];

  // Determine due amount styling (dynamic)
  const dueAmountColor = stats.dueAmount > 0 ? T.orange : T.green;
  const dueAmountMessage = stats.dueAmount > 0 ? `${stats.dueAmount.toLocaleString()} DZD` : 'All clear ✅';

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: T.textMd }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      paddingBottom: 80
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.4s ease both;
        }
        .card-hover {
          transition: all 0.2s ease;
        }
        .card-hover:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* ============================================
          HEADER - Purposeful, not just pretty
      ============================================ */}
      
      <div style={{
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyDeep})`,
        padding: '24px 20px 48px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles size={14} color={T.orange} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>RESIDENT PORTAL</span>
              </div>
              {/* Dynamic greeting with purpose */}
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                {getGreeting()}, {residentName.split(' ')[0]}
              </h1>
              {/* Action-oriented subtitle */}
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {stats.pendingCount > 0 
                  ? `⚠️ You have ${stats.pendingCount} pending payment${stats.pendingCount > 1 ? 's' : ''}`
                  : '✓ Your account is up to date'}
              </p>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <LogOut size={18} color="#fff" />
            </button>
          </div>

          {/* Building Info Card */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: '12px 16px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Your Apartment</p>
              <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600, color: '#fff' }}>{buildingName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Apartment No.</p>
              <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: T.orange }}>{apartmentNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          STATS CARDS - Dynamic due amount color
      ============================================ */}
      
      <div style={{ padding: '0 20px', marginTop: -30 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          
          {/* Primary Card - Due Amount with dynamic color */}
          <div className="fade-in-up card-hover" style={{ 
            background: T.navy, 
            borderRadius: 20, 
            padding: '16px',
            cursor: 'pointer'
          }} onClick={() => router.push('/resident/payments')}>
            <DollarSign size={20} color={dueAmountColor} />
            <p style={{ margin: '8px 0 4px', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Due Amount</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: dueAmountColor }}>{dueAmountMessage}</p>
            {stats.dueAmount === 0 && (
              <p style={{ margin: '6px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>No outstanding fees</p>
            )}
          </div>
          
          {/* Secondary Card - Paid */}
          <div className="fade-in-up card-hover" style={{ 
            background: T.white, 
            borderRadius: 20, 
            padding: '16px',
            border: `1px solid ${T.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }} onClick={() => router.push('/resident/payments')}>
            <CheckCircle size={18} color={T.green} />
            <p style={{ margin: '8px 0 4px', fontSize: 11, color: T.textSm }}>Paid Invoices</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.navy }}>{stats.paidCount}</p>
          </div>
          
          {/* Secondary Card - Pending */}
          <div className="fade-in-up card-hover" style={{ 
            background: T.white, 
            borderRadius: 20, 
            padding: '16px',
            border: `1px solid ${T.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }} onClick={() => router.push('/resident/payments')}>
            <Clock size={18} color={T.orange} />
            <p style={{ margin: '8px 0 4px', fontSize: 11, color: T.textSm }}>Pending</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.navy }}>{stats.pendingCount}</p>
          </div>
        </div>
      </div>

      {/* ============================================
          QUICK ACTIONS - Pay Fees is primary
      ============================================ */}
      
      <div style={{ padding: '24px 20px 0' }}>
        <div className="fade-in-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.navy }}>Quick Actions</h3>
            <span style={{ fontSize: 11, color: T.textSm }}>Tap to access</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="card-hover"
                  style={{
                    background: action.primary ? T.navy : action.color,
                    border: 'none',
                    borderRadius: 16,
                    padding: action.primary ? '14px 8px' : '12px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: action.primary ? '0 4px 12px rgba(28,43,107,0.3)' : 'none'
                  }}
                >
                  <Icon size={action.primary ? 22 : 20} color="#fff" style={{ margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontSize: action.primary ? 12 : 11, fontWeight: action.primary ? 600 : 500, color: '#fff' }}>
                    {action.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================
          TICKETS CARD - Better vertical layout
      ============================================ */}
      
      <div style={{ padding: '0 20px' }}>
        <div className="fade-in-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.navy }}>Support Tickets</h3>
            <button 
              onClick={() => router.push('/resident/tickets')}
              style={{ fontSize: 12, color: T.teal, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All →
            </button>
          </div>
          
          <div style={{
            background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`,
            borderRadius: 20,
            padding: 20,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Total Tickets - Top */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Ticket size={24} color="#fff" style={{ margin: '0 auto 6px' }} />
                <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#fff' }}>{ticketStats.pending + ticketStats.resolved}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Total Tickets</p>
              </div>
              
              {/* Open / Resolved - 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, textAlign: 'center' }}>
                <div>
                  <Clock size={18} color={T.orange} style={{ margin: '0 auto 4px' }} />
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.orange }}>{ticketStats.pending}</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Open</p>
                </div>
                <div>
                  <CheckCircle size={18} color={T.green} style={{ margin: '0 auto 4px' }} />
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.green }}>{ticketStats.resolved}</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Resolved</p>
                </div>
              </div>
              
              {/* Button - Full width */}
              <button
                onClick={() => router.push('/resident/tickets')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: 30,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                + New Ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          RECENT ACTIVITY - Clean, borderless, lighter
      ============================================ */}
      
      <div style={{ padding: '0 20px' }}>
        <div className="fade-in-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.navy }}>Recent Activity</h3>
            <span style={{ fontSize: 11, color: T.textSm }}>Last updates</span>
          </div>
          
          {stats.pendingCount === 0 && ticketStats.pending === 0 ? (
            // Empty State
            <div style={{
              background: T.white,
              borderRadius: 16,
              padding: '32px 20px',
              textAlign: 'center',
              border: `1px solid ${T.border}`
            }}>
              <Zap size={32} color={T.textSm} style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: 13, color: T.textMd }}>No recent activity yet</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: T.textSm }}>Your activity will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Dynamic activity based on actual data */}
              {stats.pendingCount > 0 && (
                <div 
                  className="card-hover"
                  style={{
                    background: 'transparent',
                    borderRadius: 12,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => router.push('/resident/payments')}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.orangeLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={16} color={T.orange} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.navy }}>Pending Payment</p>
                    <p style={{ margin: '2px 0 0', fontSize: 10, color: T.textSm }}>You have {stats.pendingCount} unpaid invoice{stats.pendingCount > 1 ? 's' : ''}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.orange }}>{stats.dueAmount.toLocaleString()} DZD</p>
                  <ChevronRight size={14} color={T.textSm} />
                </div>
              )}
              
              {ticketStats.pending > 0 && (
                <div 
                  className="card-hover"
                  style={{
                    background: 'transparent',
                    borderRadius: 12,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => router.push('/resident/tickets')}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ticket size={16} color={T.teal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.navy }}>Open Tickets</p>
                    <p style={{ margin: '2px 0 0', fontSize: 10, color: T.textSm }}>{ticketStats.pending} ticket{ticketStats.pending > 1 ? 's' : ''} awaiting response</p>
                  </div>
                  <ChevronRight size={14} color={T.textSm} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          BOTTOM TAB NAVIGATION - With scale animation
      ============================================ */}
      
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: T.white,
        borderTop: `1px solid ${T.border}`,
        padding: '6px 16px 18px',
        backdropFilter: 'blur(10px)',
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
                  gap: 3,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 10,
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: isActive ? T.navy : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  <Icon size={20} color={isActive ? '#fff' : T.textMd} />
                </div>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: isActive ? 600 : 500, 
                  color: isActive ? T.navy : T.textSm 
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================
          ATTENTION SECTION - Floating CTA (only when needed)
      ============================================ */}
      
      {stats.dueAmount > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 70, 
          left: 20, 
          right: 20, 
          zIndex: 101,
          animation: 'fadeInUp 0.4s ease'
        }}>
          <div style={{
            background: T.orange,
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>You have unpaid fees</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.9)' }}>{stats.dueAmount.toLocaleString()} DZD due</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/resident/payments')}
              style={{
                padding: '6px 14px',
                background: '#fff',
                border: 'none',
                borderRadius: 20,
                color: T.orange,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}