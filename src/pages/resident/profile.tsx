import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  User, Mail, Phone, Home, Building2, 
  Calendar, Shield, Edit, ArrowLeft, 
  CheckCircle, AlertCircle, Save, X, LogOut,
  Sparkles, Clock, Key, Award
} from 'lucide-react';

export default function ResidentProfile() {
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [memberSince, setMemberSince] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [buildingName, setBuildingName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');

  // Get resident from localStorage directly
  useEffect(() => {
    const token = localStorage.getItem('resident_token');
    const residentData = localStorage.getItem('resident_data');
    
    if (!token || !residentData) {
      router.push('/resident');
      return;
    }
    
    try {
      const resident = JSON.parse(residentData);
      setResident(resident);
      setFormData({
        phone: resident.phone || '',
        email: resident.email || ''
      });
      setApartmentNumber(resident.apartment_number || '?');
      
      // Fetch building name
      if (resident.apartment_number) {
        fetchBuildingInfo(resident.apartment_number);
      }
      
      // Set member since
      if (resident.created_at) {
        const date = new Date(resident.created_at);
        setMemberSince(date.toLocaleDateString('en', { month: 'long', year: 'numeric' }));
      } else {
        setMemberSince('2024');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  const fetchBuildingInfo = async (aptNumber: string) => {
    try {
      // Get building_id from apartment
      const { data: apartment } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', aptNumber)
        .maybeSingle();
      
      if (apartment?.building_id) {
        const { data: building } = await supabase
          .from('buildings')
          .select('name')
          .eq('id', apartment.building_id)
          .maybeSingle();
        
        if (building) {
          setBuildingName(building.name);
        }
      }
    } catch (err) {
      console.error('Error fetching building:', err);
    }
  };

  const saveChanges = async () => {
    if (!resident) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('residents')
      .update({
        phone: formData.phone,
        email: formData.email
      })
      .eq('id', resident.id);

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      // Update local storage
      const updatedResident = { ...resident, phone: formData.phone, email: formData.email };
      localStorage.setItem('resident_data', JSON.stringify(updatedResident));
      setResident(updatedResident);
      setEditing(false);
      alert('Profile updated successfully!');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.clear();
    router.push('/resident');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#fff' }}>Loading profile...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!resident) return null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
      paddingBottom: 40
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .fade-in-up {
          animation: fadeInUp 0.5s ease both;
        }
        .slide-in {
          animation: slideIn 0.4s ease both;
        }
        .pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(5,15,36,0.1);
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        padding: '24px 20px 40px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button 
                onClick={() => router.back()} 
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} color="#fff" />
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Sparkles size={14} color={T.orange} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>PERSONAL INFO</span>
                </div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>My Profile</h1>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: T.orange,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245,166,35,0.3)'
                }}
              >
                <Edit size={18} color="#fff" />
              </button>
            )}
          </div>

          {/* Avatar Section */}
          <div className="slide-in" style={{ textAlign: 'center' }}>
            <div className="pulse" style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              background: `linear-gradient(135deg, ${T.orange}, ${T.orangeDeep})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 8px 20px rgba(245,166,35,0.3)',
              border: '3px solid rgba(255,255,255,0.2)'
            }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>
                {resident.full_name?.charAt(0).toUpperCase() || 'R'}
              </span>
            </div>
            <h2 style={{ margin: '12px 0 4px', fontSize: 22, fontWeight: 800, color: '#fff' }}>
              {resident.full_name || 'Resident'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Shield size={12} color={T.green} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Verified Resident</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="fade-in-up" style={{ padding: '20px' }}>
        <div style={{
          background: T.white,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(5,15,36,0.08)',
          border: `1px solid ${T.border}`
        }}>
          
          {/* Info Items */}
          <div style={{ padding: '20px' }}>
            {/* Apartment */}
            <div className="card-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 0',
              borderBottom: `1px solid ${T.border}`
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: T.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={20} color={T.teal} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: T.textSm, letterSpacing: 0.5 }}>APARTMENT</p>
                <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: T.navy }}>
                  Apartment {apartmentNumber}
                </p>
              </div>
            </div>

            {/* Building */}
            <div className="card-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 0',
              borderBottom: `1px solid ${T.border}`
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: T.orangeLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} color={T.orange} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: T.textSm, letterSpacing: 0.5 }}>BUILDING</p>
                <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: T.navy }}>
                  {buildingName || 'Your Building'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="card-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 0',
              borderBottom: `1px solid ${T.border}`
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} color={T.green} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: T.textSm, letterSpacing: 0.5 }}>EMAIL</p>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      fontSize: 14,
                      marginTop: 4,
                      outline: 'none'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                    autoFocus
                  />
                ) : (
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: T.text }}>
                    {resident.email || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="card-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 0',
              borderBottom: `1px solid ${T.border}`
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} color="#7C3AED" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: T.textSm, letterSpacing: 0.5 }}>PHONE</p>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      fontSize: 14,
                      marginTop: 4,
                      outline: 'none'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  />
                ) : (
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: T.text }}>
                    {resident.phone || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="card-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 0',
              borderBottom: `1px solid ${T.border}`
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color={T.textMd} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: T.textSm, letterSpacing: 0.5 }}>MEMBER SINCE</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500, color: T.navy }}>
                  {memberSince}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="card-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 0'
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color={T.green} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: T.textSm, letterSpacing: 0.5 }}>ACCOUNT STATUS</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: T.green, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} /> Active
                </p>
              </div>
            </div>
          </div>

          {/* Edit Mode Buttons */}
          {editing && (
            <div style={{ 
              padding: '16px 20px 20px', 
              borderTop: `1px solid ${T.border}`,
              background: T.surface,
              display: 'flex',
              gap: 12
            }}>
              <button
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  color: T.textMd,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: T.navy,
                  border: 'none',
                  borderRadius: 14,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'all 0.15s'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Logout Button */}
          {!editing && (
            <div style={{ 
              padding: '16px 20px 20px', 
              borderTop: `1px solid ${T.border}`,
              background: T.surface
            }}>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: T.redLight,
                  border: 'none',
                  borderRadius: 14,
                  color: T.red,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s'
                }}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,15,36,0.5)',
              zIndex: 90,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="fade-in-up" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: T.white,
            borderRadius: '28px 28px 0 0',
            padding: 24,
            zIndex: 100,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                background: T.redLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <LogOut size={28} color={T.red} />
              </div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.navy }}>Sign Out?</h3>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: T.textMd }}>
                Are you sure you want to sign out of your account?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'transparent',
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  color: T.textMd,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: T.red,
                  border: 'none',
                  borderRadius: 14,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}