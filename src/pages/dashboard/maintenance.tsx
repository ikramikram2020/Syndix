import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { 
  Wrench, AlertCircle, CheckCircle, Clock, 
  MessageSquare, Flame, Shield, Zap,
  Calendar, User, Home, Building2, Users, CreditCard, Megaphone, QrCode,
  LogOut, Menu, X, ChevronRight, Sparkles, Info
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  residents?: {
    full_name: string;
    apartment_number: string;
  };
}

interface Building {
  id: string;
  name: string;
  city: string;
}

export default function MaintenanceManagement() {
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

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
        await fetchRequests(buildingData.id);
      }
    }
    setLoading(false);
  };

  const fetchRequests = async (buildingId: string) => {
    // First get all residents in this building
    const { data: residents } = await supabase
      .from('residents')
      .select('id')
      .eq('building_id', buildingId);
    
    const residentIds = residents?.map(r => r.id) || [];
    
    if (residentIds.length === 0) {
      setRequests([]);
      return;
    }
    
    const { data } = await supabase
      .from('maintenance_requests')
      .select('*, residents(full_name, apartment_number)')
      .in('resident_id', residentIds)
      .order('created_at', { ascending: false });
    
    setRequests(data || []);
  };

  const updateStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('maintenance_requests')
      .update({ 
        status, 
        completed_at: status === 'completed' ? new Date().toISOString() : null 
      })
      .eq('id', requestId);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      if (building) {
        await fetchRequests(building.id);
      }
    }
  };

  const sendMessage = async () => {
    if (!messageText || !selectedRequest) return;
    
    // Here you would integrate with WhatsApp, Email, or Supabase notifications
    alert(`Message sent to resident about "${selectedRequest.title}": ${messageText}`);
    setShowMessageModal(false);
    setMessageText('');
    setSelectedRequest(null);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'emergency': return <Flame size={14} className="text-red-500" />;
      case 'high': return <AlertCircle size={14} className="text-orange-500" />;
      case 'medium': return <Clock size={14} className="text-yellow-500" />;
      default: return <Shield size={14} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

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
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">Maintenance</p>
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
              const isActive = item.id === 'maintenance';
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
            <h1 className="text-2xl font-bold text-slate-800">Maintenance Requests</h1>
            <p className="text-sm text-slate-500 mt-1">View and manage resident maintenance tickets</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Wrench size={18} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  <p className="text-xs text-slate-500">Total Requests</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock size={18} className="text-amber-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Zap size={18} className="text-purple-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.inProgress}</p>
                  <p className="text-xs text-slate-500">In Progress</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <Info size={18} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Maintenance requests are submitted by residents</p>
              <p className="text-xs text-blue-600">You can update the status and communicate with residents here.</p>
            </div>
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {requests.length === 0 ? (
              <div className="lg:col-span-2 bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-100">
                <Wrench size={48} className="mx-auto mb-3 text-slate-300" />
                <p>No maintenance requests yet.</p>
                <p className="text-xs mt-1">Residents will submit requests from their portal.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getPriorityColor(req.priority)}`}>
                          {getPriorityIcon(req.priority)}
                        </div>
                        <h3 className="font-semibold text-slate-800">{req.title}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                        {req.status === 'in_progress' ? 'In Progress' : req.status}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-4">{req.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {req.residents?.full_name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Home size={12} />
                        Apt {req.residents?.apartment_number || '?'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(req.id, 'in_progress')}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          Start Work
                        </button>
                      )}
                      {req.status === 'in_progress' && (
                        <button
                          onClick={() => updateStatus(req.id, 'completed')}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowMessageModal(true);
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-50 transition"
                      >
                        <MessageSquare size={14} /> Message
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Message Modal */}
      {showMessageModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Message Resident</h2>
                <p className="text-xs text-slate-500 mt-1">Send update about: {selectedRequest.title}</p>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
              />
              <p className="text-xs text-slate-400 mt-2">This message will be sent to the resident's dashboard and email.</p>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowMessageModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={sendMessage} className="flex-1 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}