import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Wrench, Plus, AlertCircle, CheckCircle, Clock,
  Flame, Shield, Zap, ArrowLeft, X, Send,
  Sparkles, Calendar, MessageSquare, Eye, Home, User
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  syndic_note?: string | null;
  assigned_to?: string | null;
}

interface RequestNote {
  id: string;
  request_id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

export default function ResidentMaintenance() {
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [notes, setNotes] = useState<Record<string, RequestNote[]>>({});
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
      fetchBuildingName(resident.apartment_number, resident.id);
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  const fetchBuildingName = async (apartmentNumber: string, residentId: string) => {
    try {
      // First get the apartment to find building_id
      const { data: apartment, error: aptError } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', apartmentNumber)
        .single();
      
      if (aptError) throw aptError;
      
      if (apartment?.building_id) {
        const { data: building, error: buildingError } = await supabase
          .from('buildings')
          .select('name')
          .eq('id', apartment.building_id)
          .single();
        
        if (!buildingError && building) {
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
      
      // Fetch notes for each request
      if (data && data.length > 0) {
        await fetchNotesForRequests(data.map(r => r.id));
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotesForRequests = async (requestIds: string[]) => {
    const { data, error } = await supabase
      .from('maintenance_notes')
      .select('*')
      .in('request_id', requestIds)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      const notesMap: Record<string, RequestNote[]> = {};
      data.forEach(note => {
        if (!notesMap[note.request_id]) {
          notesMap[note.request_id] = [];
        }
        notesMap[note.request_id].push(note);
      });
      setNotes(notesMap);
    }
  };

  const submitRequest = async () => {
  if (!formData.title) {
    alert('Please enter a title');
    return;
  }

  if (!resident?.apartment_number) {
    alert('Resident apartment information not found');
    return;
  }

  setSubmitting(true);
  
  try {
    // Get building_id from the resident's apartment
    const { data: apartment, error: aptError } = await supabase
      .from('apartments')
      .select('building_id')
      .eq('apartment_number', resident.apartment_number)
      .maybeSingle();  // Changed from .single() to .maybeSingle()

    if (aptError) {
      console.error('Apartment error:', aptError);
      throw new Error('Could not find apartment information');
    }

    if (!apartment?.building_id) {
      throw new Error('Building not found for this apartment');
    }

    // Insert maintenance request with building_id
    const { data: newRequest, error: insertError } = await supabase
      .from('maintenance_requests')
      .insert([{
        resident_id: resident.id,
        building_id: apartment.building_id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select();

    if (insertError) throw insertError;

    // Get syndic_id from building
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('syndic_id, name')
      .eq('id', apartment.building_id)
      .maybeSingle();

    if (!buildingError && building?.syndic_id) {
      // Create notification for syndic
      await supabase
        .from('notifications')
        .insert([{
          user_id: building.syndic_id,
          title: '🔧 New Maintenance Request',
          message: `${resident.full_name || 'Resident'} from ${building.name} submitted a ${formData.priority} priority request: ${formData.title}`,
          type: 'maintenance',
          read: false,
          created_at: new Date().toISOString(),
          data: JSON.stringify({
            request_id: newRequest?.[0]?.id,
            title: formData.title,
            priority: formData.priority
          })
        }]);
    }

    setShowForm(false);
    setFormData({ title: '', description: '', priority: 'medium' });
    await fetchRequests(resident.id);
    alert('✅ Maintenance request submitted! The syndic has been notified.');
    
  } catch (err) {
    console.error('Error:', err);
    alert('Error: ' + (err as Error).message);
  } finally {
    setSubmitting(false);
  }
};

  const sendMessage = async () => {
    if (!newNote.trim() || !showDetails || !resident) return;
    
    const { error } = await supabase
      .from('maintenance_notes')
      .insert([{
        request_id: showDetails.id,
        message: newNote,
        sender_type: 'resident',
        sender_id: resident.id
      }]);

    if (error) {
      alert('Error sending message: ' + error.message);
    } else {
      setNewNote('');
      await fetchNotesForRequests([showDetails.id]);
      
      // Refresh notes for the current request
      const updatedNotes = await supabase
        .from('maintenance_notes')
        .select('*')
        .eq('request_id', showDetails.id)
        .order('created_at', { ascending: true });
      
      if (updatedNotes.data) {
        setNotes(prev => ({
          ...prev,
          [showDetails.id]: updatedNotes.data as RequestNote[]
        }));
      }
      
      // Notify syndic about new message
      const { data: apartment } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', resident.apartment_number)
        .single();
      
      if (apartment?.building_id) {
        const { data: building } = await supabase
          .from('buildings')
          .select('syndic_id')
          .eq('id', apartment.building_id)
          .single();
        
        if (building?.syndic_id) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: building.syndic_id,
              title: '💬 New Message on Maintenance Request',
              message: `${resident.full_name} added a comment on request: ${showDetails.title}`,
              type: 'maintenance',
              read: false,
              created_at: new Date().toISOString()
            }]);
        }
      }
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'emergency': return <Flame size={14} color="#EF4444" />;
      case 'high': return <AlertCircle size={14} color="#F97316" />;
      case 'medium': return <Clock size={14} color="#EAB308" />;
      default: return <Shield size={14} color="#3B82F6" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'emergency': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'high': return { bg: '#FFEDD5', text: '#EA580C' };
      case 'medium': return { bg: '#FEF9C3', text: '#CA8A04' };
      default: return { bg: '#E0F2FE', text: '#0284C7' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': 
        return { bg: '#D1FAE5', text: '#059669', icon: CheckCircle, label: 'Completed' };
      case 'in_progress': 
        return { bg: '#DBEAFE', text: '#2563EB', icon: Zap, label: 'In Progress' };
      default: 
        return { bg: '#FEF3C7', text: '#D97706', icon: Clock, label: 'Pending' };
    }
  };

  const getStatusMessage = (status: string) => {
    switch(status) {
      case 'pending':
        return 'Your request has been submitted and is waiting for review.';
      case 'in_progress':
        return 'A technician has been assigned to your request. The syndic is working on it.';
      case 'completed':
        return 'Your request has been completed. Thank you for your patience.';
      default:
        return '';
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
      <div style={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.orange}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#fff' }}>Loading your requests...</p>
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
      paddingBottom: 40
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.5s ease both;
        }
        .slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(5,15,36,0.1);
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        padding: '24px 20px 40px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Sparkles size={14} color={T.orange} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>MAINTENANCE</span>
                </div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Service Requests</h1>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{buildingName || 'Your Building'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: T.orange,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245,166,35,0.3)'
              }}
            >
              <Plus size={20} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ padding: '0 20px', marginTop: -30 }}>
        <div className="fade-in-up" style={{
          background: T.white,
          borderRadius: 20,
          padding: '16px 20px',
          boxShadow: '0 4px 12px rgba(5,15,36,0.08)',
          border: `1px solid ${T.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: T.textSm }}>Total</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: T.navy }}>{stats.total}</p>
          </div>
          <div style={{ width: 1, height: 40, background: T.border }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: T.orange }}>Pending</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: T.orange }}>{stats.pending}</p>
          </div>
          <div style={{ width: 1, height: 40, background: T.border }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: T.green }}>Completed</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: T.green }}>{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div style={{ padding: '20px' }}>
        {requests.length === 0 ? (
          <div className="fade-in-up" style={{
            background: T.white,
            borderRadius: 24,
            padding: '48px 20px',
            textAlign: 'center',
            border: `1px solid ${T.border}`
          }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Wrench size={32} color={T.textSm} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>No Requests Yet</h3>
            <p style={{ margin: '8px 0 16px', fontSize: 13, color: T.textSm }}>Submit your first maintenance request</p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 24px',
                background: T.orange,
                border: 'none',
                borderRadius: 30,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Create Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {requests.map((req, index) => {
              const status = getStatusBadge(req.status);
              const StatusIcon = status.icon;
              const priorityStyle = getPriorityStyle(req.priority);
              const isPending = req.status === 'pending';
              
              return (
                <div 
                  key={req.id} 
                  className="card-hover fade-in-up"
                  style={{
                    background: T.white,
                    borderRadius: 20,
                    padding: '16px',
                    border: `1px solid ${T.border}`,
                    borderLeft: isPending ? `4px solid ${T.orange}` : `1px solid ${T.border}`,
                    transitionDelay: `${index * 0.05}s`,
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowDetails(req)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: 10,
                        background: priorityStyle.bg,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        {getPriorityIcon(req.priority)}
                        <span style={{ fontSize: 11, fontWeight: 600, color: priorityStyle.text, textTransform: 'capitalize' }}>
                          {req.priority}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
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
                    <span style={{ fontSize: 10, color: T.textSm }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: T.navy }}>{req.title}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: T.textMd, lineHeight: 1.5 }}>
                    {req.description.length > 100 ? req.description.substring(0, 100) + '...' : req.description}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: `1px solid ${T.border}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={12} color={T.textSm} />
                      <span style={{ fontSize: 11, color: T.textSm }}>
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={12} color={T.teal} />
                      <span style={{ fontSize: 11, color: T.teal }}>View details</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetails && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,15,36,0.5)',
              zIndex: 90,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowDetails(null)}
          />
          <div className="slide-up" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: T.white,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            zIndex: 100,
            padding: 24,
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>{showDetails.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>
                  Request ID: {showDetails.id.slice(0, 8)}
                </p>
              </div>
              <button 
                onClick={() => setShowDetails(null)}
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

            {/* Status Message */}
            <div style={{
              background: T.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {getStatusBadge(showDetails.status).icon({ size: 16, color: getStatusBadge(showDetails.status).text })}
                <span style={{ fontWeight: 600, color: getStatusBadge(showDetails.status).text }}>
                  {getStatusBadge(showDetails.status).label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: T.textMd }}>
                {getStatusMessage(showDetails.status)}
              </p>
            </div>

            {/* Request Details */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: T.navy }}>Description</h4>
              <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.5 }}>
                {showDetails.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <Calendar size={12} color={T.textSm} />
                <span style={{ fontSize: 11, color: T.textSm }}>
                  Submitted: {new Date(showDetails.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Priority & Status Info */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, background: T.surface, borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: T.textSm }}>Priority</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {getPriorityIcon(showDetails.priority)}
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.navy, textTransform: 'capitalize' }}>{showDetails.priority}</span>
                </div>
              </div>
              <div style={{ flex: 1, background: T.surface, borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: T.textSm }}>Status</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {getStatusBadge(showDetails.status).icon({ size: 14, color: getStatusBadge(showDetails.status).text })}
                  <span style={{ fontSize: 13, fontWeight: 600, color: getStatusBadge(showDetails.status).text }}>
                    {getStatusBadge(showDetails.status).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Section */}
            {(notes[showDetails.id]?.length > 0) && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <MessageSquare size={14} color={T.teal} />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.navy }}>Messages ({notes[showDetails.id]?.length || 0})</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {notes[showDetails.id]?.map((note) => (
                    <div key={note.id} style={{
                      background: note.sender_type === 'syndic' ? T.tealLight : T.surface,
                      borderRadius: 12,
                      padding: 12,
                      marginLeft: note.sender_type === 'syndic' ? 0 : 20,
                      marginRight: note.sender_type === 'syndic' ? 20 : 0
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: note.sender_type === 'syndic' ? T.teal : T.orange }}>
                          {note.sender_type === 'syndic' ? '📋 Syndic' : '👤 You'}
                        </span>
                        <span style={{ fontSize: 9, color: T.textSm }}>
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: T.text, lineHeight: 1.4 }}>{note.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Message */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 8 }}>Send a message to syndic</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ask for an update or provide more information..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newNote.trim()}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: newNote.trim() ? T.orange : T.textSm,
                    border: 'none',
                    cursor: newNote.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} color="#fff" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(null)}
              style={{
                width: '100%',
                marginTop: 16,
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
              Close
            </button>
          </div>
        </>
      )}

      {/* New Request Modal */}
      {showForm && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,15,36,0.5)',
              zIndex: 90,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowForm(false)}
          />
          <div className="slide-up" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: T.white,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            zIndex: 100,
            padding: 24,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>New Request</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>Describe the issue you're facing</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Broken AC, Leaking Pipe"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    fontSize: 14,
                    outline: 'none'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide details about the issue..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    fontSize: 14,
                    background: T.white,
                    outline: 'none'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                >
                  <option value="low">Low - Can wait (3-5 days)</option>
                  <option value="medium">Medium - Needs attention (1-2 days)</option>
                  <option value="high">High - Urgent (24 hours)</option>
                  <option value="emergency">Emergency - Immediate!</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={submitRequest}
              disabled={submitting || !formData.title}
              style={{
                width: '100%',
                marginTop: 24,
                padding: '14px',
                background: (!formData.title) ? T.textSm : T.orange,
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: (!formData.title || submitting) ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.15s'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}