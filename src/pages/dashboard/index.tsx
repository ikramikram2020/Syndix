import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { 
  Building2, Home, Users, CreditCard, QrCode, Wrench, Megaphone,
  LogOut, Menu, X, DollarSign, TrendingUp, Clock, AlertCircle,
  CheckCircle, Calendar, Download, Settings, Bell, PlusCircle,
  Activity, ArrowUpRight, ArrowDownRight, ChevronRight,
  UserPlus, ArrowRight, BarChart3, Percent, Landmark, Key,
  Zap, Shield, Smartphone, Globe, Coffee, Star, Award,
  Target, Eye, Heart, ThumbsUp, MessageCircle, FileText,
  PieChart, Grid, Layers, Sparkles, Rocket
} from 'lucide-react';

export default function SyndicDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [building, setBuilding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalApartments: 0,
    occupiedApartments: 0,
    totalResidents: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    pendingMaintenance: 0,
    collectionRate: 0,
    occupancyRate: 0,
    totalBuildings: 1,
    satisfactionRate: 94,
    responseTime: '2.4h',
    activeTickets: 0
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    checkUserAndBuilding();
  }, []);

  const checkUserAndBuilding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .maybeSingle();

      if (!buildingData) {
        router.push('/dashboard/setup');
        return;
      }
      
      setBuilding(buildingData);
      await fetchStats(buildingData.id);
      await fetchRecentData(buildingData.id);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      router.push('/dashboard/setup');
    }
  };

  const fetchStats = async (buildingId: string) => {
    const { count: totalApartments } = await supabase
      .from('apartments')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId);

    const { count: occupiedApartments } = await supabase
      .from('apartments')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId)
      .not('resident_id', 'is', null);

    const { count: totalResidents } = await supabase
      .from('residents')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId);

    const { count: pendingMaintenance } = await supabase
      .from('maintenance_requests')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId)
      .in('status', ['pending', 'in_progress']);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: monthPayments } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('building_id', buildingId)
      .like('month', `${currentMonth}%`);

    const monthlyRevenue = monthPayments?.reduce((sum: number, p: any) => 
      p.status === 'paid' ? sum + p.amount : sum, 0) || 0;
    
    const pendingPayments = monthPayments?.reduce((sum: number, p: any) => 
      p.status === 'pending' ? sum + p.amount : sum, 0) || 0;

    const collectionRate = monthlyRevenue + pendingPayments > 0 
      ? (monthlyRevenue / (monthlyRevenue + pendingPayments)) * 100 : 0;
    
    const occupancyRate = totalApartments && totalApartments > 0
      ? ((occupiedApartments || 0) / totalApartments) * 100 : 0;

    setStats({
      totalApartments: totalApartments || 0,
      occupiedApartments: occupiedApartments || 0,
      totalResidents: totalResidents || 0,
      monthlyRevenue: monthlyRevenue || 0,
      pendingPayments: pendingPayments || 0,
      pendingMaintenance: pendingMaintenance || 0,
      collectionRate: collectionRate || 0,
      occupancyRate: occupancyRate || 0,
      totalBuildings: 1,
      satisfactionRate: 94,
      responseTime: '2.4h',
      activeTickets: pendingMaintenance || 0
    });
  };

  const fetchRecentData = async (buildingId: string) => {
    const { data: payments } = await supabase
      .from('payments')
      .select('*, residents(full_name, apartment_number)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(4);
    setRecentPayments(payments || []);

    const { data: requests } = await supabase
      .from('maintenance_requests')
      .select('*, residents(full_name, apartment_number)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(3);
    setRecentRequests(requests || []);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!building) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="ltr">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-950 shadow-2xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-blue-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-white tracking-tight">SYNDIX</p>
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">Property Platform</p>
              </div>
            </div>
          </div>

          {/* Building Card */}
          <div className="mx-3 mt-4 p-3 rounded-xl bg-blue-800/30 border border-blue-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 size={12} className="text-blue-300" />
              <p className="text-[10px] font-medium text-blue-300 uppercase tracking-wider">Current Building</p>
            </div>
            <p className="font-bold text-white text-sm">{building.name}</p>
            <p className="text-[10px] text-blue-300 mt-1">{building.city || 'City not set'}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Grid, href: '/dashboard' },
              { id: 'residents', label: 'Residents', icon: Users, href: '/dashboard/residents' },
              { id: 'payments', label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/dashboard/maintenance' },
              { id: 'announcements', label: 'Announcements', icon: Megaphone, href: '/dashboard/announcements' },
              { id: 'qr-codes', label: 'QR Codes', icon: QrCode, href: '/dashboard/qr-codes' },
              { id: 'reports', label: 'Reports', icon: FileText, href: '/dashboard/reports' },
              { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
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

          {/* Logout */}
          <div className="p-3 border-t border-blue-800/50">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all">
              <LogOut size={16} />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>
                <p className="text-xs text-slate-500">Welcome back, {building.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell size={18} className="text-slate-600" />
                {notifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {building.name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Welcome Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs mb-1">Welcome back</p>
                <h2 className="text-lg font-bold">Manage your property efficiently</h2>
                <p className="text-blue-100 text-xs mt-1">You have {stats.pendingMaintenance} pending tasks</p>
              </div>
              <div className="hidden sm:block">
                <Rocket size={40} className="text-white/20" />
              </div>
            </div>
          </div>

          {/* Stats Row 1 - Main Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Building2 size={16} className="text-blue-600" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">Properties</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{stats.totalBuildings}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Total buildings</p>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp size={10} className="text-green-500" />
                <span className="text-[9px] text-green-600">+0% this month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Home size={16} className="text-green-600" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">Units</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{stats.totalApartments}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{stats.occupiedApartments} occupied</p>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Users size={16} className="text-amber-600" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">Residents</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{stats.totalResidents}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Active residents</p>
              <div className="mt-2 flex items-center gap-1">
                <UserPlus size={10} className="text-amber-500" />
                <span className="text-[9px] text-amber-600">+2 this month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-orange-600" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">Revenue</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{stats.monthlyRevenue.toLocaleString()} MAD</p>
              <p className="text-[10px] text-slate-500 mt-0.5">This month</p>
              <div className="mt-2 flex items-center gap-1">
                <ArrowUpRight size={10} className="text-green-500" />
                <span className="text-[9px] text-green-600">+12% vs last month</span>
              </div>
            </div>
          </div>

          {/* Stats Row 2 - Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <Percent size={14} className="text-blue-600" />
                <span className="text-[9px] font-medium text-blue-600">Rate</span>
              </div>
              <p className="text-lg font-bold text-blue-700">{stats.occupancyRate.toFixed(0)}%</p>
              <p className="text-[9px] text-slate-500">Occupancy rate</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 shadow-sm border border-green-100">
              <div className="flex items-center justify-between mb-1">
                <Target size={14} className="text-green-600" />
                <span className="text-[9px] font-medium text-green-600">Rate</span>
              </div>
              <p className="text-lg font-bold text-green-700">{stats.collectionRate.toFixed(0)}%</p>
              <p className="text-[9px] text-slate-500">Collection rate</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-3 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-1">
                <Clock size={14} className="text-amber-600" />
                <span className="text-[9px] font-medium text-amber-600">Avg. Response</span>
              </div>
              <p className="text-lg font-bold text-amber-700">{stats.responseTime}</p>
              <p className="text-[9px] text-slate-500">Response time</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 shadow-sm border border-purple-100">
              <div className="flex items-center justify-between mb-1">
                <Star size={14} className="text-purple-600" />
                <span className="text-[9px] font-medium text-purple-600">Satisfaction</span>
              </div>
              <p className="text-lg font-bold text-purple-700">{stats.satisfactionRate}%</p>
              <p className="text-[9px] text-slate-500">Resident satisfaction</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Payments Section - Left 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Monthly Payments</h2>
                    <p className="text-[10px] text-slate-400">Overview of your building's finances</p>
                  </div>
                  <button className="text-orange-500 text-xs font-medium hover:underline">View report →</button>
                </div>
                
                <div className="p-4">
                  {/* Payment Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-500">This month</p>
                      <p className="text-base font-bold text-slate-800">{stats.monthlyRevenue.toLocaleString()} MAD</p>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-500">Last month</p>
                      <p className="text-base font-bold text-slate-800">- MAD</p>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-500">Average</p>
                      <p className="text-base font-bold text-slate-800">{stats.monthlyRevenue.toLocaleString()} MAD</p>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-2 mb-4 border-b border-slate-100">
                    {['All', 'Villas', 'Apartments'].map((tab, i) => (
                      <button key={i} className={`px-3 py-1.5 text-xs font-medium transition-all ${
                        i === 0 ? 'text-orange-600 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-700'
                      }`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Payment Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-slate-600">Monthly Fees</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{stats.monthlyRevenue.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-600">Pending</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-600">{stats.pendingPayments.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-slate-100 mt-1">
                      <span className="text-xs font-semibold text-slate-700">Total</span>
                      <span className="text-sm font-bold text-slate-800">{(stats.monthlyRevenue + stats.pendingPayments).toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Payments Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-5">
                <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Recent Transactions</h2>
                    <p className="text-[10px] text-slate-400">Latest payment activities</p>
                  </div>
                  <button onClick={() => router.push('/dashboard/payments')} className="text-orange-500 text-xs font-medium hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-[10px] font-medium text-slate-500 uppercase">Resident</th>
                        <th className="px-4 py-2 text-[10px] font-medium text-slate-500 uppercase">Apartment</th>
                        <th className="px-4 py-2 text-[10px] font-medium text-slate-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-[10px] font-medium text-slate-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentPayments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400 text-xs">No payments recorded yet</td>
                        </tr>
                      ) : (
                        recentPayments.map((payment: any) => (
                          <tr key={payment.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-xs font-medium text-slate-700">{payment.residents?.full_name || 'Unknown'}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-500">Apt {payment.residents?.apartment_number || '?'}</td>
                            <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{payment.amount?.toLocaleString() || 0} MAD</td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                                payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {payment.status === 'paid' ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Quick Actions & Activity */}
            <div>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-800">Quick Actions</h2>
                  <p className="text-[10px] text-slate-400">Common tasks</p>
                </div>
                <div className="p-3 space-y-1.5">
                  <button onClick={() => router.push('/dashboard/residents')} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition group">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
                      <UserPlus size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-slate-700">Add New Resident</p>
                      <p className="text-[9px] text-slate-400">Register a tenant</p>
                    </div>
                    <ArrowRight size={12} className="text-slate-300" />
                  </button>

                  <button onClick={() => router.push('/dashboard/payments')} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition group">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100">
                      <CreditCard size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-slate-700">Record Payment</p>
                      <p className="text-[9px] text-slate-400">Track monthly fees</p>
                    </div>
                    <ArrowRight size={12} className="text-slate-300" />
                  </button>

                  <button onClick={() => router.push('/dashboard/maintenance')} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition group">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100">
                      <Wrench size={14} className="text-orange-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-slate-700">Maintenance Request</p>
                      <p className="text-[9px] text-slate-400">Create a ticket</p>
                    </div>
                    <ArrowRight size={12} className="text-slate-300" />
                  </button>

                  <button onClick={() => router.push('/dashboard/announcements')} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition group">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100">
                      <Megaphone size={14} className="text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-slate-700">Send Announcement</p>
                      <p className="text-[9px] text-slate-400">Notify residents</p>
                    </div>
                    <ArrowRight size={12} className="text-slate-300" />
                  </button>

                  <button onClick={() => router.push('/dashboard/qr-codes')} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition group">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100">
                      <QrCode size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-slate-700">Generate QR Code</p>
                      <p className="text-[9px] text-slate-400">For resident access</p>
                    </div>
                    <ArrowRight size={12} className="text-slate-300" />
                  </button>
                </div>
              </div>

              {/* Recent Maintenance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-5">
                <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Maintenance</h2>
                    <p className="text-[10px] text-slate-400">Recent requests</p>
                  </div>
                  <button onClick={() => router.push('/dashboard/maintenance')} className="text-orange-500 text-xs font-medium hover:underline">View all</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {recentRequests.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">No maintenance requests</div>
                  ) : (
                    recentRequests.map((req: any) => (
                      <div key={req.id} className="p-3 hover:bg-slate-50 transition">
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            req.priority === 'emergency' ? 'bg-red-100' :
                            req.priority === 'high' ? 'bg-orange-100' : 'bg-amber-100'
                          }`}>
                            <AlertCircle size={12} className={
                              req.priority === 'emergency' ? 'text-red-600' :
                              req.priority === 'high' ? 'text-orange-600' : 'text-amber-600'
                            } />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-700">{req.title}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Apt {req.residents?.apartment_number}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                                req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {req.status}
                              </span>
                              <span className="text-[8px] text-slate-400 capitalize">{req.priority}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Zap size={12} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-orange-800">Pro Tip</p>
                    <p className="text-[9px] text-orange-600 mt-0.5">Generate QR codes for your residents to give them easy access to their portal.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}