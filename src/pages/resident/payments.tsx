import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  CreditCard, CheckCircle, Clock, AlertCircle,
  ArrowLeft, X, Lock, Wallet, Calendar, Bell
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  month: string;
  due_date: string;
  paid_at: string | null;
  description?: string;
}

export default function ResidentPayments() {
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Get resident from localStorage
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
      fetchPayments(resident.id);
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  const fetchPayments = async (residentId: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('resident_id', residentId)
        .order('month', { ascending: false });
      
      if (error) {
        console.error('Error fetching payments:', error);
      } else {
        setPayments(data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (payment: Payment) => {
    if (!resident) return;
    
    setProcessing(true);
    setProcessingId(payment.id);
    
    try {
      // 1. Get building_id and syndic_id from resident
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('building_id')
        .eq('id', resident.id)
        .single();
      
      if (residentError) throw residentError;
      
      // 2. Get syndic_id from building
      const { data: building, error: buildingError } = await supabase
        .from('buildings')
        .select('syndic_id, name')
        .eq('id', residentData.building_id)
        .single();
      
      if (buildingError) throw buildingError;
      
      // 3. Update payment status in database
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', payment.id);
      
      if (updateError) throw new Error(updateError.message);
      
      // 4. Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          payment_id: payment.id,
          resident_id: resident.id,
          building_id: residentData.building_id,
          amount: payment.amount,
          status: 'completed',
          payment_method: 'bank_transfer',
          transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paid_at: new Date().toISOString()
        }]);
      
      if (transactionError) {
        console.error('Transaction record error:', transactionError);
      }
      
      // 5. Send notification to SYNDIC (not resident)
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: building.syndic_id,
          title: '💰 Payment Received',
          message: `${resident.full_name || resident.name || 'Resident'} from ${building.name} paid ${payment.amount.toLocaleString()} DZD for ${new Date(payment.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })}`,
          type: 'payment',
          read: false,
          created_at: new Date().toISOString(),
          data: JSON.stringify({
            payment_id: payment.id,
            resident_id: resident.id,
            amount: payment.amount,
            month: payment.month
          })
        }]);
      
      if (notificationError) {
        console.error('Notification error:', notificationError);
      } else {
        console.log('✅ Syndic notified successfully');
      }
      
      // 6. Refresh the payments list
      await fetchPayments(resident.id);
      
      // 7. Show success message
      alert(`✅ Payment successful! ${payment.amount.toLocaleString()} DZD has been paid. The syndic has been notified.`);
      setSelectedPayment(null);
      
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Payment failed: ' + (err as Error).message);
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
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
    collectionRate: payments.length > 0 ? (payments.filter(p => p.status === 'paid').length / payments.length) * 100 : 0
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return { bg: T.greenLight, text: T.green, icon: CheckCircle, label: 'Paid' };
      case 'pending':
        return { bg: T.orangeLight, text: T.orangeDeep, icon: Clock, label: 'Pending' };
      default:
        return { bg: T.redLight, text: T.red, icon: AlertCircle, label: 'Overdue' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.canvasBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: T.textMd }}>Loading payments...</p>
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
      paddingBottom: 100
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.4s ease both;
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
        padding: '24px 20px 32px',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => router.back()} 
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <ArrowLeft size={20} color="#fff" />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Payments</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>View and pay your monthly fees</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ padding: '0 16px', marginTop: -20 }}>
        <div className="fade-in" style={{
          background: T.white,
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 4px 12px rgba(27,43,107,0.08)',
          border: `1px solid ${T.border}`
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <Wallet size={20} color={T.teal} style={{ margin: '0 auto 4px' }} />
              <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Total</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>{stats.total.toLocaleString()} DZD</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={20} color={T.green} style={{ margin: '0 auto 4px' }} />
              <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Paid</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.green }}>{stats.paid.toLocaleString()} DZD</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Clock size={20} color={T.orange} style={{ margin: '0 auto 4px' }} />
              <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Pending</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.orange }}>{stats.pending.toLocaleString()} DZD</p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textSm, marginBottom: 6 }}>
              <span>Collection Rate</span>
              <span>{stats.collectionRate.toFixed(0)}%</span>
            </div>
            <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${stats.collectionRate}%`, height: '100%', background: T.green, borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', gap: 8, background: T.white, borderRadius: 14, padding: 4, border: `1px solid ${T.border}` }}>
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'pending', label: 'Pending', icon: Clock },
            { id: 'paid', label: 'Paid', icon: CheckCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: isActive ? T.navy : 'transparent',
                  border: 'none',
                  borderRadius: 10,
                  color: isActive ? '#fff' : T.textMd,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s'
                }}
              >
                {Icon && <Icon size={14} color={isActive ? '#fff' : T.textMd} />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payments List */}
      <div style={{ padding: '0 16px' }}>
        {filteredPayments.length === 0 ? (
          <div style={{
            background: T.white,
            borderRadius: 20,
            padding: 48,
            textAlign: 'center',
            border: `1px solid ${T.border}`
          }}>
            <CreditCard size={48} color={T.textSm} style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14, color: T.textMd }}>No payments found</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>Your payment history will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredPayments.map((payment, index) => {
              const status = getStatusBadge(payment.status);
              const StatusIcon = status.icon;
              const isProcessing = processingId === payment.id;
              const dueDate = new Date(payment.due_date);
              const isOverdue = payment.status === 'pending' && dueDate < new Date();
              
              return (
                <div
                  key={payment.id}
                  className="fade-in"
                  style={{
                    background: T.white,
                    borderRadius: 18,
                    padding: 16,
                    border: `1px solid ${T.border}`,
                    borderLeft: payment.status === 'pending' ? `4px solid ${T.orange}` : `1px solid ${T.border}`,
                    transition: 'all 0.15s',
                    cursor: payment.status === 'pending' ? 'pointer' : 'default'
                  }}
                  onClick={() => !isProcessing && payment.status === 'pending' && setSelectedPayment(payment)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Calendar size={14} color={T.textSm} />
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.navy }}>
                          {new Date(payment.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: isOverdue ? T.red : T.textSm }}>
                        Due: {dueDate.toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </p>
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: status.bg
                    }}>
                      <StatusIcon size={10} color={status.text} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: status.text }}>{status.label}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Amount</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>{payment.amount.toLocaleString()} DZD</p>
                    </div>
                    {payment.status === 'pending' && !isProcessing && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(payment);
                        }}
                        style={{
                          padding: '8px 20px',
                          background: T.orange,
                          border: 'none',
                          borderRadius: 12,
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = T.orangeDeep}
                        onMouseLeave={e => e.currentTarget.style.background = T.orange}
                      >
                        Pay Now
                      </button>
                    )}
                    {isProcessing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: T.surface, borderRadius: 12 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
                        <span style={{ fontSize: 12, color: T.textMd }}>Processing...</span>
                      </div>
                    )}
                    {payment.status === 'paid' && payment.paid_at && (
                      <p style={{ margin: 0, fontSize: 11, color: T.green }}>
                        Paid on {new Date(payment.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedPayment && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,26,62,0.5)', zIndex: 40 }}
            onClick={() => setSelectedPayment(null)}
          />
          <div className="slide-up" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: T.white,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            zIndex: 50,
            padding: 24,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>Confirm Payment</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>This action will mark the invoice as paid</p>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.surface,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} color={T.textMd} />
              </button>
            </div>

            <div style={{
              background: T.surface,
              borderRadius: 20,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: T.textSm, fontSize: 13 }}>Month</span>
                <span style={{ fontWeight: 600, color: T.text, fontSize: 13 }}>
                  {new Date(selectedPayment.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: T.textSm, fontSize: 13 }}>Due Date</span>
                <span style={{ fontWeight: 600, color: T.text, fontSize: 13 }}>{new Date(selectedPayment.due_date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontWeight: 600, color: T.textMd }}>Amount to Pay</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: T.navy }}>{selectedPayment.amount.toLocaleString()} DZD</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 12 }}>Payment Method</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                background: T.orangeLight,
                borderRadius: 14,
                border: `1px solid ${T.orange}30`
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color={T.orange} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: T.text }}>Bank Transfer / Cash</p>
                  <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Mark as paid (offline payment)</p>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: T.tealLight,
              borderRadius: 12,
              marginBottom: 20
            }}>
              <Lock size={14} color={T.teal} />
              <p style={{ margin: 0, fontSize: 11, color: T.teal }}>The syndic will be notified immediately</p>
            </div>

            <button 
              onClick={() => processPayment(selectedPayment)}
              disabled={processing}
              style={{
                width: '100%',
                padding: '14px',
                background: processing ? T.textSm : T.green,
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {processing ? 'Processing...' : `Confirm Payment - ${selectedPayment.amount.toLocaleString()} DZD`}
            </button>
            
            <button 
              onClick={() => setSelectedPayment(null)}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '12px',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                color: T.textMd,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}