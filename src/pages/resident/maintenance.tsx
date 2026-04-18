import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useResidentAuth } from '../../hooks/useResidentAuth';
import { 
  Wrench, Plus, AlertCircle, CheckCircle, Clock,
  Flame, Shield, Zap, ArrowLeft, X, Send
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export default function ResidentMaintenance() {
  const router = useRouter();
  const { resident, loading: authLoading } = useResidentAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && resident?.id) {
      fetchRequests();
    }
  }, [authLoading, resident]);

  const fetchRequests = async () => {
    if (!resident?.id) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('resident_id', resident.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const submitRequest = async () => {
    if (!formData.title) {
      alert('Please enter a title');
      return;
    }

    setSubmitting(true);
    
    // Get apartment building_id
    const { data: apartment } = await supabase
      .from('apartments')
      .select('building_id')
      .eq('apartment_number', resident?.apartment_number)
      .single();

    const { error } = await supabase
      .from('maintenance_requests')
      .insert([{
        resident_id: resident?.id,
        building_id: apartment?.building_id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'pending'
      }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setShowForm(false);
      setFormData({ title: '', description: '', priority: 'medium' });
      await fetchRequests();
      alert('✅ Maintenance request submitted successfully!');
    }
    setSubmitting(false);
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
      case 'emergency': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed' };
      case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Zap, label: 'In Progress' };
      default: return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' };
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!resident) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-800 px-5 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-bold">Maintenance</h1>
              <p className="text-blue-200 text-sm">Track your requests</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-5 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-xs">Total</p>
              <p className="text-gray-800 font-bold text-xl">{stats.total}</p>
            </div>
            <div>
              <p className="text-amber-500 text-xs">Pending</p>
              <p className="text-amber-600 font-bold text-xl">{stats.pending}</p>
            </div>
            <div>
              <p className="text-green-500 text-xs">Completed</p>
              <p className="text-green-600 font-bold text-xl">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="px-5 mt-5 space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <Wrench size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No maintenance requests yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm"
            >
              Create First Request
            </button>
          </div>
        ) : (
          requests.map((req) => {
            const status = getStatusBadge(req.status);
            const StatusIcon = status.icon;
            return (
              <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${getPriorityColor(req.priority)}`}>
                      {getPriorityIcon(req.priority)}
                    </div>
                    <p className="font-semibold text-gray-800">{req.title}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon size={12} className={status.text} />
                    <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-2">{req.description}</p>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                  {req.status === 'pending' && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs">
                      <Clock size={12} /> Awaiting response
                    </div>
                  )}
                  {req.status === 'in_progress' && (
                    <div className="flex items-center gap-1 text-blue-600 text-xs">
                      <Zap size={12} /> Being handled
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Request Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">New Request</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Broken AC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe the issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  <option value="low">Low - Can wait</option>
                  <option value="medium">Medium - Needs attention</option>
                  <option value="high">High - Urgent</option>
                  <option value="emergency">Emergency - Immediate!</option>
                </select>
              </div>
            </div>
            <button
              onClick={submitRequest}
              disabled={submitting}
              className="w-full mt-6 py-3 bg-orange-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}