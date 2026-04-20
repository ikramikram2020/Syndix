import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';
import { 
  Ticket, CheckCircle, Clock, AlertCircle, 
  Flame, Shield, Zap, MessageSquare, Send, X,
  Users, Home, Eye, Filter, Search, ArrowLeft,
  Volume2, Sparkles, HelpCircle ,Mail ,Phone
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  response: string | null;
  resident_name?: string;
  apartment_number?: string;
  resident_phone?: string;
  resident_email?: string;
}

export default function SyndicTickets() {
  const router = useRouter();
  const [building, setBuilding] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseText, setResponseText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBuildingAndTickets();
  }, []);

  const fetchBuildingAndTickets = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get syndic's building
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .single();
      
      if (buildingData) {
        setBuilding(buildingData);
        await fetchTickets(buildingData.id);
      }
    }
    setLoading(false);
  };

  const fetchTickets = async (buildingId: string) => {
    try {
      // Get all residents in this building
      const { data: residents } = await supabase
        .from('residents')
        .select(`
          id,
          full_name,
          phone,
          email,
          apartments (
            apartment_number
          )
        `)
        .eq('building_id', buildingId);

      if (!residents || residents.length === 0) {
        setTickets([]);
        return;
      }

      // Create resident map
      const residentMap = new Map();
      residents.forEach((resident: any) => {
        const apartment = resident.apartments as any;
        residentMap.set(resident.id, {
          name: resident.full_name,
          apartment: apartment?.apartment_number || '?',
          phone: resident.phone,
          email: resident.email
        });
      });

      // Get all tickets for this building
      const { data: ticketsData, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        setTickets([]);
        return;
      }

      if (!ticketsData || ticketsData.length === 0) {
        setTickets([]);
        return;
      }

      // Merge tickets with resident info
      const mergedTickets = ticketsData.map((ticket: any) => {
        const resident = residentMap.get(ticket.resident_id);
        return {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          created_at: ticket.created_at,
          resolved_at: ticket.resolved_at,
          response: ticket.response,
          resident_name: resident?.name || 'Unknown Resident',
          apartment_number: resident?.apartment || '?',
          resident_phone: resident?.phone,
          resident_email: resident?.email
        };
      });

      setTickets(mergedTickets);
    } catch (err) {
      console.error('Error:', err);
      setTickets([]);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      if (building) {
        await fetchTickets(building.id);
      }
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
      alert(`Ticket marked as ${status}!`);
    }
  };

  const sendResponse = async () => {
    if (!responseText.trim() || !selectedTicket) return;
    
    setSending(true);
    const { error } = await supabase
      .from('tickets')
      .update({
        response: responseText,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedTicket.id);

    if (error) {
      alert('Error sending response: ' + error.message);
    } else {
      setResponseText('');
      await fetchTickets(building!.id);
      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, response: responseText, status: 'in_progress' });
      }
      alert('Response sent to resident!');
    }
    setSending(false);
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'noise': return <Volume2 size={14} color="#EF4444" />;
      case 'security': return <Shield size={14} color="#F97316" />;
      case 'neighbor': return <Users size={14} color="#EAB308" />;
      case 'cleanliness': return <Sparkles size={14} color="#3B82F6" />;
      default: return <HelpCircle size={14} color="#6B7280" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'noise': return 'Noise Complaint';
      case 'security': return 'Security Issue';
      case 'neighbor': return 'Neighbor Issue';
      case 'cleanliness': return 'Cleanliness';
      default: return 'General';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'urgent': return <Flame size={14} color="#EF4444" />;
      case 'high': return <AlertCircle size={14} color="#F97316" />;
      case 'medium': return <Clock size={14} color="#EAB308" />;
      default: return <Shield size={14} color="#3B82F6" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'urgent': return { bg: T.redLight, text: T.red };
      case 'high': return { bg: T.orangeLight, text: T.orangeDeep };
      case 'medium': return { bg: '#FEF9C3', text: '#854D0E' };
      default: return { bg: T.tealLight, text: T.teal };
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'resolved': 
        return { bg: T.greenLight, text: T.green, icon: CheckCircle, label: 'Resolved' };
      case 'in_progress': 
        return { bg: '#DBEAFE', text: '#1E40AF', icon: Zap, label: 'In Progress' };
      default: 
        return { bg: '#FEF3C7', text: '#92400E', icon: Clock, label: 'Pending' };
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter !== 'all' && ticket.status !== filter) return false;
    if (searchTerm) {
      return ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             ticket.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             ticket.apartment_number?.includes(searchTerm);
    }
    return true;
  });

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Loading SYNDIX…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <Layout title="Tickets & Complaints" subtitle="Manage resident tickets and complaints">
      {/* Hero Section */}
      <div className="fade-up" style={{
        marginBottom:24, borderRadius:20, padding:'26px 30px',
        background: `linear-gradient(130deg, ${T.navyDeep} 0%, ${T.navy} 55%, #1A4D7C 100%)`,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:220, height:220, borderRadius:'50%', background:`radial-gradient(circle, ${T.teal}20 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${T.orange}, ${T.teal}, transparent)` }} />
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:T.green }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Ticket Management</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Resident Tickets 🎫
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {building?.name} · {stats.pending} pending tickets
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{
              padding:'8px 16px', borderRadius:30,
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <Ticket size={13} color={T.teal} />
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
              <Ticket size={17} color={T.navy} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.total}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Total Tickets</p>
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
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.resolved}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="fade-up-2" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div style={{ display:'flex', gap:8, background: T.surface, borderRadius:12, padding:4 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '6px 20px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: filter === tab.id ? T.white : 'transparent',
                color: filter === tab.id ? T.navy : T.textMd,
                border: filter === tab.id ? `1px solid ${T.border}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: filter === tab.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div style={{ position:'relative', width: 250 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:T.textSm }} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              fontSize: 13,
              outline: 'none'
            }}
            onFocus={e => e.currentTarget.style.borderColor = T.teal}
            onBlur={e => e.currentTarget.style.borderColor = T.border}
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="fade-up-3" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:18 }}>
        {filteredTickets.length === 0 ? (
          <div style={{ gridColumn:'span 2', background:T.white, borderRadius:18, padding:'48px 20px', textAlign:'center', border:`1px solid ${T.border}` }}>
            <Ticket size={48} color={T.textSm} style={{ margin:'0 auto 12px', display:'block' }} />
            <p style={{ margin:0, fontSize:13, color:T.textSm }}>No tickets found</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const status = getStatusBadge(ticket.status);
            const StatusIcon = status.icon;
            const priorityStyle = getPriorityStyle(ticket.priority);
            const isPending = ticket.status === 'pending';
            
            return (
              <div key={ticket.id} style={{
                background:T.white, borderRadius:18, border:`1px solid ${T.border}`,
                overflow:'hidden', cursor:'pointer', transition:'all 0.22s'
              }}
              onClick={() => setSelectedTicket(ticket)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(27,43,107,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ padding:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <div style={{ padding:6, borderRadius:8, background:priorityStyle.bg, display:'flex', alignItems:'center', gap:6 }}>
                        {getPriorityIcon(ticket.priority)}
                        <span style={{ fontSize:11, fontWeight:600, color:priorityStyle.text, textTransform:'capitalize' }}>{ticket.priority}</span>
                      </div>
                      <div style={{ padding:6, borderRadius:8, background:T.surface, display:'flex', alignItems:'center', gap:6 }}>
                        {getCategoryIcon(ticket.category)}
                        <span style={{ fontSize:11, fontWeight:500, color:T.textSm }}>{getCategoryLabel(ticket.category)}</span>
                      </div>
                      <span style={{ padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:600, background:status.bg, color:status.text }}>
                        <StatusIcon size={10} style={{ display:'inline', marginRight:4 }} /> {status.label}
                      </span>
                    </div>
                  </div>
                  
                  <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:700, color:T.navy }}>{ticket.title}</h3>
                  <p style={{ margin:'0 0 12px', fontSize:13, color:T.textMd, lineHeight:1.5 }}>{ticket.description.substring(0, 100)}...</p>
                  
                  {/* Resident Info */}
                  <div style={{
                    background: T.surface,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Users size={14} color={T.teal} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{ticket.resident_name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Home size={14} color={T.orange} />
                      <span style={{ fontSize: 12, color: T.textMd }}>Apartment {ticket.apartment_number}</span>
                    </div>
                  </div>
                  
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:T.textSm }}>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span style={{ color: T.teal }}>Click for details →</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <>
          <div style={{ position:'fixed', inset:0, background:'rgba(5,15,36,0.5)', zIndex:90, backdropFilter:'blur(4px)' }} onClick={() => setSelectedTicket(null)} />
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, background:T.white,
            borderTopLeftRadius:28, borderTopRightRadius:28, zIndex:100,
            padding:24, maxHeight:'85vh', overflowY:'auto',
            boxShadow:'0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:T.navy }}>{selectedTicket.title}</h3>
                <p style={{ margin:'4px 0 0', fontSize:12, color:T.textSm }}>Ticket ID: {selectedTicket.id.slice(0,8)}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ padding:8, background:T.surface, border:'none', borderRadius:10, cursor:'pointer' }}>
                <X size={18} color={T.textMd} />
              </button>
            </div>

            {/* Resident Info Section */}
            <div style={{ background:T.surface, borderRadius:16, padding:16, marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <Users size={18} color={T.navy} />
                <span style={{ fontWeight:700, color:T.navy }}>Resident Information</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Users size={14} color={T.textSm} />
                  <span style={{ fontSize:13, color:T.text }}>{selectedTicket.resident_name}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Home size={14} color={T.textSm} />
                  <span style={{ fontSize:13, color:T.text }}>Apartment {selectedTicket.apartment_number}</span>
                </div>
                {selectedTicket.resident_phone && (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Phone size={14} color={T.textSm} />
                    <span style={{ fontSize:13, color:T.text }}>{selectedTicket.resident_phone}</span>
                  </div>
                )}
                {selectedTicket.resident_email && (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Mail size={14} color={T.textSm} />
                    <span style={{ fontSize:13, color:T.text }}>{selectedTicket.resident_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Details */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
                <span style={{ padding:'4px 10px', borderRadius:10, background:getPriorityStyle(selectedTicket.priority).bg, fontSize:11, fontWeight:600, color:getPriorityStyle(selectedTicket.priority).text }}>
                  {selectedTicket.priority.toUpperCase()}
                </span>
                <span style={{ padding:'4px 10px', borderRadius:10, background:T.surface, fontSize:11, fontWeight:500, color:T.textSm }}>
                  {getCategoryLabel(selectedTicket.category)}
                </span>
              </div>
              <p style={{ margin:0, fontSize:14, color:T.text, lineHeight:1.5 }}>{selectedTicket.description}</p>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:12 }}>
                <Clock size={12} color={T.textSm} />
                <span style={{ fontSize:11, color:T.textSm }}>Submitted: {new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Existing Response */}
            {selectedTicket.response && (
              <div style={{ background:T.tealLight, borderRadius:16, padding:16, marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <MessageSquare size={14} color={T.teal} />
                  <span style={{ fontWeight:600, color:T.teal }}>Your Response</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:T.text }}>{selectedTicket.response}</p>
              </div>
            )}

            {/* Status Update Buttons */}
            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              {selectedTicket.status === 'pending' && (
                <button onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')} style={{ flex:1, padding:'12px', background:T.navy, border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Start Processing</button>
              )}
              {selectedTicket.status === 'in_progress' && (
                <button onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} style={{ flex:1, padding:'12px', background:T.green, border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Mark as Resolved</button>
              )}
            </div>

            {/* Send Response */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.textMd, marginBottom:8 }}>Send response to resident</label>
              <div style={{ display:'flex', gap:10 }}>
                <textarea 
                  rows={3} 
                  value={responseText} 
                  onChange={(e) => setResponseText(e.target.value)} 
                  placeholder="Type your response here..."
                  style={{ flex:1, padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:12, fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical' }} 
                  onFocus={e => e.currentTarget.style.borderColor = T.teal} 
                  onBlur={e => e.currentTarget.style.borderColor = T.border} 
                />
                <button 
                  onClick={sendResponse} 
                  disabled={!responseText.trim() || sending} 
                  style={{ width:44, height:44, borderRadius:12, background: responseText.trim() ? T.orange : T.textSm, border:'none', cursor: responseText.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center' }}
                >
                  <Send size={18} color="#fff" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .fade-up {
          animation: fadeUp 0.5s ease both;
        }
        .fade-up-2 {
          animation: fadeUp 0.5s 0.08s ease both;
        }
        .fade-up-3 {
          animation: fadeUp 0.5s 0.16s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 1024px) {
          .fade-up-3[style*="grid-template-columns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .fade-up-3[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  );
}