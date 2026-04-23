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
  resident_phone?: string;
  resident_email?: string;
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
    
    const { data: buildingData, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('syndic_id', user.id)
      .single();
    
    if (buildingError) {
      console.error('Error fetching building:', buildingError);
      setLoading(false);
      return;
    }
    
    if (buildingData) {
      setBuilding(buildingData);
      await fetchRequests(buildingData.id);
    }
    setLoading(false);
  };

  const fetchRequests = async (buildingId: string) => {
    try {
      // Get all maintenance requests for this building with resident info via join
      const { data: requestsData, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          resident:residents (
            id,
            full_name,
            phone,
            email,
            apartment_number
          )
        `)
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        setRequests([]);
        return;
      }

      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        return;
      }

      // Format the requests with resident info
      const formattedRequests = requestsData.map((req: any) => ({
        id: req.id,
        title: req.title,
        description: req.description,
        priority: req.priority,
        status: req.status,
        created_at: req.created_at,
        completed_at: req.completed_at,
        resident_id: req.resident_id,
        resident_name: req.resident?.full_name || 'Unknown Resident',
        apartment_number: req.resident?.apartment_number || '?',
        resident_phone: req.resident?.phone,
        resident_email: req.resident?.email
      }));

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
    const { data, error } = await supabase
      .from('maintenance_notes')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setNotes(data);
    } else {
      setNotes([]);
    }
  };

  const updateStatus = async (requestId: string, status: string) => {
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('maintenance_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      if (building) {
        await fetchRequests(building.id);
      }
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status });
      }
      alert(`✅ Request marked as ${status}!`);
      
      // Send notification to resident
      await sendStatusNotification(requestId, status);
    }
  };

  const sendStatusNotification = async (requestId: string, status: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request?.resident_id) return;
    
    const statusMessages = {
      pending: 'Your request has been received',
      in_progress: 'Your maintenance request is now in progress',
      completed: 'Your maintenance request has been completed'
    };
    
    await supabase
      .from('notifications')
      .insert([{
        user_id: request.resident_id,
        title: 'Maintenance Request Update',
        message: `${statusMessages[status as keyof typeof statusMessages]}: ${request.title}`,
        type: 'maintenance',
        read: false,
        created_at: new Date().toISOString(),
        data: JSON.stringify({ request_id: requestId, status })
      }]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;
    
    setSending(true);
    const { error } = await supabase
      .from('maintenance_notes')
      .insert([{
        request_id: selectedRequest.id,
        message: newMessage,
        sender_type: 'syndic'
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
    await fetchNotes(request.id);
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
      case 'completed': return { bg: '#D1FAE5', text: '#059669', label: 'Completed', icon: CheckCircle };
      case 'in_progress': return { bg: '#DBEAFE', text: '#2563EB', label: 'In Progress', icon: Zap };
      default: return { bg: '#FEF3C7', text: '#D97706', label: 'Pending', icon: Clock };
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
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Loading maintenance requests...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <Layout title="Maintenance Requests" subtitle="Manage resident maintenance tickets">
      {/* Hero Section */}
      <div className="fade-up" style={{
        marginBottom:24, borderRadius:20, padding:'26px 30px',
        background: `linear-gradient(130deg, ${T.navyDeep} 0%, ${T.navy} 55%, #1A4D7C 100%)`,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:220, height:220, borderRadius:'50%', background:`radial-gradient(circle, ${T.teal}20 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${T.orange}, ${T.teal}, transparent)` }} />
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:T.green }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Maintenance Dashboard</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Service Requests 🔧
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {building?.name || 'Your Building'} · {stats.pending} pending requests
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={refreshData} disabled={refreshing} style={{
              padding:'8px 16px', borderRadius:30,
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
              display:'flex', alignItems:'center', gap:8, cursor:'pointer'
            }}>
              <RefreshCw size={13} color={T.teal} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <div style={{
              padding:'8px 16px', borderRadius:30,
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <Wrench size={13} color={T.teal} />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{stats.total} Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <div style={{ background:T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'#EEF1FB', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Wrench size={17} color={T.navy} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.total}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Total Requests</p>
            </div>
          </div>
        </div>
        <div style={{ background:T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:T.orangeLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Clock size={17} color={T.orange} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.pending}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Pending</p>
            </div>
          </div>
        </div>
        <div style={{ background:T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'#F3E8FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={17} color="#9333EA" />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.inProgress}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>In Progress</p>
            </div>
          </div>
        </div>
        <div style={{ background:T.white, borderRadius:16, padding:18, border:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:T.greenLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle size={17} color={T.green} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.completed}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="fade-up-3" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:18 }}>
        {requests.length === 0 ? (
          <div style={{ gridColumn:'span 2', background:T.white, borderRadius:18, padding:'48px 20px', textAlign:'center', border:`1px solid ${T.border}` }}>
            <Wrench size={48} color={T.textSm} style={{ margin:'0 auto 12px', display:'block' }} />
            <p style={{ margin:0, fontSize:13, color:T.textSm }}>No maintenance requests yet</p>
            <p style={{ margin:'8px 0 0', fontSize:11, color:T.textSm }}>Residents will appear here when they submit requests</p>
          </div>
        ) : (
          requests.map((req) => {
            const priorityStyle = getPriorityStyle(req.priority);
            const statusStyle = getStatusBadge(req.status);
            const StatusIcon = statusStyle.icon;
            
            return (
              <div key={req.id} style={{
                background:T.white, borderRadius:18, border:`1px solid ${T.border}`,
                overflow:'hidden', cursor:'pointer', transition:'all 0.22s'
              }}
              onClick={() => openRequestDetails(req)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(27,43,107,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ padding:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <div style={{ padding:'4px 10px', borderRadius:8, background:priorityStyle.bg, display:'flex', alignItems:'center', gap:6 }}>
                        {getPriorityIcon(req.priority)}
                        <span style={{ fontSize:11, fontWeight:600, color:priorityStyle.text, textTransform:'capitalize' }}>{req.priority}</span>
                      </div>
                      <span style={{ padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:600, background:statusStyle.bg, color:statusStyle.text, display:'flex', alignItems:'center', gap:4 }}>
                        <StatusIcon size={10} />
                        {statusStyle.label}
                      </span>
                    </div>
                    <span style={{ fontSize:10, color:T.textSm }}>{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:700, color:T.navy }}>{req.title}</h3>
                  <p style={{ margin:'0 0 12px', fontSize:13, color:T.textMd, lineHeight:1.5 }}>{req.description.substring(0, 80)}...</p>
                  
                  {/* Resident Info */}
                  <div style={{
                    background: T.surface,
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <User size={14} color={T.teal} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{req.resident_name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Home size={14} color={T.orange} />
                      <span style={{ fontSize: 12, color: T.textMd }}>Apartment {req.apartment_number}</span>
                    </div>
                  </div>
                  
                  <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', marginTop:12, fontSize:11, color:T.teal }}>
                    <span>Click for details →</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <>
          <div style={{ position:'fixed', inset:0, background:'rgba(5,15,36,0.5)', zIndex:90, backdropFilter:'blur(4px)' }} onClick={() => setSelectedRequest(null)} />
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, background:T.white,
            borderTopLeftRadius:28, borderTopRightRadius:28, zIndex:100,
            padding:24, maxHeight:'85vh', overflowY:'auto',
            boxShadow:'0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:T.navy }}>{selectedRequest.title}</h3>
                <p style={{ margin:'4px 0 0', fontSize:12, color:T.textSm }}>Request ID: {selectedRequest.id.slice(0,8)}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ padding:8, background:T.surface, border:'none', borderRadius:10, cursor:'pointer' }}>
                <X size={18} color={T.textMd} />
              </button>
            </div>

            {/* Resident Info Section */}
            <div style={{ background:T.surface, borderRadius:16, padding:16, marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <User size={18} color={T.navy} />
                <span style={{ fontWeight:700, color:T.navy }}>Resident Information</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <User size={14} color={T.textSm} />
                  <span style={{ fontSize:13, color:T.text }}>{selectedRequest.resident_name}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Home size={14} color={T.textSm} />
                  <span style={{ fontSize:13, color:T.text }}>Apartment {selectedRequest.apartment_number}</span>
                </div>
                {selectedRequest.resident_phone && (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Phone size={14} color={T.textSm} />
                    <span style={{ fontSize:13, color:T.text }}>{selectedRequest.resident_phone}</span>
                  </div>
                )}
                {selectedRequest.resident_email && (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Mail size={14} color={T.textSm} />
                    <span style={{ fontSize:13, color:T.text }}>{selectedRequest.resident_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div style={{ marginBottom:20 }}>
              <h4 style={{ margin:'0 0 8px', fontSize:14, fontWeight:600, color:T.navy }}>Description</h4>
              <p style={{ margin:0, fontSize:13, color:T.text, lineHeight:1.5 }}>{selectedRequest.description}</p>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:12 }}>
                <Clock size={12} color={T.textSm} />
                <span style={{ fontSize:11, color:T.textSm }}>Submitted: {new Date(selectedRequest.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Priority & Status */}
            <div style={{ display:'flex', gap:12, marginBottom:20 }}>
              <div style={{ flex:1, background:T.surface, borderRadius:12, padding:12, textAlign:'center' }}>
                <p style={{ margin:'0 0 4px', fontSize:11, color:T.textSm }}>Priority</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {getPriorityIcon(selectedRequest.priority)}
                  <span style={{ fontSize:13, fontWeight:600, color:T.navy, textTransform:'capitalize' }}>{selectedRequest.priority}</span>
                </div>
              </div>
              <div style={{ flex:1, background:T.surface, borderRadius:12, padding:12, textAlign:'center' }}>
                <p style={{ margin:'0 0 4px', fontSize:11, color:T.textSm }}>Status</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {getStatusBadge(selectedRequest.status).icon({ size:14, color: getStatusBadge(selectedRequest.status).text })}
                  <span style={{ fontSize:13, fontWeight:600, color:getStatusBadge(selectedRequest.status).text }}>{getStatusBadge(selectedRequest.status).label}</span>
                </div>
              </div>
            </div>

            {/* Status Update Buttons */}
            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              {selectedRequest.status === 'pending' && (
                <button onClick={() => updateStatus(selectedRequest.id, 'in_progress')} style={{ flex:1, padding:'12px', background:T.navy, border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Start Work
                </button>
              )}
              {selectedRequest.status === 'in_progress' && (
                <button onClick={() => updateStatus(selectedRequest.id, 'completed')} style={{ flex:1, padding:'12px', background:T.green, border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Mark Complete
                </button>
              )}
              {selectedRequest.status === 'completed' && (
                <div style={{ flex:1, padding:'12px', background:'#D1FAE5', borderRadius:12, color: '#059669', fontSize:13, fontWeight:600, textAlign:'center' }}>
                  ✅ Completed
                </div>
              )}
            </div>

            {/* Messages Section */}
            {notes.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <MessageSquare size={14} color={T.teal} />
                  <h4 style={{ margin:0, fontSize:14, fontWeight:600, color:T.navy }}>Messages ({notes.length})</h4>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {notes.map((note) => (
                    <div key={note.id} style={{
                      background: note.sender_type === 'syndic' ? T.tealLight : T.surface,
                      borderRadius:12, padding:12,
                      marginLeft: note.sender_type === 'syndic' ? 0 : 20,
                      marginRight: note.sender_type === 'syndic' ? 20 : 0
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <span style={{ fontSize:10, fontWeight:600, color: note.sender_type === 'syndic' ? T.teal : T.orange }}>
                          {note.sender_type === 'syndic' ? '📋 Syndic' : '👤 Resident'}
                        </span>
                        <span style={{ fontSize:9, color:T.textSm }}>
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin:0, fontSize:13, color:T.text, lineHeight:1.4 }}>{note.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Message */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.textMd, marginBottom:8 }}>Send message to resident</label>
              <div style={{ display:'flex', gap:10 }}>
                <textarea 
                  rows={3} 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type your message here... The resident will be able to reply." 
                  style={{ 
                    flex:1, 
                    padding:'12px', 
                    border:`1px solid ${T.border}`, 
                    borderRadius:12, 
                    fontSize:13, 
                    fontFamily:'inherit', 
                    outline:'none', 
                    resize:'vertical' 
                  }} 
                  onFocus={e => e.currentTarget.style.borderColor = T.teal} 
                  onBlur={e => e.currentTarget.style.borderColor = T.border} 
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || sending} 
                  style={{ 
                    width:48, 
                    height:48, 
                    borderRadius:12, 
                    background: newMessage.trim() ? T.orange : T.textSm, 
                    border:'none', 
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed', 
                    display:'flex', 
                    alignItems:'center', 
                    justifyContent:'center',
                    transition:'all 0.2s'
                  }}
                >
                  <Send size={18} color="#fff" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}