import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import Layout from '../../components/Layout';
import { 
  Building, Users, CreditCard, Wrench, Bell, 
  Settings, LogOut, Save, Shield, Mail, Phone, MapPin,
  Clock, DollarSign, FileText, UserCheck, AlertCircle,
  ChevronRight, Key, BellRing, Moon, Sun,
  Receipt, Download, Printer, CheckCircle, Plus, X
} from 'lucide-react';

// ============================================
// MAIN COMPONENT - Dashboard Settings
// ============================================

export default function DashboardSettings() {
  const router = useRouter();
  
  // ============================================
  // STATE
  // ============================================
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [buildingAddress, setBuildingAddress] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    paymentReminders: true,
    maintenanceUpdates: true,
    announcementAlerts: true,
    ticketNotifications: true
  });
  
  // Fee Settings
  const [feeSettings, setFeeSettings] = useState({
    monthlyFee: 0,
    lateFee: 0,
    paymentDeadline: 5,
    currency: 'DZD'
  });
  
  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'light',
    primaryColor: '#1C2B6B',
    compactView: false
  });
  
  // Building Statistics
  const [stats, setStats] = useState({
    totalApartments: 0,
    totalResidents: 0,
    pendingPayments: 0,
    activeTickets: 0
  });

  // Notification Panel State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState<any[]>([]);

  // ============================================
  // INITIALIZATION
  // ============================================
  
  useEffect(() => {
    checkUserAndBuilding();
  }, []);

  const checkUserAndBuilding = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Get user name from metadata
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrator';
      setAdminName(fullName);
      setAdminEmail(user.email || '');
      setAdminPhone(user.user_metadata?.phone || '');
      
      // Get building data
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .maybeSingle();
      
      if (buildingData) {
        setBuildingName(buildingData.name || '');
        setBuildingAddress(buildingData.address || '');
        setBuildingId(buildingData.id);
        await fetchStats(buildingData.id);
      }
      
      await loadSettings();
      await fetchNotifications();
      
    } catch (error) {
      console.error('Settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DATA FETCHING
  // ============================================
  
  const fetchStats = async (buildingId: string) => {
    try {
      // Get total apartments
      const { count: apartmentCount } = await supabase
        .from('apartments')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', buildingId);
      
      // Get total residents
      const { count: residentCount } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', buildingId);
      
      // Get pending payments
      const { data: pendingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('building_id', buildingId)
        .eq('status', 'pending');
      
      const pendingTotal = pendingPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Get active tickets
      const { count: activeTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', buildingId)
        .in('status', ['pending', 'in_progress']);
      
      setStats({
        totalApartments: apartmentCount || 0,
        totalResidents: residentCount || 0,
        pendingPayments: pendingTotal,
        activeTickets: activeTickets || 0
      });
      
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };
  
  const fetchNotifications = async () => {
    try {
      // Fetch recent notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('syndic_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setNotificationList(notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };
  
  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('dashboard_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.notifications) setNotifications(settings.notifications);
        if (settings.feeSettings) setFeeSettings(settings.feeSettings);
        if (settings.appearance) setAppearance(settings.appearance);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const settings = {
        notifications,
        feeSettings,
        appearance,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('dashboard_settings', JSON.stringify(settings));
      
      // Update user metadata in Supabase
      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: adminName,
            phone: adminPhone
          }
        });
      }
      
      // Update building info
      if (buildingId) {
        await supabase
          .from('buildings')
          .update({
            name: buildingName,
            address: buildingAddress,
            updated_at: new Date()
          })
          .eq('id', buildingId);
      }
      
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to save settings');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };
  
  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    setNotificationList(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // ============================================
  // TABS
  // ============================================
  
  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'building', label: 'Building', icon: Building },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
  ];

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading) {
    return (
      <Layout title="Settings" subtitle="Manage your preferences">
        <div style={{ 
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: T.textMd }}>Loading settings...</p>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Layout>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <Layout title="Settings" subtitle="Manage your building and account preferences">
      <div style={{ 
        minHeight: '100vh', 
        background: T.canvasBg,
        fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
        paddingBottom: 40,
        position: 'relative'
      }}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in-up {
            animation: fadeInUp 0.4s ease both;
          }
          input, select, textarea {
            transition: all 0.2s ease;
          }
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: ${T.orange};
            box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .slide-in {
            animation: slideIn 0.3s ease;
          }
        `}</style>

        {/* Settings Content */}
        <div style={{ padding: '0 20px' }}>
          
          {/* Messages */}
          {successMessage && (
            <div className="fade-in-up" style={{
              background: `${T.green}15`,
              border: `1px solid ${T.green}`,
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <CheckCircle size={18} color={T.green} />
              <p style={{ margin: 0, fontSize: 13, color: T.green }}>{successMessage}</p>
            </div>
          )}
          
          {errorMessage && (
            <div className="fade-in-up" style={{
              background: '#ff000015',
              border: `1px solid #ff0000`,
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <AlertCircle size={18} color="#ff0000" />
              <p style={{ margin: 0, fontSize: 13, color: '#ff0000' }}>{errorMessage}</p>
            </div>
          )}
          
          {/* Settings Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ background: T.white, borderRadius: 16, padding: '14px', textAlign: 'center', border: `1px solid ${T.border}` }}>
              <Building size={18} color={T.orange} style={{ marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.navy }}>{stats.totalApartments}</p>
              <p style={{ margin: 0, fontSize: 10, color: T.textSm }}>Apartments</p>
            </div>
            <div style={{ background: T.white, borderRadius: 16, padding: '14px', textAlign: 'center', border: `1px solid ${T.border}` }}>
              <Users size={18} color={T.teal} style={{ marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.navy }}>{stats.totalResidents}</p>
              <p style={{ margin: 0, fontSize: 10, color: T.textSm }}>Residents</p>
            </div>
            <div style={{ background: T.white, borderRadius: 16, padding: '14px', textAlign: 'center', border: `1px solid ${T.border}` }}>
              <DollarSign size={18} color={T.green} style={{ marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.navy }}>{stats.pendingPayments.toLocaleString()} DZD</p>
              <p style={{ margin: 0, fontSize: 10, color: T.textSm }}>Pending</p>
            </div>
            <div style={{ background: T.white, borderRadius: 16, padding: '14px', textAlign: 'center', border: `1px solid ${T.border}` }}>
              <Wrench size={18} color={T.orange} style={{ marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.navy }}>{stats.activeTickets}</p>
              <p style={{ margin: 0, fontSize: 10, color: T.textSm }}>Open Tickets</p>
            </div>
          </div>
          
          {/* Settings Navigation */}
          <div style={{
            background: T.white,
            borderRadius: 16,
            padding: 6,
            display: 'flex',
            gap: 6,
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: isActive ? T.navy : 'transparent',
                    border: 'none',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={16} color={isActive ? '#fff' : T.textMd} />
                  <span style={{ 
                    fontSize: 13, 
                    fontWeight: isActive ? 600 : 500, 
                    color: isActive ? '#fff' : T.textMd 
                  }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* ============================================
              GENERAL SETTINGS TAB
          ============================================ */}
          
          {activeTab === 'general' && (
            <div className="fade-in-up">
              <div style={{
                background: T.white,
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                border: `1px solid ${T.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: T.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={18} color={T.orange} />
                  Profile Information
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Full Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        fontSize: 14,
                        background: T.white
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Email Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Mail size={16} color={T.textSm} />
                      <input
                        type="email"
                        value={adminEmail}
                        disabled
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 12,
                          fontSize: 14,
                          background: T.surface,
                          color: T.textSm
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Phone Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Phone size={16} color={T.textSm} />
                      <input
                        type="tel"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 12,
                          fontSize: 14,
                          background: T.white
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{
                background: T.white,
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                border: `1px solid ${T.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: T.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={18} color={T.orange} />
                  Security
                </h3>
                
                <button
                  onClick={() => router.push('/dashboard/change-password')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Key size={16} color={T.textMd} />
                    <span style={{ fontSize: 14, color: T.textMd }}>Change Password</span>
                  </span>
                  <ChevronRight size={16} color={T.textSm} />
                </button>
              </div>
            </div>
          )}
          
          {/* ============================================
              BUILDING SETTINGS TAB
          ============================================ */}
          
          {activeTab === 'building' && (
            <div className="fade-in-up">
              <div style={{
                background: T.white,
                borderRadius: 20,
                padding: 20,
                border: `1px solid ${T.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: T.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building size={18} color={T.orange} />
                  Building Information
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Building Name</label>
                    <input
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        fontSize: 14
                      }}
                      placeholder="e.g., Horizon Towers"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Address</label>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <MapPin size={16} color={T.textSm} style={{ marginTop: 14 }} />
                      <textarea
                        value={buildingAddress}
                        onChange={(e) => setBuildingAddress(e.target.value)}
                        rows={3}
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 12,
                          fontSize: 14,
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                        placeholder="Full building address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* ============================================
              FEES SETTINGS TAB
          ============================================ */}
          
          {activeTab === 'fees' && (
            <div className="fade-in-up">
              <div style={{
                background: T.white,
                borderRadius: 20,
                padding: 20,
                border: `1px solid ${T.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: T.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={18} color={T.orange} />
                  Fee Configuration
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Monthly Maintenance Fee (DZD)</label>
                    <input
                      type="number"
                      value={feeSettings.monthlyFee}
                      onChange={(e) => setFeeSettings({ ...feeSettings, monthlyFee: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        fontSize: 14
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Late Fee (DZD per month)</label>
                    <input
                      type="number"
                      value={feeSettings.lateFee}
                      onChange={(e) => setFeeSettings({ ...feeSettings, lateFee: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        fontSize: 14
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Payment Deadline (Day of month)</label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={feeSettings.paymentDeadline}
                      onChange={(e) => setFeeSettings({ ...feeSettings, paymentDeadline: parseInt(e.target.value) || 5 })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        fontSize: 14
                      }}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: T.textSm }}>Payments due on the {feeSettings.paymentDeadline}th of each month</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* ============================================
              NOTIFICATIONS TAB
          ============================================ */}
          
          {activeTab === 'notifications' && (
            <div className="fade-in-up">
              <div style={{
                background: T.white,
                borderRadius: 20,
                padding: 20,
                border: `1px solid ${T.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: T.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BellRing size={18} color={T.orange} />
                  Notification Preferences
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(notifications).map(([key, value]) => (
                    <label key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: `1px solid ${T.border}`,
                      cursor: 'pointer'
                    }}>
                      <span style={{ fontSize: 14, color: T.textMd }}>
                        {key === 'emailAlerts' && 'Email Alerts'}
                        {key === 'paymentReminders' && 'Payment Reminders'}
                        {key === 'maintenanceUpdates' && 'Maintenance Updates'}
                        {key === 'announcementAlerts' && 'Announcement Alerts'}
                        {key === 'ticketNotifications' && 'Ticket Notifications'}
                      </span>
                      <div
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: value ? T.green : T.border,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          background: '#fff',
                          position: 'absolute',
                          top: 2,
                          left: value ? 22 : 2,
                          transition: 'all 0.2s'
                        }} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* ============================================
              APPEARANCE TAB
          ============================================ */}
          
          {activeTab === 'appearance' && (
            <div className="fade-in-up">
              <div style={{
                background: T.white,
                borderRadius: 20,
                padding: 20,
                border: `1px solid ${T.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: T.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sun size={18} color={T.orange} />
                  Appearance
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 8 }}>Theme</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: appearance.theme === 'light' ? T.navy : T.surface,
                          border: `1px solid ${appearance.theme === 'light' ? T.navy : T.border}`,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: 'pointer'
                        }}
                      >
                        <Sun size={16} color={appearance.theme === 'light' ? '#fff' : T.textMd} />
                        <span style={{ color: appearance.theme === 'light' ? '#fff' : T.textMd }}>Light</span>
                      </button>
                      <button
                        onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: appearance.theme === 'dark' ? T.navy : T.surface,
                          border: `1px solid ${appearance.theme === 'dark' ? T.navy : T.border}`,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: 'pointer'
                        }}
                      >
                        <Moon size={16} color={appearance.theme === 'dark' ? '#fff' : T.textMd} />
                        <span style={{ color: appearance.theme === 'dark' ? '#fff' : T.textMd }}>Dark</span>
                      </button>
                    </div>
                  </div>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: 14, color: T.textMd }}>Compact View (Show more items)</span>
                    <div
                      onClick={() => setAppearance({ ...appearance, compactView: !appearance.compactView })}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: appearance.compactView ? T.green : T.border,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: '#fff',
                        position: 'absolute',
                        top: 2,
                        left: appearance.compactView ? 22 : 2,
                        transition: 'all 0.2s'
                      }} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Save Button */}
          <div style={{
            position: 'sticky',
            bottom: 20,
            marginTop: 20,
            marginBottom: 20
          }}>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              style={{
                width: '100%',
                padding: '16px',
                background: `linear-gradient(135deg, ${T.navy}, ${T.navyDeep})`,
                border: 'none',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Save size={20} color="#fff" />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                {saving ? 'Saving Settings...' : 'Save All Settings'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================
          NOTIFICATION PANEL (Slide-in from right)
      ============================================ */}
      
      {showNotifications && (
        <>
          <div 
            onClick={() => setShowNotifications(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease'
            }}
          />
          <div className="slide-in" style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 380,
            height: '100vh',
            background: T.white,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: T.navy,
              color: '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={18} color={T.orange} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
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
            
            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {notificationList.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: T.textSm
                }}>
                  <Bell size={48} color={T.border} style={{ marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No notifications yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>New notifications will appear here</p>
                </div>
              ) : (
                notificationList.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: notification.read ? T.white : `${T.orange}08`,
                      border: `1px solid ${notification.read ? T.border : T.orange}30`,
                      marginBottom: 10,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.navy }}>
                      {notification.title}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: T.textSm }}>
                      {notification.message}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: 10, color: T.textSm }}>
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}