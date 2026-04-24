import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { T } from '../../styles/theme';
import { CheckCircle, User, Home, Building2, ArrowRight, Sparkles } from 'lucide-react';
import Head from 'next/head';

// ============================================
// TYPESCRIPT DECLARATION for PWA install prompt
// ============================================

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResidentLogin() {
  const router = useRouter();
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [residentName, setResidentName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // ============================================
  // INITIALIZATION - Check for existing session or new token
  // ============================================
  
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const savedToken = localStorage.getItem('resident_token');
    const savedResident = localStorage.getItem('resident_data');
    
    if (isStandalone && savedToken && savedResident) {
      router.replace('/resident/dashboard');
      return;
    }
    
    if (router.isReady) {
      const { token: tokenFromUrl } = router.query;
      
      if (tokenFromUrl && typeof tokenFromUrl === 'string') {
        setToken(tokenFromUrl);
        verifyToken(tokenFromUrl);
      } else if (!savedToken) {
        setError('No access token found. Please scan the QR code.');
        setLoading(false);
      } else {
        verifyToken(savedToken);
      }
    }
  }, [router.isReady, router.query]);

  // ============================================
  // API CALLS - Token verification
  // ============================================
  
  const verifyToken = async (accessToken: string) => {
    try {
      const response = await fetch('/api/resident/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Invalid QR code. Please contact your syndic.');
        setLoading(false);
        return;
      }

      localStorage.setItem('resident_token', data.token);
      localStorage.setItem('resident_data', JSON.stringify(data.resident));
      localStorage.setItem('resident_name', data.resident.full_name);
      localStorage.setItem('resident_apartment', data.resident.apartment_number || '?');
      localStorage.setItem('resident_building', data.resident.building_name || 'Your Building');

      setResidentName(data.resident.full_name);
      setApartmentNumber(data.resident.apartment_number || '?');
      setBuildingName(data.resident.building_name || 'Your Building');
      setLoading(false);
      setShowWelcome(true);

    } catch (err) {
      console.error('Error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/resident/dashboard');
  };

  // ============================================
  // LOADING SCREEN
  // ============================================
  
  if (loading) {
    return (
      <>
        <Head>
          <title>Verifying Access | SYNDIX</title>
        </Head>
        <div style={{ 
          minHeight: '100vh', 
          background: `linear-gradient(135deg, ${T.navy}, ${T.navyDeep})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: `3px solid ${T.orange}`,
              borderTopColor: 'transparent',
              animation: 'spin 0.75s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>Verifying your access...</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>Please wait a moment</p>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </>
    );
  }

  // ============================================
  // ERROR SCREEN
  // ============================================
  
  if (error) {
    return (
      <>
        <Head>
          <title>Access Denied | SYNDIX</title>
        </Head>
        <div style={{ 
          minHeight: '100vh', 
          background: `linear-gradient(135deg, ${T.navy}, ${T.navyDeep})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{ 
            background: T.white, 
            borderRadius: 28, 
            padding: 32, 
            maxWidth: 400, 
            width: '100%', 
            textAlign: 'center',
            border: `1px solid ${T.border}`
          }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: T.redLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="1" fill={T.red} />
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.navy }}>Access Denied</h2>
            <p style={{ margin: '12px 0 0', fontSize: 14, color: T.textMd }}>{error}</p>
            <button 
              onClick={() => window.location.href = '/'} 
              style={{ 
                marginTop: 24, 
                padding: '14px 24px', 
                background: T.navy, 
                color: '#fff', 
                border: 'none', 
                borderRadius: 16, 
                width: '100%', 
                fontSize: 15, 
                fontWeight: 600, 
                cursor: 'pointer' 
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // WELCOME SCREEN
  // ============================================
  
  return (
    <>
      <Head>
        <title>Welcome | SYNDIX Resident Portal</title>
        <meta name="description" content="Access your apartment portal" />
      </Head>
      
      <div style={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyDeep})`,
        fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
        
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .slide-up {
            animation: slideUp 0.5s ease both;
          }
          .scale-in {
            animation: scaleIn 0.4s ease both;
          }
        `}</style>

        <div style={{ maxWidth: 450, width: '100%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          {/* ============================================
              PWA INSTALL PROMPT
          ============================================ */}
          
          <div className="scale-in" style={{ marginBottom: 16, textAlign: 'center' }}>
            <button
              onClick={async () => {
                if (window.deferredPrompt) {
                  window.deferredPrompt.prompt();
                  const { outcome } = await window.deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    console.log('App installed successfully');
                  }
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid rgba(255,255,255,0.2)`,
                borderRadius: 100,
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 500,
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              📱 Install App for Quick Access
            </button>
          </div>

          {/* ============================================
              MAIN CARD CONTAINER - Glass morphism effect
          ============================================ */}
          
          <div className="scale-in" style={{
            background: 'rgba(255,255,255,0.98)',
            borderRadius: 32,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(10px)'
          }}>
            
            {/* ============================================
                HEADER SECTION - No white box for logo
            ============================================ */}
            
            <div style={{
              background: `linear-gradient(135deg, ${T.navy} 0%, ${T.teal} 100%)`,
              padding: '40px 24px 32px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Decorative circles */}
              <div style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                pointerEvents: 'none'
              }} />
              
              {/* SYNDIX Logo - No white background, just the logo on gradient */}
              <div style={{
                width: 80,
                height: 80,
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src="/logo3.png"
                  alt="SYNDIX"
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)' // Makes logo white to match gradient background
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.style.fontSize = '36px';
                      fallback.style.fontWeight = 'bold';
                      fallback.style.color = '#fff';
                      fallback.textContent = 'S';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              
              <h1 style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.5px'
              }}>
                Welcome Back!
              </h1>
              <p style={{
                margin: '8px 0 0',
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)'
              }}>
                Your apartment portal is ready
              </p>
            </div>

            {/* ============================================
                SUCCESS CHECKMARK
            ============================================ */}
            
            <div className="scale-in" style={{
              marginTop: -30,
              textAlign: 'center'
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: T.green,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,196,140,0.3)'
              }}>
                <CheckCircle size={32} color="#fff" />
              </div>
            </div>

            {/* ============================================
                RESIDENT INFORMATION CARD
            ============================================ */}
            
            <div className="slide-up" style={{ padding: '24px 24px 32px' }}>
              
              <div style={{
                background: T.surface,
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                border: `1px solid ${T.border}`
              }}>
                {/* Resident Name */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <User size={24} color={T.teal} style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: 12, color: T.textSm, letterSpacing: 0.5 }}>WELCOME</p>
                  <h2 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: T.navy }}>
                    {residentName}
                  </h2>
                </div>

                <div style={{
                  height: 1,
                  background: T.border,
                  margin: '16px 0'
                }} />

                {/* Apartment Number */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Home size={18} color={T.orange} />
                    <span style={{ fontSize: 13, color: T.textMd }}>Apartment</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>{apartmentNumber}</span>
                </div>

                {/* Building Name */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Building2 size={18} color={T.teal} />
                    <span style={{ fontSize: 13, color: T.textMd }}>Building</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{buildingName}</span>
                </div>
              </div>

              {/* ============================================
                  CONTINUE BUTTON
              ============================================ */}
              
              <button
                onClick={handleContinue}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
                  border: 'none',
                  borderRadius: 16,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(27,43,107,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(27,43,107,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(27,43,107,0.3)';
                }}
              >
                Continue to Dashboard
                <ArrowRight size={18} />
              </button>

              <p style={{
                textAlign: 'center',
                marginTop: 20,
                fontSize: 11,
                color: T.textSm
              }}>
                Secure resident portal • SYNDIX
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}