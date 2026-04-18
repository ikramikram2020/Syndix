import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useResidentAuth } from '../../hooks/useResidentAuth';
import { 
  CreditCard, CheckCircle, Clock, AlertCircle,
  ArrowLeft, X, Zap, Shield, Lock
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  month: string;
  due_date: string;
  paid_at: string | null;
}

export default function ResidentPayments() {
  const router = useRouter();
  const { resident, loading: authLoading } = useResidentAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch payments when resident is available
  useEffect(() => {
    if (!authLoading && resident?.id) {
      fetchPayments();
    }
  }, [authLoading, resident]);

  const fetchPayments = async () => {
    if (!resident?.id) return;
    
    setLoading(true);
    console.log('Fetching payments for:', resident.id);
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('resident_id', resident.id)
        .order('month', { ascending: false });
      
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Payments found:', data?.length || 0);
        setPayments(data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processFakePayment = async (payment: Payment) => {
    setProcessing(true);
    setProcessingId(payment.id);
    
    alert(`Processing payment of ${payment.amount.toLocaleString()} MAD...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: 'paid', 
        paid_at: new Date().toISOString() 
      })
      .eq('id', payment.id);
    
    if (error) {
      alert('Payment failed: ' + error.message);
    } else {
      alert(`✅ Payment successful! ${payment.amount.toLocaleString()} MAD has been paid.`);
      await fetchPayments();
      setSelectedPayment(null);
    }
    
    setProcessing(false);
    setProcessingId(null);
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'paid') return p.status === 'paid';
    if (filter === 'pending') return p.status === 'pending';
    return true;
  });

  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Paid' };
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' };
      default:
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Overdue' };
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  // Show login prompt if no resident
  if (!resident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Please login to view payments</p>
          <button onClick={() => router.push('/resident/login')} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-800 px-5 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Payments</h1>
            <p className="text-blue-200 text-sm">View and pay your monthly fees</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-5 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Total</p>
              <p className="text-gray-800 font-bold text-lg">{stats.total.toLocaleString()} MAD</p>
            </div>
            <div className="text-center">
              <p className="text-green-500 text-xs">Paid</p>
              <p className="text-green-600 font-bold text-lg">{stats.paid.toLocaleString()} MAD</p>
            </div>
            <div className="text-center">
              <p className="text-orange-500 text-xs">Pending</p>
              <p className="text-orange-600 font-bold text-lg">{stats.pending.toLocaleString()} MAD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 mt-5">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'paid', label: 'Paid' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab.id ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="px-5 mt-5 space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No payments found</p>
            <p className="text-xs text-gray-300 mt-2">Resident ID: {resident.id.substring(0, 8)}...</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const status = getStatusBadge(payment.status);
            const StatusIcon = status.icon;
            const isProcessing = processingId === payment.id;
            
            return (
              <div
                key={payment.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer ${
                  payment.status === 'pending' ? 'border-l-4 border-l-orange-500 hover:shadow-md' : 'border-gray-100'
                }`}
                onClick={() => !isProcessing && payment.status === 'pending' && setSelectedPayment(payment)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {new Date(payment.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon size={12} className={status.text} />
                    <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <p className="text-2xl font-bold text-gray-800">{payment.amount.toLocaleString()} MAD</p>
                  {payment.status === 'pending' && !isProcessing && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayment(payment);
                      }}
                      className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-orange-600 transition"
                    >
                      Pay Now
                    </button>
                  )}
                  {isProcessing && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      <span className="text-sm text-gray-500">Processing...</span>
                    </div>
                  )}
                  {payment.status === 'paid' && payment.paid_at && (
                    <p className="text-xs text-green-600">Paid on {new Date(payment.paid_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {selectedPayment && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedPayment(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Payment Details</h3>
                <p className="text-sm text-gray-500">Complete your payment securely</p>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Month</span>
                  <span className="font-medium text-gray-800">
                    {new Date(selectedPayment.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date</span>
                  <span className="text-gray-800">{new Date(selectedPayment.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Amount</span>
                  <span className="text-2xl font-bold text-gray-800">{selectedPayment.amount.toLocaleString()} MAD</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
              <div className="flex items-center gap-3 p-3 border border-orange-200 rounded-xl bg-orange-50">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <CreditCard size={18} className="text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Credit Card</p>
                  <p className="text-xs text-gray-400">Pay with Visa, Mastercard</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 p-3 bg-blue-50 rounded-xl">
              <Lock size={14} className="text-blue-500" />
              <p className="text-xs text-blue-600">Your payment is secure and encrypted</p>
            </div>

            <button 
              onClick={() => processFakePayment(selectedPayment)}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition"
            >
              Pay {selectedPayment.amount.toLocaleString()} MAD
            </button>
            
            <button 
              onClick={() => setSelectedPayment(null)}
              className="w-full mt-3 py-3 border border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}