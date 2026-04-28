import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Home, Building, Users, CreditCard, Wrench, Bell, 
  Settings, LogOut, Save, Shield, Mail, Phone, MapPin,
  Clock, DollarSign, FileText, UserCheck, AlertCircle,
  ChevronRight, Globe, Lock, Key, BellRing, Moon, Sun,
  Receipt, Download, Printer, CheckCircle
} from 'lucide-react';
// ============================================
// MAIN COMPONENT - Syndic Dashboard Settings
// ============================================

export default function SyndicSettings() {
  const router = useRouter();
  
  // ============================================
  // STATE
  // ============================================
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syndicName, setSyndicName] = useState('');
  const [syndicEmail, setSyndicEmail] = useState('');
  const [syndicPhone, setSyndicPhone] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [buildingAddress, setBuildingAddress] = useState('');
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
  primaryColor: T.navy as string, // Type assertion
  compactView: false
});
  
  // Building Statistics
  const [stats, setStats] = useState({
    totalApartments: 0,
    totalResidents: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    activeTickets: 0
  });

  // ============================================
  // INITIALIZATION
  // ============================================
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeSettings = async () => {
      try {
        const token = localStorage.getItem('syndic_token');
        const name = localStorage.getItem('syndic_name');
        
        if (!token) {
          router.push('/syndic');
          return;
        }
        
        if (isMounted) {
          setSyndicName(name || 'Building Manager');
          await fetchSyndicData();
          await fetchBuildingData();
          await fetchBuildingStats();
          await loadSettings();
        }
      } catch (error) {
        console.error('Settings error:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initializeSettings();
    return () => { isMounted = false; };
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================
  
  const fetchSyndicData = async () => {
    try {
      const syndicData = localStorage.getItem('syndic_data');
      if (!syndicData) return;
      
      const syndic = JSON.parse(syndicData);
      setSyndicEmail(syndic.email || '');
      setSyndicPhone(syndic.phone || '');
    } catch (err) {
      console.error('Error fetching syndic data:', err);
    }
  };
  
  const fetchBuildingData = async () => {
    try {
      const buildingId = localStorage.getItem('syndic_building_id');
      if (!buildingId) return;
      
      const { data: building } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', buildingId)
        .single();
      
      if (building) {
        setBuildingName(building.name || '');
        setBuildingAddress(building.address || '');
      }
    } catch (err) {
      console.error('Error fetching building:', err);
    }
  };
  
  const fetchBuildingStats = async () => {
    try {
      const buildingId = localStorage.getItem('syndic_building_id');
      if (!buildingId) return;
      
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
        monthlyRevenue: 0,
        pendingPayments: pendingTotal,
        activeTickets: activeTickets || 0
      });
      
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };
  
  const loadSettings = async () => {
    try {
      // Load saved settings from localStorage or database
      const savedSettings = localStorage.getItem('syndic_settings');
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
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/syndic');
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Save all settings to localStorage
      const settings = {
        notifications,
        feeSettings,
        appearance,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('syndic_settings', JSON.stringify(settings));
      
      // Save to database if needed
      const syndicId = localStorage.getItem('syndic_id');
      if (syndicId) {
        await supabase
          .from('syndics')
          .update({
            phone: syndicPhone,
            settings: settings,
            updated_at: new Date()
          })
          .eq('id', syndicId);
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
  
  const handleUpdateBuilding = async () => {
    setSaving(true);
    
    try {
      const buildingId = localStorage.getItem('syndic_building_id');
      
      await supabase
        .from('buildings')
        .update({
          name: buildingName,
          address: buildingAddress,
          updated_at: new Date()
        })
        .eq('id', buildingId);
      
      setSuccessMessage('Building information updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to update building');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // NAVIGATION TABS
  // ============================================
  
  const tabs = [
    { id: 'general', label: 'General', icon: Settings, href: '/syndic/settings' },
    { id: 'building', label: 'Building', icon: Building, href: '/syndic/settings?tab=building' },
    { id: 'fees', label: 'Fees', icon: DollarSign, href: '/syndic/settings?tab=fees' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/syndic/settings?tab=notifications' },
    { id: 'appearance', label: 'Appearance', icon: Sun, href: '/syndic/settings?tab=appearance' },
  ];

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: T.canvasBg,
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
    );
  }

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
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
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .card-hover:active {
          transform: scale(0.98);
        }
        input, select, textarea {
          transition: all 0.2s ease;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: ${T.orange};
          box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
        }
      `}</style>

      {/* ============================================
          HEADER
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Settings size={14} color={T.orange} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>SYNDIC PORTAL</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>Settings</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Manage your building and account preferences</p>
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

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <Building size={14} color={T.orange} style={{ marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>{stats.totalApartments}</p>
              <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Apartments</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <Users size={14} color={T.teal} style={{ marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>{stats.totalResidents}</p>
              <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Residents</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <DollarSign size={14} color={T.green} style={{ marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>{stats.pendingPayments.toLocaleString()}</p>
              <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Pending DZD</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <Wrench size={14} color={T.orange} style={{ marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>{stats.activeTickets}</p>
              <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Open Tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          SETTINGS CONTENT
      ============================================ */}
      
      <div style={{ padding: '0 20px', marginTop: -20 }}>
        
        {/* Success/Error Messages */}
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
            background: `${T.red}15`,
            border: `1px solid ${T.red}`,
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertCircle size={18} color={T.red} />
            <p style={{ margin: 0, fontSize: 13, color: T.red }}>{errorMessage}</p>
          </div>
        )}
        
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
            {/* Profile Section */}
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
                    value={syndicName}
                    onChange={(e) => setSyndicName(e.target.value)}
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
                      value={syndicEmail}
                      onChange={(e) => setSyndicEmail(e.target.value)}
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
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 6 }}>Phone Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Phone size={16} color={T.textSm} />
                    <input
                      type="tel"
                      value={syndicPhone}
                      onChange={(e) => setSyndicPhone(e.target.value)}
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
            
            {/* Security Section */}
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
                onClick={() => router.push('/syndic/change-password')}
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
                
                <button
                  onClick={handleUpdateBuilding}
                  disabled={saving}
                  style={{
                    padding: '12px',
                    background: T.orange,
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Update Building Info'}
                </button>
              </div>
            </div>
            
            {/* Building Stats Card */}
            <div style={{
              background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`,
              borderRadius: 20,
              padding: 20,
              marginTop: 16,
              color: '#fff'
            }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Building Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Total Units</p>
                  <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700 }}>{stats.totalApartments}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Occupancy Rate</p>
                  <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700 }}>
                    {stats.totalApartments > 0 ? Math.round((stats.totalResidents / stats.totalApartments) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ============================================
            FEE SETTINGS TAB
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
            
            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => router.push('/syndic/invoices')}
                style={{
                  padding: '14px',
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Receipt size={18} color={T.navy} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Generate Invoices</span>
              </button>
              
              <button
                onClick={() => router.push('/syndic/payments')}
                style={{
                  padding: '14px',
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Download size={18} color={T.teal} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.teal }}>Export Reports</span>
              </button>
            </div>
          </div>
        )}
        
        {/* ============================================
            NOTIFICATION SETTINGS TAB
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
            APPEARANCE SETTINGS TAB
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
                {/* Theme Toggle */}
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
                
                {/* Color Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSm, marginBottom: 8 }}>Primary Color</label>
                  <input
                    type="color"
                    value={appearance.primaryColor}
                    onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                    style={{
                      width: '100%',
                      height: 48,
                      border: `1px solid ${T.border}`,
                      borderRadius: 12,
                      cursor: 'pointer'
                    }}
                  />
                </div>
                
                {/* Compact View */}
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
        
        {/* ============================================
            SAVE BUTTON - Sticky at bottom
        ============================================ */}
        
        <div style={{
          position: 'sticky',
          bottom: 80,
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

      {/* ============================================
          BOTTOM TAB NAVIGATION
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
          <button onClick={() => router.push('/syndic/dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px' }}>
            <Home size={20} color={T.textMd} />
            <span style={{ fontSize: 10, color: T.textSm }}>Home</span>
          </button>
          <button onClick={() => router.push('/syndic/buildings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px' }}>
            <Building size={20} color={T.textMd} />
            <span style={{ fontSize: 10, color: T.textSm }}>Building</span>
          </button>
          <button onClick={() => router.push('/syndic/payments')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px' }}>
            <CreditCard size={20} color={T.textMd} />
            <span style={{ fontSize: 10, color: T.textSm }}>Payments</span>
          </button>
          <button onClick={() => router.push('/syndic/tickets')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px' }}>
            <Wrench size={20} color={T.textMd} />
            <span style={{ fontSize: 10, color: T.textSm }}>Tickets</span>
          </button>
          <button onClick={() => router.push('/syndic/settings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px' }}>
            <Settings size={20} color={T.navy} />
            <span style={{ fontSize: 10, fontWeight: 600, color: T.navy }}>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}