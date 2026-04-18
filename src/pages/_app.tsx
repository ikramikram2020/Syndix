import type { AppProps } from 'next/app';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ResidentAuthProvider } from '../hooks/useResidentAuth';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
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