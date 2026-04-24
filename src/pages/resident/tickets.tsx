import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Ticket, Plus, AlertCircle, CheckCircle, Clock,
  Flame, Shield, Zap, ArrowLeft, X, Calendar, MessageSquare, Eye,
  Volume2, HelpCircle, Users, Sparkles
} from 'lucide-react';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  response?: string | null;
}

// ============================================
// CONSTANTS - Predefined ticket categories
// ============================================

const predefinedCategories = [
  { value: 'general', label: 'General', icon: HelpCircle, color: '#6B7280' },
  { value: 'noise', label: 'Noise', icon: Volume2, color: '#EF4444' },
  { value: 'security', label: 'Security', icon: Shield, color: '#F97316' },
  { value: 'neighbor', label: 'Neighbor', icon: Users, color: '#EAB308' },
  { value: 'cleanliness', label: 'Cleanliness', icon: Sparkles, color: '#3B82F6' },
  { value: 'parking', label: 'Parking', icon: AlertCircle, color: '#8B5CF6' },
  { value: 'utilities', label: 'Utilities', icon: Zap, color: '#10B981' },
  { value: 'pests', label: 'Pests', icon: AlertCircle, color: '#F59E0B' },
  { value: 'elevator', label: 'Elevator', icon: AlertCircle, color: '#EC4899' },
  { value: 'internet', label: 'Internet', icon: Zap, color: '#06B6D4' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: '#8B5CF6' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResidentTickets() {
  const router = useRouter();
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [resident, setResident] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<Ticket | null>(null);
  const [buildingName, setBuildingName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  // ============================================
  // INITIALIZATION
  // ============================================
  
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
      fetchTickets(resident.id);
      fetchBuildingName(resident.apartment_number);
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchBuildingName = async (apartmentNumber: string) => {
    if (!apartmentNumber) return;
    
    try {
      const { data: apartment } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', apartmentNumber)
        .maybeSingle();
      
      if (!apartment?.building_id) return;
      
      const { data: building } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', apartment.building_id)
        .maybeSingle();
      
      if (building) setBuildingName(building.name);
    } catch (err) {
      console.error('Error fetching building:', err);
    }
  };

  const fetchTickets = async (residentId: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('resident_id', residentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TICKET SUBMISSION
  // ============================================

  const submitTicket = async () => {
    if (!formData.title) {
      alert('Please enter a title');
      return;
    }
    
    if (formData.category === 'other' && !customCategory.trim()) {
      alert('Please specify your category');
      return;
    }
    
    if (!resident) return;
    
    setSubmitting(true);
    
    try {
      const { data: residentData } = await supabase
        .from('residents')
        .select('building_id')
        .eq('id', resident.id)
        .maybeSingle();
      
      const finalCategory = formData.category === 'other' 
        ? customCategory.trim().toLowerCase().replace(/\s+/g, '_')
        : formData.category;
      
      const { error } = await supabase
        .from('tickets')
        .insert([{
          resident_id: resident.id,
          building_id: residentData?.building_id || null,
          title: formData.title,
          description: formData.description,
          category: finalCategory,
          priority: formData.priority,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'general', priority: 'medium' });
      setCustomCategory('');
      setShowCustomInput(false);
      await fetchTickets(resident.id);
      alert('✅ Ticket submitted successfully!');
      
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error submitting ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // UI HELPER FUNCTIONS
  // ============================================

  const getCategoryIcon = (category: string) => {
    const found = predefinedCategories.find(c => c.value === category);
    if (found) {
      const Icon = found.icon;
      return <Icon size={14} color={found.color} />;
    }
    return <HelpCircle size={14} color="#6B7280" />;
  };

  const getCategoryLabel = (category: string) => {
    const found = predefinedCategories.find(c => c.value === category);
    if (found) return found.label;
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#EAB308';
      default: return '#3B82F6';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch(priority) {
      case 'urgent': return '#FEE2E2';
      case 'high': return '#FFEDD5';
      case 'medium': return '#FEF9C3';
      default: return '#E0F2FE';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'resolved': return '#059669';
      case 'in_progress': return '#2563EB';
      default: return '#D97706';
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'resolved': return '#D1FAE5';
      case 'in_progress': return '#DBEAFE';
      default: return '#FEF3C7';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'resolved': return 'Resolved';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const getStatusMessage = (status: string) => {
    switch(status) {
      case 'pending': return 'Your ticket has been submitted and is waiting for review.';
      case 'in_progress': return 'Your ticket is being handled by the syndic.';
      case 'resolved': return 'Your ticket has been resolved. Thank you for your patience.';
      default: return '';
    }
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  // ============================================
  // LOADING SCREEN
  // ============================================
  
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#FFFFFF',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            border: `3px solid ${T.orange}`, 
            borderTopColor: 'transparent', 
            animation: 'spin 0.75s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: T.textMd, fontSize: 14 }}>Loading tickets...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!resident) return null;

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      paddingBottom: 40
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.4s ease both;
        }
        .slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .card-hover {
          transition: transform 0.1s ease;
        }
        .card-hover:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* ============================================
          HEADER SECTION - Clean dark blue
      ============================================ */}
      
      <div style={{
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        padding: '24px 20px 40px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Back button + Title */}
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
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>SUPPORT</span>
                </div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>My Tickets</h1>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{buildingName || 'Your Building'}</p>
              </div>
            </div>
            
            {/* New ticket button - cleaner */}
            <button
              onClick={() => setShowForm(true)}
              className="card-hover"
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

      {/* ============================================
          STATISTICS CARDS
      ============================================ */}
      
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
            <p style={{ margin: 0, fontSize: 11, color: T.orange }}>Open</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: T.orange }}>{stats.pending + stats.inProgress}</p>
          </div>
          <div style={{ width: 1, height: 40, background: T.border }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: T.green }}>Resolved</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: T.green }}>{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* ============================================
          TICKETS LIST
      ============================================ */}
      
      <div style={{ padding: '20px' }}>
        {tickets.length === 0 ? (
          <div className="fade-in-up" style={{
            background: T.white,
            borderRadius: 24,
            padding: '48px 20px',
            textAlign: 'center',
            border: `1px solid ${T.border}`
          }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Ticket size={32} color={T.textSm} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>No Tickets Yet</h3>
            <p style={{ margin: '8px 0 16px', fontSize: 13, color: T.textSm }}>Submit your first ticket</p>
            <button
              onClick={() => setShowForm(true)}
              className="card-hover"
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
              New Ticket
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="card-hover fade-in-up"
                onClick={() => setShowDetails(ticket)}
                style={{
                  background: T.white,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${T.border}`,
                  borderLeft: ticket.status === 'pending' ? `4px solid ${T.orange}` : `1px solid ${T.border}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 10,
                      background: getPriorityBg(ticket.priority),
                      fontSize: 11,
                      fontWeight: 600,
                      color: getPriorityColor(ticket.priority)
                    }}>
                      {ticket.priority}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 10,
                      background: T.surface,
                      fontSize: 11,
                      fontWeight: 500,
                      color: T.textSm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      {getCategoryIcon(ticket.category)}
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </div>
                  
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    background: getStatusBg(ticket.status),
                    color: getStatusColor(ticket.status)
                  }}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
                
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: T.navy }}>
                  {ticket.title}
                </h3>
                
                <p style={{ margin: '0 0 10px', fontSize: 13, color: T.textMd, lineHeight: 1.4 }}>
                  {ticket.description.length > 100 ? ticket.description.substring(0, 100) + '...' : ticket.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTop: `1px solid ${T.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} color={T.textSm} />
                    <span style={{ fontSize: 11, color: T.textSm }}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={12} color={T.teal} />
                    <span style={{ fontSize: 11, color: T.teal }}>Details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================
          NEW TICKET MODAL
      ============================================ */}
      
      {showForm && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,15,36,0.5)',
              zIndex: 990,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => {
              setShowForm(false);
              setCustomCategory('');
              setShowCustomInput(false);
            }}
          />
          
          <div className="slide-up" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: T.white,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            zIndex: 1000,
            padding: 24,
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>New Ticket</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>Describe your issue</p>
              </div>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setCustomCategory('');
                  setShowCustomInput(false);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.surface,
                  border: 'none',
                  cursor: 'pointer'
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
                  placeholder="Brief summary of your issue"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, category: value });
                    setShowCustomInput(value === 'other');
                    if (value !== 'other') setCustomCategory('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    fontSize: 14,
                    background: T.white,
                    outline: 'none',
                    marginBottom: showCustomInput ? 12 : 0
                  }}
                >
                  {predefinedCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                
                {showCustomInput && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter your category"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: `1px solid ${T.border}`,
                      borderRadius: 12,
                      fontSize: 14,
                      outline: 'none',
                      marginTop: 8
                    }}
                    autoFocus
                  />
                )}
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
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about your issue..."
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
                />
              </div>
            </div>
            
            <button
              onClick={submitTicket}
              disabled={submitting || !formData.title || (formData.category === 'other' && !customCategory.trim())}
              className="card-hover"
              style={{
                width: '100%',
                marginTop: 24,
                padding: '14px',
                background: (!formData.title || (formData.category === 'other' && !customCategory.trim())) ? T.textSm : T.orange,
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: (!formData.title || (formData.category === 'other' && !customCategory.trim()) || submitting) ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </>
      )}

      {/* ============================================
          TICKET DETAILS MODAL
      ============================================ */}
      
      {showDetails && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,15,36,0.5)',
              zIndex: 990,
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
            zIndex: 1000,
            padding: 24,
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>{showDetails.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>
                  ID: {showDetails.id.slice(0, 8)}
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
                  cursor: 'pointer'
                }}
              >
                <X size={16} color={T.textMd} />
              </button>
            </div>

            <div style={{
              background: getStatusBg(showDetails.status),
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {showDetails.status === 'resolved' && <CheckCircle size={16} color={getStatusColor(showDetails.status)} />}
                {showDetails.status === 'in_progress' && <Zap size={16} color={getStatusColor(showDetails.status)} />}
                {showDetails.status === 'pending' && <Clock size={16} color={getStatusColor(showDetails.status)} />}
                <span style={{ fontWeight: 600, color: getStatusColor(showDetails.status) }}>
                  {getStatusLabel(showDetails.status)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: T.textMd }}>
                {getStatusMessage(showDetails.status)}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 10,
                  background: getPriorityBg(showDetails.priority),
                  fontSize: 11,
                  fontWeight: 600,
                  color: getPriorityColor(showDetails.priority)
                }}>
                  {showDetails.priority.toUpperCase()}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 10,
                  background: T.surface,
                  fontSize: 11,
                  fontWeight: 500,
                  color: T.textSm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {getCategoryIcon(showDetails.category)}
                  {getCategoryLabel(showDetails.category)}
                </span>
              </div>
              
              <p style={{ margin: 0, fontSize: 14, color: T.text, lineHeight: 1.5 }}>
                {showDetails.description}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <Calendar size={12} color={T.textSm} />
                <span style={{ fontSize: 11, color: T.textSm }}>
                  Submitted: {new Date(showDetails.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {showDetails.response && (
              <div style={{
                background: T.tealLight,
                borderRadius: 16,
                padding: 16,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <MessageSquare size={14} color={T.teal} />
                  <span style={{ fontWeight: 600, color: T.teal }}>Response</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: T.text }}>{showDetails.response}</p>
              </div>
            )}

            <button
              onClick={() => setShowDetails(null)}
              className="card-hover"
              style={{
                width: '100%',
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
    </div>
  );
}