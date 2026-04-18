import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useResidentAuth } from '../../hooks/useResidentAuth';
import { QrCode, Scan, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function ResidentLogin() {
  const router = useRouter();
  const { login, isAuthenticated } = useResidentAuth();
  const { token: urlToken } = router.query;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/resident');
    }
  }, [isAuthenticated, router]);

  // Auto-verify if token is in URL
  useEffect(() => {
    if (urlToken && typeof urlToken === 'string') {
      setToken(urlToken);
      handleLogin(urlToken);
    }
  }, [urlToken]);

  const handleLogin = async (tokenValue?: string) => {
    const loginToken = tokenValue || token;
    
    if (!loginToken) {
      setError('Please enter or scan your QR code token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await login(loginToken);
      
      if (success) {
        router.push('/resident');
      } else {
        setError('Invalid QR code. Please contact your syndic.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg mb-4">
            <QrCode size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Resident Portal</h1>
          <p className="text-blue-200 mt-2">Scan your QR code to access your apartment portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Verifying your access...</p>
            </div>
          ) : (
            <>
              {/* QR Code Illustration */}
              <div className="bg-slate-100 rounded-xl p-6 text-center mb-6">
                <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center mb-3">
                  <Scan size={48} className="text-blue-600" />
                </div>
                <p className="text-sm text-slate-500">
                  Scan the QR code provided by your syndic
                </p>
              </div>

              {/* Manual Token Entry */}
              <form onSubmit={handleManualEntry}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Or enter your access token manually
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your QR token here..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {loading ? 'Verifying...' : 'Access My Portal'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  Don't have a QR code? Contact your building syndic.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}