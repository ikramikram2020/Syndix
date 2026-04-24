import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';
import { 
  Wrench, CheckCircle, Clock, AlertCircle, Flame, Shield, Zap,
  User, Home, Phone, Mail, MessageSquare, Send, X, RefreshCw
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  completed_at?: string;
  resident_id?: string;
  resident_name?: string;
  apartment_number?: string;
  resident_phone?: string | null;
  resident_email?: string | null;
}

interface RequestNote {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

export default function MaintenanceManagement() {
  const router = useRouter();
  const [building, setBuilding] = useState<any>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [notes, setNotes] = useState<RequestNote[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBuildingAndRequests();
  }, []);

  const fetchBuildingAndRequests = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      setLoading(false);
      return;
    }
    
    const { data: buildingData } = await supabase
      .from('buildings')
      .select('*')
      .eq('syndic_id', user.id)
      .maybeSingle();
    
    if (buildingData) {
      setBuilding(buildingData);
      await fetchRequests(buildingData.id);
    }
    setLoading(false);
  };

  const fetchRequests = async (buildingId: string) => {
    try {
      const { data: requestsData } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });
      
      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        return;
      }
      
      const residentIds = [...new Set(requestsData.map(r => r.resident_id).filter(Boolean))];
      
      if (residentIds.length === 0) {
        setRequests(requestsData.map((req: any) => ({
          ...req,
          resident_name: 'Unknown',
          apartment_number: '?'
        })));
        return;
      }
      
      const { data: residentsData } = await supabase
        .from('residents')
        .select('id, full_name, phone, email, apartment_id')
        .in('id', residentIds);
      
      // Get apartment numbers
      const apartmentIds = residentsData?.map(r => r.apartment_id).filter(Boolean) || [];
      let apartmentMap = new Map();
      
      if (apartmentIds.length > 0) {
        const { data: apartmentsData } = await supabase
          .from('apartments')
          .select('id, apartment_number')
          .in('id', apartmentIds);
        
        apartmentsData?.forEach(apt => {
          apartmentMap.set(apt.id, apt.apartment_number);
        });
      }
      
      const residentMap = new Map();
      residentsData?.forEach((resident: any) => {
        residentMap.set(resident.id, {
          full_name: resident.full_name || 'Unknown',
          apartment_number: apartmentMap.get(resident.apartment_id) || '?',
          phone: resident.phone,
          email: resident.email
        });
      });
      
      const formattedRequests = requestsData.map((req: any) => {
        const resident = residentMap.get(req.resident_id);
        return {
          id: req.id,
          title: req.title || 'No title',
          description: req.description || 'No description',
          priority: req.priority || 'medium',
          status: req.status || 'pending',
          created_at: req.created_at,
          completed_at: req.completed_at,
          resident_id: req.resident_id,
          resident_name: resident?.full_name || 'Unknown',
          apartment_number: resident?.apartment_number || '?',
          resident_phone: resident?.phone || null,
          resident_email: resident?.email || null
        };
      });
      
      setRequests(formattedRequests);
      
    } catch (err) {
      console.error('Error:', err);
      setRequests([]);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    if (building) {
      await fetchRequests(building.id);
    }
    setRefreshing(false);
  };

  const fetchNotes = async (requestId: string) => {
    const { data } = await supabase
      .from('maintenance_notes')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    
    setNotes(data || []);
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('maintenance_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ));
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      alert(`✅ Request marked as ${newStatus}!`);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;
    
    setSending(true);
    const { error } = await supabase
      .from('maintenance_notes')
      .insert([{
        request_id: selectedRequest.id,
        message: newMessage,
        sender_type: 'syndic',
        created_at: new Date().toISOString()
      }]);

    if (error) {
      alert('Error sending message: ' + error.message);
    } else {
      setNewMessage('');
      await fetchNotes(selectedRequest.id);
    }
    setSending(false);
  };

  const openRequestDetails = async (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    await fetchNotes(request.id);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setNotes([]);
    setNewMessage('');
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
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <Layout title="Maintenance Requests" subtitle="Manage resident maintenance tickets">
      {/* Hero Section */}
      <div style={{
        marginBottom:24, borderRadius:20, padding:'26px 30px',
        background: `linear-gradient(130deg, ${T.navyDeep} 0%, ${T.navy} 55%, #1A4D7C 100%)`,
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff' }}>
              Service Requests 🔧
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {building?.name || 'Your Building'} · {stats.pending} pending
            </p>
          </div>
          <button onClick={refreshData} disabled={refreshing} style={{
            padding:'8px 16px', borderRadius:30,
            background:'rgba(255,255,255,0.08)',
            display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#fff'
          }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{refreshing ? '...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <div style={{ background:T.white, borderRadius:16, padding:18 }}>
          <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.total}</p>
          <p style={{ margin:0, fontSize:11, color:T.textSm }}>Total</p>
        </div>
        <div style={{ background:T.white, borderRadius:16, padding:18 }}>
          <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.orange }}>{stats.pending}</p>
          <p style={{ margin:0, fontSize:11, color:T.textSm }}>Pending</p>
        </div>
        <div style={{ background:T.white, borderRadius:16, padding:18 }}>
          <p style={{ margin:0, fontSize:22, fontWeight:800, color:"#9333EA" }}>{stats.inProgress}</p>
          <p style={{ margin:0, fontSize:11, color:T.textSm }}>In Progress</p>
        </div>
        <div style={{ background:T.white, borderRadius:16, padding:18 }}>
          <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.green }}>{stats.completed}</p>
          <p style={{ margin:0, fontSize:11, color:T.textSm }}>Completed</p>
        </div>
      </div>

      {/* Requests Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:18 }}>
        {requests.length === 0 ? (
          <div style={{ gridColumn:'span 2', background:T.white, borderRadius:18, padding:'48px 20px', textAlign:'center' }}>
            <Wrench size={48} color={T.textSm} />
            <p style={{ marginTop:16 }}>No maintenance requests yet</p>
          </div>
        ) : (
          requests.map((req) => (
            <div 
              key={req.id} 
              onClick={() => openRequestDetails(req)}
              style={{
                background:T.white, borderRadius:18, padding:20, cursor:'pointer',
                borderLeft: `4px solid ${getPriorityColor(req.priority)}`,
                transition:'all 0.2s'
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ padding:'2px 8px', borderRadius:12, fontSize:11, background:getPriorityBg(req.priority), color:getPriorityColor(req.priority) }}>
                  {req.priority}
                </span>
                <span style={{ fontSize:11, color:getStatusColor(req.status), background:getStatusBg(req.status), padding:'2px 8px', borderRadius:12 }}>
                  {getStatusLabel(req.status)}
                </span>
              </div>
              <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:700 }}>{req.title}</h3>
              <p style={{ fontSize:13, color:T.textMd }}>{req.description?.substring(0, 80)}...</p>
              <div style={{ marginTop:12, paddingTop:12, borderTop: `1px solid ${T.border}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <User size={14} color={T.teal} />
                  <span>{req.resident_name || 'Unknown'}</span>
                  <Home size={14} color={T.orange} style={{ marginLeft:8 }} />
                  <span>Ap {req.apartment_number || '?'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={closeModal}>
          <div style={{ background:'white', width:'100%', maxWidth:500, borderRadius:'20px 20px 0 0', maxHeight:'80vh', overflow:'auto', padding:20 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0 }}>{selectedRequest.title}</h3>
              <button onClick={closeModal} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            
            {/* Resident Info */}
            <div style={{ background:T.surface, borderRadius:12, padding:12, marginBottom:16 }}>
              <p><User size={14} style={{ display:'inline', marginRight:8 }} /> <strong>{selectedRequest.resident_name || 'Unknown'}</strong></p>
              <p><Home size={14} style={{ display:'inline', marginRight:8 }} /> Apartment {selectedRequest.apartment_number || '?'}</p>
              {selectedRequest.resident_phone && <p><Phone size={14} style={{ display:'inline', marginRight:8 }} /> {selectedRequest.resident_phone}</p>}
              {selectedRequest.resident_email && <p><Mail size={14} style={{ display:'inline', marginRight:8 }} /> {selectedRequest.resident_email}</p>}
            </div>
            
            {/* Description */}
            <div style={{ marginBottom:16 }}>
              <strong>Description:</strong>
              <p style={{ marginTop:8 }}>{selectedRequest.description}</p>
              <small style={{ color:T.textSm }}>Submitted: {new Date(selectedRequest.created_at).toLocaleString()}</small>
            </div>
            
            {/* Status Buttons */}
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              {selectedRequest.status === 'pending' && (
                <button onClick={() => updateStatus(selectedRequest.id, 'in_progress')} style={{ flex:1, padding:12, background:T.navy, color:'white', border:'none', borderRadius:12, cursor:'pointer' }}>Start Work</button>
              )}
              {selectedRequest.status === 'in_progress' && (
                <button onClick={() => updateStatus(selectedRequest.id, 'completed')} style={{ flex:1, padding:12, background:T.green, color:'white', border:'none', borderRadius:12, cursor:'pointer' }}>Mark Complete</button>
              )}
            </div>
            
            {/* Messages */}
            {notes.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <strong>Messages:</strong>
                {notes.map(note => (
                  <div key={note.id} style={{ background: note.sender_type === 'syndic' ? T.tealLight : T.surface, borderRadius:8, padding:8, marginTop:8 }}>
                    <small><strong>{note.sender_type === 'syndic' ? 'Syndic' : 'Resident'}</strong> - {new Date(note.created_at).toLocaleString()}</small>
                    <p style={{ margin:0 }}>{note.message}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Send Message */}
            <div>
              <textarea rows={2} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ width:'100%', padding:10, borderRadius:8, border:`1px solid ${T.border}`, marginBottom:8 }} />
              <button onClick={sendMessage} disabled={!newMessage.trim()} style={{ width:'100%', padding:10, background:T.orange, color:'white', border:'none', borderRadius:8, cursor:'pointer' }}>Send Message</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}