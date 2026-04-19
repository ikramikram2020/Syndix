import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

// ─── SYNDIX Design Tokens (Same as Dashboard) ─────────────────────────────────
const T = {
  navy: '#1C2B6B',
  navyDeep: '#111D4A',
  teal: '#2BBCD4',
  tealLight: '#E0F7FB',
  orange: '#F5A623',
  orangeDeep: '#E8891A',
  orangeLight: '#FFF4E0',
  white: '#FFFFFF',
  text: '#0F1A3E',
  textMd: '#4A5578',
  textSm: '#8892AA',
  border: '#E4E9F2',
  surface: '#F7F9FD',
  green: '#00C48C',
  greenLight: '#E6FBF5',
  red: '#FF5A5A',
  redLight: '#FFF0F0',
  canvasBg: '#F0F4FB',
};

export default function BuildingSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    totalFloors: '',
    totalApartments: '',
    monthlyFee: '',
    contactPhone: '',
    contactEmail: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('User not found. Please login again.');
      setLoading(false);
      return;
    }

    const { data: building, error: dbError } = await supabase
      .from('buildings')
      .insert([{
        syndic_id: user.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        total_floors: parseInt(formData.totalFloors) || 0,
        total_apartments: parseInt(formData.totalApartments) || 0,
        monthly_fee: parseFloat(formData.monthlyFee) || 0,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
      }])
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
    } else {
      localStorage.setItem('building_setup_completed', 'true');
      localStorage.setItem('building_id', building.id);
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
      padding: '48px 16px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * {
          box-sizing: border-box;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .fade-in {
          animation: fadeIn 0.5s ease both;
        }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Progress Steps */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  background: step >= s ? `linear-gradient(135deg, ${T.navy}, ${T.teal})` : T.white,
                  color: step >= s ? T.white : T.textSm,
                  border: step >= s ? 'none' : `1px solid ${T.border}`,
                  boxShadow: step >= s ? `0 4px 12px ${T.teal}40` : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {s}
                </div>
                {s < 3 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    margin: '0 12px',
                    background: step > s ? `linear-gradient(90deg, ${T.teal}, ${T.orange})` : T.border,
                    transition: 'all 0.3s ease',
                  }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 8px' }}>
            <span style={{ fontSize: 11, color: T.textSm, fontWeight: 600, letterSpacing: 0.5 }}>BUILDING INFO</span>
            <span style={{ fontSize: 11, color: T.textSm, fontWeight: 600, letterSpacing: 0.5 }}>DETAILS</span>
            <span style={{ fontSize: 11, color: T.textSm, fontWeight: 600, letterSpacing: 0.5 }}>COMPLETE</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="fade-in" style={{
          background: T.white,
          borderRadius: 20,
          boxShadow: '0 8px 30px rgba(27,43,107,0.08)',
          border: `1px solid ${T.border}`,
          overflow: 'hidden',
        }}>
          <div style={{ padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              {/* Logo - without box, just the image */}
              <div style={{
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src="/logo3.png"
                  alt="SYNDIX"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.style.width = '80px';
                      fallback.style.height = '80px';
                      fallback.style.background = `linear-gradient(135deg, ${T.navy}, ${T.teal})`;
                      fallback.style.borderRadius = '16px';
                      fallback.style.display = 'flex';
                      fallback.style.alignItems = 'center';
                      fallback.style.justifyContent = 'center';
                      fallback.style.fontSize = '32px';
                      fallback.style.fontWeight = 'bold';
                      fallback.style.color = T.white;
                      fallback.textContent = 'S';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: T.navy, letterSpacing: '-0.5px' }}>Welcome to SYNDIX!</h1>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: T.textMd }}>Let's set up your building information</p>
            </div>

            {error && (
              <div style={{
                marginBottom: 20,
                padding: '12px 16px',
                background: T.redLight,
                border: `1px solid ${T.red}30`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <AlertCircle size={16} color={T.red} />
                <span style={{ fontSize: 13, color: T.red, flex: 1 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Building Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Sunshine Tower"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'all 0.15s',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = T.teal}
                      onBlur={e => e.currentTarget.style.borderColor = T.border}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = T.teal}
                      onBlur={e => e.currentTarget.style.borderColor = T.border}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Algiers"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.teal}
                        onBlur={e => e.currentTarget.style.borderColor = T.border}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="16000"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.teal}
                        onBlur={e => e.currentTarget.style.borderColor = T.border}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{
                      width: '100%',
                      marginTop: 8,
                      padding: '12px 20px',
                      background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.white,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.15s',
                      boxShadow: '0 2px 8px rgba(27,43,107,0.2)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Total Floors</label>
                      <input
                        type="number"
                        name="totalFloors"
                        value={formData.totalFloors}
                        onChange={handleChange}
                        placeholder="5"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.teal}
                        onBlur={e => e.currentTarget.style.borderColor = T.border}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Total Apartments *</label>
                      <input
                        type="number"
                        name="totalApartments"
                        required
                        value={formData.totalApartments}
                        onChange={handleChange}
                        placeholder="20"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.teal}
                        onBlur={e => e.currentTarget.style.borderColor = T.border}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Monthly Fee (DZD) *</label>
                    <input
                      type="number"
                      name="monthlyFee"
                      required
                      value={formData.monthlyFee}
                      onChange={handleChange}
                      placeholder="5000"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = T.teal}
                      onBlur={e => e.currentTarget.style.borderColor = T.border}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Contact Phone</label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="+213 5XX XXX XXX"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.teal}
                        onBlur={e => e.currentTarget.style.borderColor = T.border}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Contact Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="admin@building.com"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: `1px solid ${T.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.teal}
                        onBlur={e => e.currentTarget.style.borderColor = T.border}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: 'transparent',
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.textMd,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.teal; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.border; }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.white,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.15s',
                        boxShadow: '0 2px 8px rgba(27,43,107,0.2)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Review <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{
                    background: T.surface,
                    borderRadius: 16,
                    padding: 20,
                    border: `1px solid ${T.border}`,
                  }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: T.navy }}>Building Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ color: T.textSm }}>Building Name:</span>
                        <span style={{ fontWeight: 600, color: T.text }}>{formData.name || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ color: T.textSm }}>Address:</span>
                        <span style={{ fontWeight: 600, color: T.text, textAlign: 'right' }}>{formData.address}, {formData.city}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ color: T.textSm }}>Total Floors:</span>
                        <span style={{ fontWeight: 600, color: T.text }}>{formData.totalFloors || 'Not specified'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ color: T.textSm }}>Total Apartments:</span>
                        <span style={{ fontWeight: 600, color: T.text }}>{formData.totalApartments || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: T.textSm }}>Monthly Fee:</span>
                        <span style={{ fontWeight: 700, color: T.orange, fontSize: 15 }}>{formData.monthlyFee} DZD</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: 'transparent',
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.textMd,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.teal; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.border; }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: loading ? T.textSm : T.green,
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.white,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.15s',
                        boxShadow: loading ? 'none' : '0 2px 8px rgba(0,196,140,0.3)',
                      }}
                      onMouseEnter={e => {
                        if (!loading) e.currentTarget.style.background = '#00A87A';
                      }}
                      onMouseLeave={e => {
                        if (!loading) e.currentTarget.style.background = T.green;
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{ width: 16, height: 16, border: `2px solid ${T.white}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                          Setting up...
                        </>
                      ) : (
                        <>
                          Complete Setup <CheckCircle size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}