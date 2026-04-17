import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { 
  Megaphone, Plus, Pin, Bell, Trash2, Send, 
  AlertCircle, CheckCircle, Clock, Star, Eye,
  Home, Users, Building2, Wrench, CreditCard, QrCode,
  LogOut, Menu, X, ChevronRight, Sparkles
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

interface Building {
  id: string;
  name: string;
  city: string;
}

export default function Announcements() {
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    is_pinned: false
  });

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
        await fetchAnnouncements(buildingData.id);
      }
    }
    setLoading(false);
  };

  const fetchAnnouncements = async (buildingId: string) => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('building_id', buildingId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
  };

  const createAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('announcements').insert([{
      building_id: building?.id,
      created_by: user?.id,
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      is_pinned: formData.is_pinned
    }]);
    
    if (error) {
      alert('Error creating announcement: ' + error.message);
    } else {
      setShowModal(false);
      setFormData({ title: '', content: '', priority: 'normal', is_pinned: false });
      if (building) {
        await fetchAnnouncements(building.id);
      }
      alert('Announcement posted successfully!');
    }
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('announcements')
      .update({ is_pinned: !currentStatus })
      .eq('id', id);
    if (building) {
      await fetchAnnouncements(building.id);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await supabase.from('announcements').delete().eq('id', id);
      if (building) {
        await fetchAnnouncements(building.id);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'urgent': return <AlertCircle size={14} className="text-red-500" />;
      case 'important': return <Star size={14} className="text-orange-500" />;
      default: return <Bell size={14} className="text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
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
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">Announcements</p>
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
              const isActive = item.id === 'announcements';
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
            <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
            <p className="text-sm text-slate-500 mt-1">Keep residents informed with important updates</p>
          </div>

          {/* Action Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition shadow-sm"
            >
              <Plus size={18} />
              New Announcement
            </button>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-100">
                <Megaphone size={48} className="mx-auto mb-3 text-slate-300" />
                <p>No announcements yet. Click "New Announcement" to create one.</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition ${
                  ann.is_pinned ? 'border-blue-300 bg-gradient-to-r from-white to-blue-50/30' : 'border-slate-100'
                }`}>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {ann.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ann.priority)}`}>
                          {getPriorityIcon(ann.priority)}
                          {ann.priority}
                        </div>
                        <h3 className="font-semibold text-slate-800">{ann.title}</h3>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => togglePin(ann.id, ann.is_pinned)} 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title={ann.is_pinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin size={14} />
                        </button>
                        <button 
                          onClick={() => deleteAnnouncement(ann.id)} 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">{ann.content}</p>
                    
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ann.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          Sent to all residents
                        </span>
                      </div>
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition">
                        <Send size={12} /> Send to WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">New Announcement</h2>
                <p className="text-xs text-slate-500 mt-1">This will be sent to all residents</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Water Maintenance Notice"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your announcement here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal - Regular information</option>
                  <option value="important">Important - Needs attention</option>
                  <option value="urgent">Urgent - Immediate action required</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Pin this announcement (shows at top)</span>
              </label>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={createAnnouncement} className="flex-1 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">Post Announcement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}