import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';

import { 
  DollarSign, CheckCircle, Clock, AlertCircle, 
  Calendar, CreditCard, Wallet, Download
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';
import { generateInvoicePDF } from '../../lib/invoiceGenerator';



interface Payment {
  id: string;
  amount: number;
  status: string;
  month: string;
  due_date: string;
  paid_at: string | null;
  resident_name: string;
  apartment_number: string;
  resident_id: string;
}

interface Building {
  id: string;
  name: string;
  city: string;
  monthly_fee: number;
}

export default function PaymentsManagement() {
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .single();
      
      if (buildingData) {
        setBuilding(buildingData);
        await fetchPayments(buildingData.id);
      }
    }
    setLoading(false);
  };

  const fetchPayments = async (buildingId: string) => {
    try {
      // Get all residents in this building
      const { data: residents } = await supabase
        .from('residents')
        .select(`
          id, 
          full_name,
          apartments (
            apartment_number
          )
        `)
        .eq('building_id', buildingId);
      
      if (!residents || residents.length === 0) {
        setPayments([]);
        setStats({ total: 0, paid: 0, pending: 0, overdue: 0 });
        return;
      }
      
      const residentIds = residents.map(r => r.id);
      
      // Get payments for these residents
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .in('resident_id', residentIds);
      
      if (!paymentsData || paymentsData.length === 0) {
        setPayments([]);
        setStats({ total: 0, paid: 0, pending: 0, overdue: 0 });
        return;
      }
      
      // Create resident map
      const residentMap = new Map();
      residents.forEach(r => {
        const apartment = r.apartments as any;
        residentMap.set(r.id, {
          full_name: r.full_name,
          apartment_number: apartment?.apartment_number || '?'
        });
      });
      
      // Filter by selected month
      const filteredData = paymentsData.filter(p => {
        const paymentMonth = p.month?.toString().slice(0, 7);
        return paymentMonth === selectedMonth;
      });
      
      // Merge data
      const mergedPayments: Payment[] = filteredData.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        month: p.month,
        due_date: p.due_date,
        paid_at: p.paid_at,
        resident_id: p.resident_id,
        resident_name: residentMap.get(p.resident_id)?.full_name || 'Unknown',
        apartment_number: residentMap.get(p.resident_id)?.apartment_number || '?'
      }));
      
      setPayments(mergedPayments);
      
      // Calculate stats
      const total = mergedPayments.reduce((sum, p) => sum + p.amount, 0);
      const paid = mergedPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const pending = mergedPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
      const overdue = mergedPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
      
      setStats({ total, paid, pending, overdue });
      
    } catch (err) {
      console.error('Error:', err);
      setPayments([]);
    }
  };

  const markAsPaid = async (paymentId: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', paymentId);
    
    if (error) {
      alert('Error updating payment: ' + error.message);
    } else {
      if (building) {
        await fetchPayments(building.id);
      }
      alert('Payment marked as paid!');
    }
  };

  const downloadInvoice = async (payment: Payment) => {
    const { data: resident } = await supabase
      .from('residents')
      .select('*, buildings(name, address)')
      .eq('id', payment.resident_id)
      .single();
    
    const subtotal = payment.amount;
    const tax = subtotal * 0.19;
    const total = subtotal + tax;
    
    const invoiceData = {
      invoiceNumber: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
      date: new Date(payment.month).toLocaleDateString(),
      dueDate: new Date(payment.due_date).toLocaleDateString(),
      residentName: payment.resident_name,
      apartmentNumber: payment.apartment_number,
      buildingName: resident?.buildings?.name || 'Syndix Building',
      buildingAddress: resident?.buildings?.address || 'Algiers, Algeria',
      items: [{ 
        description: `Monthly Service Fee - ${new Date(payment.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })}`, 
        amount: subtotal 
      }],
      subtotal: subtotal,
      tax: tax,
      total: total,
      status: payment.status,
      paymentDate: payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : undefined,
      paymentMethod: 'Credit Card'
    };
    
    generateInvoicePDF(invoiceData);
  };

  const generateMonthlyPayments = async () => {
    if (!building) return;
    
    const monthlyAmount = building.monthly_fee;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (monthlyAmount <= 0) {
      alert('Please set a monthly fee in your building settings first.');
      return;
    }
    
    const { data: residents } = await supabase
      .from('residents')
      .select('id, apartment_id')
      .eq('building_id', building.id);
    
    if (!residents || residents.length === 0) {
      alert('No residents found. Please add residents first.');
      return;
    }
    
    let inserted = 0;
    
    for (const resident of residents) {
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('resident_id', resident.id)
        .eq('month', `${currentMonth}-01`)
        .maybeSingle();
      
      if (!existing) {
        await supabase.from('payments').insert([{
          building_id: building.id,
          resident_id: resident.id,
          apartment_id: resident.apartment_id,
          amount: monthlyAmount,
          month: `${currentMonth}-01`,
          due_date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
          status: 'pending'
        }]);
        inserted++;
      }
    }
    
    await fetchPayments(building.id);
    alert(`Generated ${inserted} monthly fees.`);
  };

  const collectionRate = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, fontFamily:'system-ui', margin:0 }}>Loading SYNDIX…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <Layout title="Payments Management" subtitle="Track and manage monthly fees">
      {/* Hero Section */}
      <div className="fade-up" style={{
        marginBottom:24, borderRadius:20, padding:'26px 30px',
        background: `linear-gradient(130deg, ${T.navyDeep} 0%, ${T.navy} 55%, #1A4D7C 100%)`,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:220, height:220, borderRadius:'50%', background:`radial-gradient(circle, ${T.teal}20 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${T.orange}, ${T.teal}, transparent)` }} />
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:T.green }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Financial Overview</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Payment Dashboard 💰
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {building?.name} · Collection rate: {collectionRate.toFixed(0)}%
            </p>
          </div>
          <button
            onClick={generateMonthlyPayments}
            style={{
              padding:'8px 20px', borderRadius:30,
              background:T.orange, border:'none',
              display:'flex', alignItems:'center', gap:8, cursor:'pointer',
              boxShadow:'0 2px 8px rgba(245,166,35,0.3)'
            }}>
            <DollarSign size={16} color="#fff" />
            <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>Generate Fees</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <div style={{ background:T.white, borderRadius:16, padding:'18px', border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'#EEF1FB', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Wallet size={17} color={T.navy} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:20, fontWeight:800, color:T.navy }}>{formatCurrency(stats.total)}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Total Expected</p>
            </div>
          </div>
        </div>
        
        <div style={{ background:T.white, borderRadius:16, padding:'18px', border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:T.greenLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CheckCircle size={17} color={T.green} />
              </div>
              <div>
                <p style={{ margin:0, fontSize:20, fontWeight:800, color:T.navy }}>{formatCurrency(stats.paid)}</p>
                <p style={{ margin:0, fontSize:11, color:T.textSm }}>Collected</p>
              </div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, padding:'4px 8px', borderRadius:20, background:T.greenLight, color:T.green }}>{collectionRate.toFixed(0)}%</span>
          </div>
        </div>
        
        <div style={{ background:T.white, borderRadius:16, padding:'18px', border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:T.orangeLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Clock size={17} color={T.orange} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:20, fontWeight:800, color:T.navy }}>{formatCurrency(stats.pending)}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Pending</p>
            </div>
          </div>
        </div>
        
        <div style={{ background:T.white, borderRadius:16, padding:'18px', border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:T.redLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <AlertCircle size={17} color={T.red} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:20, fontWeight:800, color:T.navy }}>{formatCurrency(stats.overdue)}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="fade-up-3" style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Calendar size={18} color={T.textSm} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding:'8px 12px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, outline:'none' }}
              onFocus={e => e.currentTarget.style.borderColor = T.teal}
              onBlur={e => e.currentTarget.style.borderColor = T.border}
            />
          </div>
          <button
            onClick={generateMonthlyPayments}
            style={{ padding:'8px 20px', background:T.navy, border:'none', borderRadius:8, display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <DollarSign size={16} color="#fff" />
            <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>Generate Monthly Fees</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="fade-up-3" style={{ background:T.white, borderRadius:18, border:`1px solid ${T.border}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(27,43,107,0.04)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:T.surface, borderBottom:`1px solid ${T.border}` }}>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Resident</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Apartment</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Amount</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Due Date</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Status</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Actions</th>
               </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding:'48px 20px', textAlign:'center' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <DollarSign size={40} color={T.textSm} />
                      <p style={{ margin:0, fontSize:13, color:T.textSm }}>No payments found for {selectedMonth}</p>
                      <button
                        onClick={generateMonthlyPayments}
                        style={{ marginTop:8, padding:'6px 16px', background:T.navy, border:'none', borderRadius:20, color:'#fff', fontSize:12, cursor:'pointer' }}
                      >
                        Generate Monthly Fees
                      </button>
                    </div>
                   </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="row-hover" style={{ borderBottom:`1px solid ${T.border}`, transition:'background 0.15s' }}>
                    <td style={{ padding:'14px 20px', fontSize:14, fontWeight:600, color:T.navy }}>{payment.resident_name}</td>
                    <td style={{ padding:'14px 20px', fontSize:13, color:T.textMd }}>Apt {payment.apartment_number}</td>
                    <td style={{ padding:'14px 20px', fontSize:13, fontWeight:700, color:T.navy }}>{formatCurrency(payment.amount)}</td>
                    <td style={{ padding:'14px 20px', fontSize:13, color:T.textMd }}>{new Date(payment.due_date).toLocaleDateString()}</td>
                    <td style={{ padding:'14px 20px' }}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:4,
                        padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600,
                        background: payment.status === 'paid' ? T.greenLight : payment.status === 'pending' ? T.orangeLight : T.redLight,
                        color: payment.status === 'paid' ? '#057A55' : payment.status === 'pending' ? T.orangeDeep : T.red,
                      }}>
                        {payment.status === 'paid' && <CheckCircle size={10} />}
                        {payment.status === 'pending' && <Clock size={10} />}
                        {payment.status === 'overdue' && <AlertCircle size={10} />}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          onClick={() => downloadInvoice(payment)}
                          style={{ padding:6, borderRadius:6, background:'transparent', border:'none', cursor:'pointer', color:T.textSm, transition:'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.navy; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSm; }}
                          title="Download Invoice"
                        >
                          <Download size={14} />
                        </button>
                        {payment.status !== 'paid' && (
                          <button
                            onClick={() => markAsPaid(payment.id)}
                            style={{ padding:'4px 12px', background:T.green, border:'none', borderRadius:6, fontSize:11, fontWeight:600, color:'#fff', cursor:'pointer', transition:'all 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#00A87A'}
                            onMouseLeave={e => e.currentTarget.style.background = T.green}
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .fade-up {
          animation: fadeUp 0.5s ease both;
        }
        .fade-up-2 {
          animation: fadeUp 0.5s 0.08s ease both;
        }
        .fade-up-3 {
          animation: fadeUp 0.5s 0.16s ease both;
        }
        .row-hover:hover {
          background: ${T.surface};
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </Layout>
  );
}