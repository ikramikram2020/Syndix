import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { 
  DollarSign, CheckCircle, Clock, AlertCircle, 
  TrendingUp, Download, Calendar, CreditCard,
  Wallet, Receipt, Home, Users, Building2, Wrench, Megaphone, QrCode,
  LogOut, Menu, X, ChevronRight, Sparkles
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  residents?: {
    full_name: string;
    apartments?: {
      apartment_number: string;
    };
  };
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
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        await fetchResidents(buildingData.id);
      }
    }
    setLoading(false);
  };

  const fetchResidents = async (buildingId: string) => {
    const { data } = await supabase
      .from('residents')
      .select('*, apartments(apartment_number)')
      .eq('building_id', buildingId);
    setResidents(data || []);
    
    // After getting residents, fetch payments
    await fetchPayments(buildingId, data || []);
  };

  const fetchPayments = async (buildingId: string, residentsList: any[]) => {
    const residentIds = residentsList.map(r => r.id);
    
    if (residentIds.length === 0) {
      setPayments([]);
      setStats({ total: 0, paid: 0, pending: 0, overdue: 0 });
      return;
    }
    
    const { data } = await supabase
      .from('payments')
      .select('*, residents(full_name, apartments(apartment_number))')
      .in('resident_id', residentIds)
      .like('month', `${selectedMonth}%`);
    
    setPayments(data || []);
    
    const total = data?.reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0;
    const paid = data?.filter((p: Payment) => p.status === 'paid').reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0;
    const pending = data?.filter((p: Payment) => p.status === 'pending').reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0;
    const overdue = data?.filter((p: Payment) => p.status === 'overdue').reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0;
    
    setStats({ total, paid, pending, overdue });
  };

  const markAsPaid = async (paymentId: string) => {
    await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', paymentId);
    
    if (building) {
      await fetchResidents(building.id);
    }
  };

  const generateMonthlyPayments = async () => {
    if (!building) return;
    
    const monthlyAmount = building.monthly_fee;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    for (const resident of residents) {
      // Check if payment already exists
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('resident_id', resident.id)
        .like('month', `${currentMonth}%`)
        .maybeSingle();
      
      if (!existing) {
        await supabase.from('payments').insert([{
          resident_id: resident.id,
          apartment_id: resident.apartment_id,
          amount: monthlyAmount,
          month: `${currentMonth}-01`,
          due_date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
          status: 'pending'
        }]);
      }
    }
    await fetchResidents(building.id);
    alert('Monthly fees generated successfully!');
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const collectionRate = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'residents', label: 'Residents', icon: Users, href: '/dashboard/residents' },
    { id: 'payments', label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/dashboard/maintenance' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, href: '/dashboard/announcements' },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode, href: '/dashboard/qr-codes' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Menu Button */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md">
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-950 shadow-2xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-blue-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-white tracking-tight">SYNDIX</p>
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">Payments</p>
              </div>
            </div>
          </div>

          <div className="mx-3 mt-4 p-3 rounded-xl bg-blue-800/30 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 size={12} className="text-blue-300" />
              <p className="text-[10px] font-medium text-blue-300 uppercase">Current Building</p>
            </div>
            <p className="font-bold text-white text-sm">{building?.name}</p>
            <p className="text-[10px] text-blue-300 mt-1">{building?.city}</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'payments';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500' 
                      : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'}`}
                >
                  <Icon size={16} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-blue-800/50">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all">
              <LogOut size={16} />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Payments Management</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage monthly fees</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Wallet size={18} className="text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.total.toLocaleString()} MAD</p>
                    <p className="text-xs text-slate-500">Total Expected</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.paid.toLocaleString()} MAD</p>
                    <p className="text-xs text-slate-500">Collected</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{collectionRate.toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock size={18} className="text-amber-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.pending.toLocaleString()} MAD</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle size={18} className="text-red-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.overdue.toLocaleString()} MAD</p>
                  <p className="text-xs text-slate-500">Overdue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={generateMonthlyPayments}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition shadow-sm"
              >
                <DollarSign size={18} />
                Generate Monthly Fees
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Resident</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Apartment</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Due Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <DollarSign size={40} className="text-slate-300" />
                          <p>No payments found. Click "Generate Monthly Fees" to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 font-medium text-slate-800">{payment.residents?.full_name || 'Unknown'}</td>
                        <td className="px-5 py-3 text-slate-600">Apt {payment.residents?.apartments?.apartment_number || '?'}</td>
                        <td className="px-5 py-3 font-semibold text-slate-800">{payment.amount.toLocaleString()} MAD</td>
                        <td className="px-5 py-3 text-slate-600">{new Date(payment.due_date).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                            payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {payment.status === 'paid' && <CheckCircle size={10} />}
                            {payment.status === 'pending' && <Clock size={10} />}
                            {payment.status === 'overdue' && <AlertCircle size={10} />}
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {payment.status !== 'paid' && (
                            <button
                              onClick={() => markAsPaid(payment.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}