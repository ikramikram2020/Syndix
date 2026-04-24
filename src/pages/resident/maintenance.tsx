import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Wrench, Plus, AlertCircle, CheckCircle, Clock,
  Flame, Shield, Zap, ArrowLeft, X, Send,
  Sparkles, Calendar, MessageSquare, Eye
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

interface RequestNote {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

export default function ResidentMaintenance() {
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [notes, setNotes] = useState<RequestNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<MaintenanceRequest | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [buildingName, setBuildingName] = useState('');
  const [newNote, setNewNote] = useState('');
  const [sending, setSending] = useState(false);

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
      fetchRequests(resident.id);
      fetchBuildingName(resident.apartment_number);
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  const fetchBuildingName = async (apartmentNumber: string) => {
    try {
      const { data: apartment } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', apartmentNumber)
        .maybeSingle();
      
      if (apartment?.building_id) {
        const { data: building } = await supabase
          .from('buildings')
          .select('name')
          .eq('id', apartment.building_id)
          .maybeSingle();
        
        if (building) {
          setBuildingName(building.name);
        }
      }
    } catch (err) {
      console.error('Error fetching building:', err);
    }
  };

  const fetchRequests = async (residentId: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('resident_id', residentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (requestId: string) => {
    const { data } = await supabase
      .from('maintenance_notes')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    
    setNotes(data || []);
  };

  const submitRequest = async () => {
    if (!formData.title) {
      alert('Please enter a title');
      return;
    }

    setSubmitting(true);
    
    try {
      // Get building_id from the resident's apartment
      const { data: apartment } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', resident.apartment_number)
        .maybeSingle();

      if (!apartment?.building_id) {
        throw new Error('Building not found for this apartment');
      }

      // Insert maintenance request
      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert([{
          resident_id: resident.id,
          building_id: apartment.building_id,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      setShowForm(false);
      setFormData({ title: '', description: '', priority: 'medium' });
      await fetchRequests(resident.id);
      alert('✅ Maintenance request submitted!');
      
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = async () => {
    if (!newNote.trim() || !showDetails) return;
    
    setSending(true);
    const { error } = await supabase
      .from('maintenance_notes')
      .insert([{
        request_id: showDetails.id,
        message: newNote,
        sender_type: 'resident',
        created_at: new Date().toISOString()
      }]);

    if (error) {
      alert('Error sending message: ' + error.message);
    } else {
      setNewNote('');
      await fetchNotes(showDetails.id);
    }
    setSending(false);
  };

  const openDetails = async (request: MaintenanceRequest) => {
    setShowDetails(request);
    await fetchNotes(request.id);
  };

  const closeDetails = () => {
    setShowDetails(null);
    setNotes([]);
    setNewNote('');
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'emergency': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#EAB308';
      default: return '#3B82F6';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch(priority) {
      case 'emergency': return '#FEE2E2';
      case 'high': return '#FFEDD5';
      case 'medium': return '#FEF9C3';
      default: return '#E0F2FE';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#059669';
      case 'in_progress': return '#2563EB';
      default: return '#D97706';
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'completed': return '#D1FAE5';
      case 'in_progress': return '#DBEAFE';
      default: return '#FEF3C7';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!resident) return null;

  return (
    <div style={{ minHeight: '100vh', background: T.canvasBg, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        padding: '24px 20px 40px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={20} color="#fff" />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff' }}>Service Requests</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{buildingName || 'Your Building'}</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} style={{ width: 44, height: 44, borderRadius: 22, background: T.orange, border: 'none', cursor: 'pointer' }}>
            <Plus size={20} color="#fff" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px', marginTop: -30 }}>
        <div style={{ background: T.white, borderRadius: 20, padding: 16, display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.navy }}>{stats.total}</p>
            <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Total</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.orange }}>{stats.pending}</p>
            <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Pending</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.green }}>{stats.completed}</p>
            <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Completed</p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div style={{ padding: '20px' }}>
        {requests.length === 0 ? (
          <div style={{ background: T.white, borderRadius: 24, padding: '48px 20px', textAlign: 'center' }}>
            <Wrench size={48} color={T.textSm} />
            <h3>No Requests Yet</h3>
            <button onClick={() => setShowForm(true)} style={{ marginTop: 16, padding: '10px 24px', background: T.orange, border: 'none', borderRadius: 30, color: '#fff', cursor: 'pointer' }}>Create Request</button>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} onClick={() => openDetails(req)} style={{ background: T.white, borderRadius: 20, padding: 16, marginBottom: 12, borderLeft: `4px solid ${getPriorityColor(req.priority)}`, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: getPriorityBg(req.priority), color: getPriorityColor(req.priority) }}>{req.priority}</span>
                <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: getStatusBg(req.status), color: getStatusColor(req.status) }}>{getStatusLabel(req.status)}</span>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{req.title}</h3>
              <p style={{ fontSize: 13, color: T.textMd }}>{req.description?.substring(0, 100)}...</p>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={12} color={T.textSm} />
                <span style={{ fontSize: 11, color: T.textSm }}>{new Date(req.created_at).toLocaleDateString()}</span>
                <Eye size={12} color={T.teal} style={{ marginLeft: 'auto' }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', width: '100%', borderRadius: '28px 28px 0 0', padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3>New Request</h3>
            <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: 12, margin: '12px 0', border: `1px solid ${T.border}`, borderRadius: 12 }} />
            <textarea placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: 12, margin: '12px 0', border: `1px solid ${T.border}`, borderRadius: 12 }} />
            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%', padding: 12, margin: '12px 0', border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
            <button onClick={submitRequest} disabled={submitting} style={{ width: '100%', padding: 14, background: T.orange, border: 'none', borderRadius: 14, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{submitting ? 'Submitting...' : 'Submit'}</button>
            <button onClick={() => setShowForm(false)} style={{ width: '100%', marginTop: 12, padding: 12, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }} onClick={closeDetails}>
          <div style={{ background: 'white', width: '100%', borderRadius: '28px 28px 0 0', padding: 24, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>{showDetails.title}</h3>
              <button onClick={closeDetails} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ background: T.surface, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <p><strong>Status:</strong> <span style={{ color: getStatusColor(showDetails.status) }}>{getStatusLabel(showDetails.status)}</span></p>
              <p><strong>Priority:</strong> <span style={{ color: getPriorityColor(showDetails.priority) }}>{showDetails.priority}</span></p>
              <p><strong>Submitted:</strong> {new Date(showDetails.created_at).toLocaleString()}</p>
              <p><strong>Description:</strong></p>
              <p>{showDetails.description}</p>
            </div>
            
            {notes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Messages:</strong>
                {notes.map(note => (
                  <div key={note.id} style={{ background: note.sender_type === 'resident' ? T.surface : T.tealLight, borderRadius: 8, padding: 8, marginTop: 8 }}>
                    <small><strong>{note.sender_type === 'resident' ? 'You' : 'Syndic'}</strong> - {new Date(note.created_at).toLocaleString()}</small>
                    <p style={{ margin: 0 }}>{note.message}</p>
                  </div>
                ))}
              </div>
            )}
            
            <textarea rows={2} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Type a message..." style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 8 }} />
            <button onClick={sendMessage} disabled={!newNote.trim() || sending} style={{ width: '100%', padding: 10, background: T.orange, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Send Message</button>
          </div>
        </div>
      )}
    </div>
  );
}