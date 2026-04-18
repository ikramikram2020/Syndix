import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useResidentAuth } from '../../hooks/useResidentAuth';
import { 
  Home, CreditCard, Wrench, Megaphone, User, 
  DollarSign, CheckCircle, Clock, Calendar, 
  ArrowRight, Bell, Zap, Menu, X, LogOut,
  Building2, Sparkles
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  month: string;
  due_date: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

export default function ResidentDashboard() {
  const router = useRouter();
  const { resident, logout } = useResidentAuth();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [pendingPayment, setPendingPayment] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [openRequests, setOpenRequests] = useState(0);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (resident) {
      fetchData();
    }
  }, [resident]);

  const fetchData = async () => {
    if (!resident) return;
    setLoading(true);
    
    try {
      // Get payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('resident_id', resident.id)
        .order('month', { ascending: false });
      
      const pending = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;
      const paid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;
      
      setPendingPayment(pending);
      setTotalPaid(paid);
      setRecentPayments(payments?.slice(0, 3) || []);
      
      // Get maintenance requests count
      const { data: requests } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('resident_id', resident.id);
      
      const open = requests?.filter(r => r.status !== 'completed').length || 0;
      setOpenRequests(open);
      
      // Get the building_id from the resident's apartment
      const { data: apartment } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', resident.apartment_number)
        .maybeSingle();
      
      if (apartment && apartment.building_id) {
        // Get announcements for this building
        const { data: announcementsData } = await supabase
          .from('announcements')
          .select('*')
          .eq('building_id', apartment.building_id)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        
        setAnnouncements(announcementsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Home', href: '/resident' },
    { icon: CreditCard, label: 'Payments', href: '/resident/payments' },
    { icon: Wrench, label: 'Maintenance', href: '/resident/maintenance' },
    { icon: Megaphone, label: 'News', href: '/resident/announcements' },
    { icon: User, label: 'Profile', href: '/resident/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!resident) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <>
        <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-blue-900 tracking-tight">SYNDIX</p>
                <p className="text-[8px] font-semibold text-orange-500 tracking-widest uppercase">Resident Portal</p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center">
                <span className="text-white font-bold text-base">{resident.full_name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{resident.full_name}</p>
                <p className="text-[10px] text-gray-400">Apt {resident.apartment_number}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/resident';
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </>

      {/* Main Content */}
      <div className="pb-24">
        {/* Header - Dark Blue */}
        <div className="bg-blue-800 px-5 pt-8 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-200 text-sm">{greeting}</p>
              <h1 className="text-white text-2xl font-bold mt-1">{resident.full_name?.split(' ')[0]} 👋</h1>
              <div className="flex items-center gap-2 mt-1">
                <Building2 size={12} className="text-blue-300" />
                <p className="text-blue-200 text-xs">Apt {resident.apartment_number} • {resident.building_name}</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Menu size={20} className="text-white" />
            </button>
          </div>

          {/* Stats Cards - White with blue borders */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <DollarSign size={18} className="text-orange-500" />
              <p className="text-gray-800 font-bold text-lg mt-2">{pendingPayment.toLocaleString()} MAD</p>
              <p className="text-gray-400 text-[10px]">Pending</p>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <CheckCircle size={18} className="text-green-500" />
              <p className="text-gray-800 font-bold text-lg mt-2">{totalPaid.toLocaleString()} MAD</p>
              <p className="text-gray-400 text-[10px]">Total Paid</p>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <Wrench size={18} className="text-orange-500" />
              <p className="text-gray-800 font-bold text-lg mt-2">{openRequests}</p>
              <p className="text-gray-400 text-[10px]">Open</p>
            </div>
          </div>
        </div>

        {/* White Content Area */}
        <div className="bg-white rounded-t-3xl min-h-screen px-5 pt-6">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-gray-800 font-semibold text-base mb-3">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-3">
              {menuItems.slice(1).map((item) => {
                const Icon = item.icon;
                const colors: Record<string, string> = {
                  'Payments': '#10b981',
                  'Maintenance': '#f59e0b', 
                  'News': '#8b5cf6',
                  'Profile': '#06b6d4'
                };
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className="py-3 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors[item.label]}15` }}>
                      <Icon size={18} color={colors[item.label]} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balance Card - Orange accent */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 mb-8 border border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-600 text-xs">Your Balance</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{pendingPayment.toLocaleString()} MAD</p>
                <p className="text-gray-500 text-[10px] mt-1">Due this month</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Zap size={18} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => router.push('/resident/payments')}
                className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                Pay Now
              </button>
              <button 
                onClick={() => router.push('/resident/payments')}
                className="flex-1 py-2 bg-white rounded-xl text-sm font-medium text-gray-600 active:scale-95 transition-transform"
              >
                View History
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-gray-800 font-semibold text-base">Recent Activity</h2>
              <button onClick={() => router.push('/resident/payments')} className="text-orange-500 text-xs flex items-center gap-1">
                See all <ArrowRight size={12} />
              </button>
            </div>
            
            {recentPayments.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.status === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>
                        {payment.status === 'paid' ? <CheckCircle size={16} className="text-green-600" /> : <Clock size={16} className="text-amber-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {new Date(payment.month).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">{payment.status === 'paid' ? 'Payment received' : 'Awaiting payment'}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">{payment.amount.toLocaleString()} MAD</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-gray-800 font-semibold text-base">Announcements</h2>
                <button onClick={() => router.push('/resident/announcements')} className="text-orange-500 text-xs flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className={`rounded-2xl p-4 mb-3 border ${
                  ann.priority === 'urgent' ? 'bg-red-50 border-red-200' :
                  ann.priority === 'important' ? 'bg-orange-50 border-orange-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      ann.priority === 'urgent' ? 'bg-red-100' :
                      ann.priority === 'important' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      <Megaphone size={14} className={
                        ann.priority === 'urgent' ? 'text-red-600' :
                        ann.priority === 'important' ? 'text-orange-600' :
                        'text-blue-600'
                      } />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800 text-sm">{ann.title}</p>
                        {ann.is_pinned && (
                          <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Pinned</span>
                        )}
                        {ann.priority === 'urgent' && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">Urgent</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mt-1">{ann.content}</p>
                      <p className="text-gray-400 text-[10px] mt-2">{new Date(ann.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar - White */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-2 shadow-lg">
        <div className="flex justify-around">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/resident';
            return (
              <button
                key={item.label}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${isActive ? 'text-orange-500' : 'text-gray-400'}`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}