import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Wrench, Plus, AlertCircle, CheckCircle, Clock,
  Flame, Shield, Zap, ArrowLeft, X, Send,
  Sparkles, Calendar, MessageSquare, Eye
} from 'lucide-react';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

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

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResidentMaintenance() {
  const router = useRouter();
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [resident, setResident] = useState<any>(null);           // Current resident data
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]); // List of maintenance requests
  const [notes, setNotes] = useState<RequestNote[]>([]);         // Messages for selected request
  const [loading, setLoading] = useState(true);                  // Loading state
  const [showForm, setShowForm] = useState(false);               // New request modal visibility
  const [showDetails, setShowDetails] = useState<MaintenanceRequest | null>(null); // Details modal
  const [formData, setFormData] = useState({                     // New request form data
    title: '',
    description: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);           // Submit button state
  const [buildingName, setBuildingName] = useState('');          // Building name for header
  const [newNote, setNewNote] = useState('');                    // New message text
  const [sending, setSending] = useState(false);                 // Send message state

  // ============================================
  // INITIALIZATION - Load resident data from localStorage
  // ============================================
  
  useEffect(() => {
    // Get saved session data
    const token = localStorage.getItem('resident_token');
    const residentData = localStorage.getItem('resident_data');
    
    // No valid session → redirect to login
    if (!token || !residentData) {
      router.push('/resident');
      return;
    }
    
    try {
      const resident = JSON.parse(residentData);
      setResident(resident);
      fetchRequests(resident.id);                    // Load their maintenance requests
      fetchBuildingName(resident.apartment_number);  // Load building name for header
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  // ============================================
  // DATA FETCHING FUNCTIONS
  // ============================================
  
  /**
   * Fetch building name using apartment number
   * Used for displaying in the header
   */
  const fetchBuildingName = async (apartmentNumber: string) => {
    try {
      // First get building_id from apartment
      const { data: apartment } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', apartmentNumber)
        .maybeSingle();
      
      if (apartment?.building_id) {
        // Then get building name
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

  /**
   * Fetch all maintenance requests for the current resident
   * Orders by newest first
   */
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

  /**
   * Fetch messages/notes for a specific request
   * Orders by oldest first (chronological conversation)
   */
  const fetchNotes = async (requestId: string) => {
    const { data } = await supabase
      .from('maintenance_notes')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    
    setNotes(data || []);
  };

  // ============================================
  // MAINTENANCE REQUEST ACTIONS
  // ============================================
  
  /**
   * Submit a new maintenance request
   * 1. Find building_id from resident's apartment
   * 2. Insert into maintenance_requests table
   * 3. Refresh the list
   */
  const submitRequest = async () => {
    // Validation
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

      // Insert the new request
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

      // Reset form and refresh
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

  /**
   * Send a message on an existing request
   * Messages allow residents to communicate with syndic
   */
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
      await fetchNotes(showDetails.id);  // Refresh messages
    }
    setSending(false);
  };

  /**
   * Open the details modal for a request
   * Fetches messages at the same time
   */
  const openDetails = async (request: MaintenanceRequest) => {
    setShowDetails(request);
    await fetchNotes(request.id);
  };

  /**
   * Close the details modal and reset state
   */
  const closeDetails = () => {
    setShowDetails(null);
    setNotes([]);
    setNewNote('');
  };

  // ============================================
  // UI HELPER FUNCTIONS (Colors & Labels)
  // ============================================
  
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

  // Calculate statistics for dashboard cards
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  // ============================================
  // LOADING SCREEN (Clean white)
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
          <p style={{ color: T.textMd, fontSize: 14 }}>Loading your requests...</p>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
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
          HEADER SECTION
      ============================================ */}
      
      <div style={{
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        padding: '24px 20px 40px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
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
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>MAINTENANCE</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff' }}>Service Requests</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{buildingName || 'Your Building'}</p>
            </div>
          </div>
          
          {/* New request button */}
          <button 
            onClick={() => setShowForm(true)} 
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: T.orange,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245,166,35,0.3)'
            }}
          >
            <Plus size={20} color="#fff" />
          </button>
        </div>
      </div>

      {/* ============================================
          STATISTICS CARDS - Quick overview
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

      {/* ============================================
          REQUESTS LIST - Display all maintenance requests
      ============================================ */}
      
      <div style={{ padding: '20px' }}>
        {requests.length === 0 ? (
          // Empty State - No requests yet
          <div className="fade-in-up" style={{
            background: T.white,
            borderRadius: 24,
            padding: '48px 20px',
            textAlign: 'center',
            border: `1px solid ${T.border}`
          }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              background: T.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Wrench size={32} color={T.textSm} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>No Requests Yet</h3>
            <p style={{ margin: '8px 0 16px', fontSize: 13, color: T.textSm }}>Submit your first maintenance request</p>
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
              Create Request
            </button>
          </div>
        ) : (
          // List of requests
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map((req, index) => (
              <div 
                key={req.id} 
                className="fade-in-up card-hover"
                onClick={() => openDetails(req)}
                style={{
                  background: T.white,
                  borderRadius: 20,
                  padding: 16,
                  borderLeft: `4px solid ${getPriorityColor(req.priority)}`,
                  border: `1px solid ${T.border}`,
                  borderLeftWidth: 4,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease'
                }}
              >
                {/* Priority & Status Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: getPriorityBg(req.priority),
                    color: getPriorityColor(req.priority)
                  }}>
                    {req.priority}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: getStatusBg(req.status),
                    color: getStatusColor(req.status)
                  }}>
                    {getStatusLabel(req.status)}
                  </span>
                </div>
                
                {/* Title */}
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: T.navy }}>
                  {req.title}
                </h3>
                
                {/* Description Preview */}
                <p style={{ margin: 0, fontSize: 13, color: T.textMd, lineHeight: 1.5 }}>
                  {req.description?.substring(0, 100)}
                  {req.description?.length > 100 ? '...' : ''}
                </p>
                
                {/* Footer with date and view indicator */}
                <div style={{ 
                  marginTop: 12, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
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
            ))}
          </div>
        )}
      </div>

      {/* ============================================
          NEW REQUEST MODAL - Create maintenance request
      ============================================ */}
      
      {showForm && (
        <>
          {/* Backdrop overlay */}
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,15,36,0.5)',
              zIndex: 990,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowForm(false)}
          />
          
          {/* Modal content */}
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
            {/* Modal Header */}
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
            
            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title Input */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>
                  Title *
                </label>
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
              
              {/* Description Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>
                  Description
                </label>
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
              
              {/* Priority Select */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 6 }}>
                  Priority
                </label>
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
            
            {/* Action Buttons */}
            <button
              onClick={submitRequest}
              disabled={submitting || !formData.title}
              className="card-hover"
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
            
            <button
              onClick={() => setShowForm(false)}
              style={{
                width: '100%',
                marginTop: 12,
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
              Cancel
            </button>
          </div>
        </>
      )}

      {/* ============================================
          REQUEST DETAILS MODAL - View full request and messages
      ============================================ */}
      
      {showDetails && (
        <>
          {/* Backdrop overlay */}
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,15,36,0.5)',
              zIndex: 990,
              backdropFilter: 'blur(4px)'
            }}
            onClick={closeDetails}
          />
          
          {/* Modal content */}
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
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.navy }}>{showDetails.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textSm }}>
                  Request ID: {showDetails.id.slice(0, 8)}
                </p>
              </div>
              <button 
                onClick={closeDetails}
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
            
            {/* Request Details Card */}
            <div style={{
              background: T.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <p style={{ margin: 0 }}>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: getStatusColor(showDetails.status) }}>
                    {getStatusLabel(showDetails.status)}
                  </span>
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Priority:</strong>{' '}
                  <span style={{ color: getPriorityColor(showDetails.priority) }}>
                    {showDetails.priority}
                  </span>
                </p>
              </div>
              <p style={{ margin: '0 0 8px' }}><strong>Description:</strong></p>
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
            
            {/* Messages Section */}
            {notes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <MessageSquare size={14} color={T.teal} />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.navy }}>
                    Messages ({notes.length})
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {notes.map((note) => (
                    <div 
                      key={note.id} 
                      style={{
                        background: note.sender_type === 'resident' ? T.surface : T.tealLight,
                        borderRadius: 12,
                        padding: 12,
                        marginLeft: note.sender_type === 'resident' ? 0 : 20,
                        marginRight: note.sender_type === 'resident' ? 20 : 0
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: note.sender_type === 'resident' ? T.orange : T.teal }}>
                          {note.sender_type === 'resident' ? '👤 You' : '📋 Syndic'}
                        </span>
                        <span style={{ fontSize: 9, color: T.textSm }}>
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.4 }}>
                        {note.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Send Message Section */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.textMd, marginBottom: 8 }}>
                Send a message to syndic
              </label>
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
                  disabled={!newNote.trim() || sending}
                  className="card-hover"
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
            
            {/* Close Button */}
            <button
              onClick={closeDetails}
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
    </div>
  );
}