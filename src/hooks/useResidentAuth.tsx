import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  apartment_number: string;
  floor: number;
  building_name: string;
  building_city: string;
}

interface ResidentAuthContextType {
  resident: Resident | null;
  loading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const ResidentAuthContext = createContext<ResidentAuthContextType | undefined>(undefined);

export function ResidentAuthProvider({ children }: { children: ReactNode }) {
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const storedResident = localStorage.getItem('resident_session');
    const storedToken = localStorage.getItem('resident_token');
    
    console.log('Stored session check:', { storedResident, storedToken });
    
    if (storedResident && storedToken) {
      try {
        const parsedResident = JSON.parse(storedResident);
        setResident(parsedResident);
        console.log('Session restored:', parsedResident);
      } catch (e) {
        console.error('Failed to parse resident session', e);
        localStorage.removeItem('resident_session');
        localStorage.removeItem('resident_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (token: string): Promise<boolean> => {
    setLoading(true);
    console.log('Attempting login with token:', token);
    
    try {
      const response = await fetch('/api/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success && data.resident) {
        setResident(data.resident);
        localStorage.setItem('resident_session', JSON.stringify(data.resident));
        localStorage.setItem('resident_token', data.token);
        console.log('Login successful, resident saved:', data.resident);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setResident(null);
    localStorage.removeItem('resident_session');
    localStorage.removeItem('resident_token');
    router.push('/resident/login');
  };

  return (
    <ResidentAuthContext.Provider value={{
      resident,
      loading,
      login,
      logout,
      isAuthenticated: !!resident,
    }}>
      {children}
    </ResidentAuthContext.Provider>
  );
}

export function useResidentAuth(): ResidentAuthContextType {
  const context = useContext(ResidentAuthContext);
  if (context === undefined) {
    throw new Error('useResidentAuth must be used within a ResidentAuthProvider');
  }
  return context;
}