import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  CreditCard, CheckCircle, Clock, AlertCircle,
  ArrowLeft, X, Lock, Wallet, Calendar, Sparkles
} from 'lucide-react';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

interface Payment {
  id: string;
  amount: number;
  status: string;
  month: string;
  due_date: string;
  paid_at: string | null;
  description?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResidentPayments() {
  const router = useRouter();
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [resident, setResident] = useState<any>(null);        // Current resident data
  const [loading, setLoading] = useState(true);              // Loading state
  const [payments, setPayments] = useState<Payment[]>([]);    // List of payments
  const [filter, setFilter] = useState('all');               // Filter: all, pending, paid
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null); // Payment being processed
  const [processing, setProcessing] = useState(false);       // Processing state
  const [processingId, setProcessingId] = useState<string | null>(null); // ID of payment being processed

  // ============================================
  // INITIALIZATION - Load resident data from localStorage
  // ============================================
  
  useEffect(() => {
    // Get saved session data
    const token = localStorage.getItem('resident_token');
    const residentData = localStorage.getItem('resident_data');
    
    // No valid session → redirect to login
    if (!token || !residentData) {
      router.push('/resident');
      return;
    }
    
    try {
      const resident = JSON.parse(residentData);
      setResident(resident);
      fetchPayments(resident.id);  // Load their payment history
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================
  
  /**
   * Fetch all payments for the current resident
   * Orders by newest month first
   */
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
        setPayments([]);
      } else {
        setPayments(data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PAYMENT PROCESSING
  // ============================================
  
  /**
   * Process a payment (mark as paid)
   * 1. Get building_id for syndic notification
   * 2. Update payment status in database
   * 3. Create transaction record for audit trail
   * 4. Notify syndic via notifications table
   * 5. Refresh the payments list
   */
  const processPayment = async (payment: Payment) => {
    if (!resident) {
      alert('Resident information not found');
      return;
    }
    
    setProcessing(true);
    setProcessingId(payment.id);
    
    try {
      console.log('Processing payment for resident:', resident.id);
      
      // Step 1: Get building_id from resident (needed to find syndic)
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('building_id')
        .eq('id', resident.id)
        .maybeSingle();
      
      if (residentError) {
        console.error('Resident error:', residentError);
      }
      
      // Step 2: Update payment status to 'paid'
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', payment.id);
      
      if (updateError) {
        throw new Error('Failed to update payment: ' + updateError.message);
      }
      
      // Step 3: Create transaction record (audit trail)
      try {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([{
            payment_id: payment.id,
            resident_id: resident.id,
            building_id: residentData?.building_id || null,
            amount: payment.amount,
            status: 'completed',
            payment_method: 'bank_transfer',
            transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paid_at: new Date().toISOString()
          }]);
        
        if (transactionError) {
          console.error('Transaction record error:', transactionError);
        }
      } catch (err) {
        console.error('Transaction insert error:', err);
      }
      
      // Step 4: Notify syndic about the payment
      if (residentData?.building_id) {
        const { data: building, error: buildingError } = await supabase
          .from('buildings')
          .select('syndic_id, name')
          .eq('id', residentData.building_id)
          .maybeSingle();
        
        if (!buildingError && building?.syndic_id) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert([{
              user_id: building.syndic_id,
              title: '💰 Payment Received',
              message: `${resident.full_name || resident.name || 'Resident'} from ${building.name || 'your building'} paid ${payment.amount.toLocaleString()} DZD`,
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
        }
      }
      
      // Step 5: Refresh payments list
      await fetchPayments(resident.id);
      
      // Step 6: Force update local state to show paid immediately
      setPayments(prev => prev.map(p => 
        p.id === payment.id ? { ...p, status: 'paid', paid_at: new Date().toISOString() } : p
      ));
      
      // Step 7: Show success message
      alert(`✅ Payment successful! ${payment.amount.toLocaleString()} DZD has been paid.`);
      setSelectedPayment(null);
      
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Payment failed: ' + (err as Error).message);
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  // ============================================
  // UI HELPER FUNCTIONS
  // ============================================
  
  // Filter payments based on selected filter
  const filteredPayments = payments.filter(p => {
    if (filter === 'paid') return p.status === 'paid';
    if (filter === 'pending') return p.status === 'pending';
    return true;
  });

  // Calculate payment statistics
  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    collectionRate: payments.length > 0 ? (payments.filter(p => p.status === 'paid').length / payments.length) * 100 : 0
  };

  // Get status badge styling (color, icon, label)
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

  // ============================================
  // LOADING SCREEN (Clean white)
  // ============================================
  
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#FFFFFF',
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
          <p style={{ color: T.textMd, fontSize: 14 }}>Loading payments...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!resident) return null;

  // Safe area bottom padding for mobile devices
  const safeBottomPadding = 'calc(100px + env(safe-area-inset-bottom))';
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      paddingBottom: safeBottomPadding
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
        .card-hover {
          transition: transform 0.1s ease;
        }
        .card-hover:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* ============================================
          HEADER SECTION - Dark blue matching other pages
      ============================================ */}
      
      <div style={{
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        padding: '24px 20px 40px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header row with back button and title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            {/* Back button */}
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
            
            {/* Title area */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles size={14} color={T.orange} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>FINANCIAL</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Payments</h1>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>View and pay your monthly fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          STATISTICS CARDS - Payment summary
      ============================================ */}
      
      <div style={{ padding: '0 20px', marginTop: -30 }}>
        <div className="fade-in" style={{
          background: T.white,
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 4px 12px rgba(27,43,107,0.08)',
          border: `1px solid ${T.border}`
        }}>
          {/* 3-column stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* Total Amount */}
            <div style={{ textAlign: 'center' }}>
              <Wallet size={20} color={T.teal} style={{ margin: '0 auto 4px' }} />
              <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Total</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>{stats.total.toLocaleString()} DZD</p>
            </div>
            
            {/* Paid Amount */}
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={20} color={T.green} style={{ margin: '0 auto 4px' }} />
              <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Paid</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.green }}>{stats.paid.toLocaleString()} DZD</p>
            </div>
            
            {/* Pending Amount */}
            <div style={{ textAlign: 'center' }}>
              <Clock size={20} color={T.orange} style={{ margin: '0 auto 4px' }} />
              <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Pending</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.orange }}>{stats.pending.toLocaleString()} DZD</p>
            </div>
          </div>
          
          {/* Progress bar for collection rate */}
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

      {/* ============================================
          FILTER TABS - All, Pending, Paid
      ============================================ */}
      
      <div style={{ padding: '20px 20px 0' }}>
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

      {/* ============================================
          PAYMENTS LIST
      ============================================ */}
      
      <div style={{ padding: '20px' }}>
        {filteredPayments.length === 0 ? (
          // Empty State - No payments
          <div className="fade-in" style={{
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
          // List of payments
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
                  className="fade-in card-hover"
                  style={{
                    background: T.white,
                    borderRadius: 18,
                    padding: 16,
                    border: `1px solid ${T.border}`,
                    borderLeft: payment.status === 'pending' ? `4px solid ${T.orange}` : `1px solid ${T.border}`,
                    transition: 'transform 0.1s ease',
                    cursor: payment.status === 'pending' ? 'pointer' : 'default'
                  }}
                  onClick={() => !isProcessing && payment.status === 'pending' && setSelectedPayment(payment)}
                >
                  {/* Header: Month + Status Badge */}
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
                    
                    {/* Status Badge */}
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
                  
                  {/* Footer: Amount + Action Button */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: 8, 
                    paddingTop: 12, 
                    borderTop: `1px solid ${T.border}`
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Amount</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>{payment.amount.toLocaleString()} DZD</p>
                    </div>
                    
                    {/* Action Button */}
                    {payment.status === 'pending' && !isProcessing && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(payment);
                        }}
                        className="card-hover"
                        style={{
                          padding: '8px 20px',
                          background: T.orange,
                          border: 'none',
                          borderRadius: 12,
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Pay Now
                      </button>
                    )}
                    
                    {/* Processing Indicator */}
                    {isProcessing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: T.surface, borderRadius: 12 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
                        <span style={{ fontSize: 12, color: T.textMd }}>Processing...</span>
                      </div>
                    )}
                    
                    {/* Paid Date */}
                    {payment.status === 'paid' && payment.paid_at && (
                      <p style={{ margin: 0, fontSize: 11, color: T.green }}>
                        Paid {new Date(payment.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================
          PAYMENT CONFIRMATION MODAL
      ============================================ */}
      
      {selectedPayment && (
        <>
          {/* Backdrop overlay */}
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,26,62,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedPayment(null)}
          />
          
          {/* Modal content */}
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
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>Confirm Payment</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>Mark this invoice as paid</p>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.surface,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={16} color={T.textMd} />
              </button>
            </div>

            {/* Payment Details */}
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

            {/* Payment Method */}
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
                  <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Offline payment confirmation</p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
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
              <p style={{ margin: 0, fontSize: 11, color: T.teal }}>Syndic will be notified immediately</p>
            </div>

            {/* Action Buttons */}
            <button 
              onClick={() => processPayment(selectedPayment)}
              disabled={processing}
              className="card-hover"
              style={{
                width: '100%',
                padding: '14px',
                background: processing ? T.textSm : T.green,
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: processing ? 'not-allowed' : 'pointer'
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