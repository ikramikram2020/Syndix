import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { T } from '../styles/theme';

import {
  Building2, Home, Users, CreditCard, Wrench, Megaphone,
  LogOut, Menu, DollarSign, Settings, Bell,
  ChevronRight, Grid, BarChart3, Ticket, X,
  CheckCircle, Clock
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Grid, href: '/dashboard' },
  { id: 'residents', label: 'Residents', icon: Users, href: '/dashboard/residents' },
  { id: 'buildings', label: 'Buildings', icon: Building2, href: '/dashboard/buildings' },
  { id: 'apartments', label: 'Apartments', icon: Home, href: '/dashboard/apartments' },
  { id: 'tickets', label: 'Tickets', icon: Ticket, href: '/dashboard/tickets' },
  { id: 'payments', label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/dashboard/maintenance' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, href: '/dashboard/announcements' },
  { id: 'statistics', label: 'Statistics', icon: BarChart3, href: '/dashboard/statistics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout({ children, title = 'Dashboard', subtitle = '' }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [building, setBuilding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkUserAndBuilding();
    fetchNotifications();
  }, []);

  const checkUserAndBuilding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        router.push('/login'); 
        return; 
      }
      setUser(user);
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .maybeSingle();
      if (buildingData) {
        setBuilding(buildingData);
      }
      setLoading(false);
    } catch { 
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('syndic_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notifications) {
        setNotificationList(notifications);
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotificationList((prev: any[]) => 
        prev.map((n: any) => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount((prev: number) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notificationList.filter((n: any) => !n.read).map((n: any) => n.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      setNotificationList((prev: any[]) => 
        prev.map((n: any) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleLogout = async () => { 
    await signOut(); 
    router.push('/login'); 
  };

  const activeTab = router.pathname.split('/').pop() || 'dashboard';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid ' + T.orange, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'system-ui', margin: 0 }}>Loading SYNDIX…</p>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.canvasBg, fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif" }} dir="ltr">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
          *{box-sizing:border-box}
          ::-webkit-scrollbar{width:0;height:0}
          .nav-btn{transition:background 0.18s,color 0.18s,box-shadow 0.18s}
          .nav-btn:hover{background:${T.surface} !important}
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .slide-in { animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @media(max-width:1100px){
            .sidebar{left:-280px !important}
            .sidebar.open{left:0 !important}
            .main-area{margin-left:0 !important}
            .mob-menu{display:flex !important}
          }
          @media(min-width:1101px){
            .sidebar{left:0 !important}
            .mob-menu{display:none !important}
            .sidebar-overlay{display:none !important}
          }
        `}
      </style>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 45, background: 'rgba(15,26,62,0.35)', backdropFilter: 'blur(2px)' }} 
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        width: 260,
        height: '100vh',
        background: T.sidebarBg,
        borderRight: '1px solid ' + T.sidebarBorder,
        display: 'flex',
        flexDirection: 'column',
        transition: 'left 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: '4px 0 30px rgba(27,43,107,0.08)',
        overflow: 'hidden'
      }}>
        {/* Logo area */}
        <div style={{ padding: "10px 12px" }}>
          <img
            src="/logo2.png"
            alt="SYNDIX"
            style={{ width: 140, display: "block", margin: "0 auto" }}
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              if (t.nextElementSibling) {
                (t.nextElementSibling as HTMLElement).style.display = "flex";
              }
            }}
          />
          <div style={{ display: "none", alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: 'linear-gradient(135deg, ' + T.navy + ' 0%, ' + T.teal + ' 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(43,188,212,0.35)'
            }}>
              <Building2 size={19} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 19, fontWeight: 800, color: T.navy, letterSpacing: 2 }}>SYNDIX</p>
              <p style={{ margin: 0, fontSize: 8, fontWeight: 700, color: T.teal, letterSpacing: 3, textTransform: 'uppercase' }}>Digital Property Platform</p>
            </div>
          </div>
        </div>

        {/* Building chip */}
        {building && (
          <div style={{
            margin: '0 12px 16px 12px',
            padding: '9px 12px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, ' + T.navy + '08 0%, ' + T.teal + '10 100%)',
            border: '1px solid ' + T.teal + '25',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{building.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>{building.city || 'City not set'}</p>
            </div>
          </div>
        )}

        {/* Nav label */}
        <div style={{ padding: '14px 20px 6px', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: T.textSm, letterSpacing: 2, textTransform: 'uppercase' }}>Navigation</p>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className="nav-btn"
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: isActive ? 'linear-gradient(90deg, ' + T.navy + '0E 0%, ' + T.teal + '12 100%)' : 'transparent',
                  border: isActive ? '1px solid ' + T.teal + '30' : '1px solid transparent',
                  color: isActive ? T.navy : T.textMd,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  textAlign: 'left',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: 3,
                    borderRadius: 99,
                    background: 'linear-gradient(to bottom, ' + T.teal + ', ' + T.orange + ')'
                  }} />
                )}
                <Icon size={15} color={isActive ? T.teal : T.textSm} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={11} color={T.teal} style={{ opacity: 0.6 }} />}
              </button>
            );
          })}
        </nav>

        {/* Divider + Logout */}
        <div style={{ padding: '10px 12px 20px', borderTop: '1px solid ' + T.border, flexShrink: 0 }}>
          <div style={{ padding: '8px 12px 6px', marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: T.textSm, letterSpacing: 2, textTransform: 'uppercase' }}>Account</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 12px',
              borderRadius: 10,
              background: 'transparent',
              border: '1px solid ' + T.border,
              color: T.red,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.redLight)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} color={T.red} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-area" style={{ marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(240,244,251,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid ' + T.border,
          padding: '0 28px',
          height: 62,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="mob-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', padding: 8, borderRadius: 9, background: T.white, border: '1px solid ' + T.border, cursor: 'pointer' }}
            >
              <Menu size={17} color={T.textMd} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.navy, letterSpacing: '-0.3px' }}>{title}</h1>
              {subtitle && <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>{subtitle}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationPanel(true)}
              style={{
                position: 'relative',
                padding: 9,
                borderRadius: 10,
                background: T.white,
                border: '1px solid ' + T.border,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Bell size={16} color={T.textMd} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: T.orange,
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <button
              onClick={() => router.push('/dashboard/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px 5px 7px',
                borderRadius: 30,
                background: T.white,
                border: '1px solid ' + T.border,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, ' + T.navy + ' 0%, ' + T.teal + ' 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800
              }}>
                {building?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
              </span>
            </button>
          </div>
        </header>

        <div style={{ padding: '24px 28px 32px', flex: 1 }}>
          {children}
        </div>
      </div>

      {/* NOTIFICATION PANEL */}
      {showNotificationPanel && (
        <div
          className="slide-in"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 380,
            height: '100vh',
            background: T.white,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{
            padding: '20px',
            borderBottom: '1px solid ' + T.border,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: T.navy,
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={18} color={T.orange} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Notifications</h3>
              {unreadCount > 0 && (
                <span style={{ background: T.orange, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNotificationPanel(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} color="#fff" />
            </button>
          </div>

          {notificationList.length > 0 && unreadCount > 0 && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + T.border, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={markAllAsRead} style={{ fontSize: 12, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={12} />
                Mark all as read
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {notificationList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textSm }}>
                <Bell size={48} color={T.border} style={{ marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: T.textMd }}>No notifications yet</p>
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>New notifications will appear here</p>
              </div>
            ) : (
              notificationList.map((notification: any) => (
                <div
                  key={notification.id}
                  onClick={() => markNotificationAsRead(notification.id)}
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    background: notification.read ? T.white : T.orange + '06',
                    border: '1px solid ' + (notification.read ? T.border : T.orange + '25'),
                    marginBottom: 10,
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {!notification.read && (
                    <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, background: T.orange }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: notification.type === 'payment' ? T.green + '15' : notification.type === 'ticket' ? T.orange + '15' : T.teal + '15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {notification.type === 'payment' ? <DollarSign size={14} color={T.green} /> :
                       notification.type === 'ticket' ? <Ticket size={14} color={T.orange} /> :
                       <Bell size={14} color={T.teal} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.navy }}>{notification.title}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textMd }}>{notification.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Clock size={10} color={T.textSm} />
                        <p style={{ margin: 0, fontSize: 10, color: T.textSm }}>
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}