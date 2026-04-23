import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ResidentAuthProvider } from '../hooks/useResidentAuth';
import '../styles/globals.css';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('Service Worker registered:', reg);
        }).catch(err => {
          console.log('Service Worker registration failed:', err);
        });
      });
    }

    // Check if app can be installed
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      console.log('App can be installed');
    });
  }, []);

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