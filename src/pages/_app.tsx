import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ResidentAuthProvider } from '../hooks/useResidentAuth';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if app is installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if user is a resident (has token)
    const residentToken = localStorage.getItem('resident_token');
    const residentData = localStorage.getItem('resident_data');
    const isResident = !!(residentToken || residentData);
    
    // Check if user is syndic (admin)
    const session = localStorage.getItem('sb-session');
    const isSyndic = !!session;
    
    // Current page
    const isOnLoginPage = router.pathname === '/';
    const isOnResidentPage = router.pathname === '/resident' || router.pathname.startsWith('/resident/');
    
    // LOGIC: Redirect residents away from login page to their dashboard
    if (isStandalone && isResident && !isOnResidentPage && isOnLoginPage) {
      router.replace('/resident/dashboard');
      return;
    }
    
    // LOGIC: Redirect syndics to admin dashboard (optional)
    if (isStandalone && isSyndic && isOnLoginPage) {
      router.replace('/dashboard');
      return;
    }
  }, [router.pathname]);

  return (
    <div dir="ltr">
      <ThemeProvider>
        <LanguageProvider>
          <ResidentAuthProvider>
            <Component {...pageProps} />
          </ResidentAuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </div>
  );
}