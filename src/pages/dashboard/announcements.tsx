import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';

import { 
  Megaphone, Plus, Pin, Bell, Trash2, Send, 
  AlertCircle, CheckCircle, Clock, Star, Eye,
  X
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

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'urgent': return <AlertCircle size={14} color={T.red} />;
      case 'important': return <Star size={14} color={T.orange} />;
      default: return <Bell size={14} color={T.teal} />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'urgent': return { bg: T.redLight, text: T.red, border: `${T.red}30` };
      case 'important': return { bg: T.orangeLight, text: T.orangeDeep, border: `${T.orange}30` };
      default: return { bg: T.tealLight, text: T.teal, border: `${T.teal}30` };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, fontFamily:'system-ui', margin:0 }}>Loading SYNDIX…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <Layout title="Announcements" subtitle="Keep residents informed with important updates">
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
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Communication Hub</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Announcements 📢
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {building?.name} · {announcements.length} announcements total
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding:'8px 20px', borderRadius:30,
              background: T.orange, border:'none',
              display:'flex', alignItems:'center', gap:8, cursor:'pointer',
              boxShadow:'0 2px 8px rgba(245,166,35,0.3)'
            }}>
            <Plus size={16} color="#fff" />
            <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="fade-up-2" style={{
        background:T.white, borderRadius:12, padding:'12px 20px', marginBottom:20,
        border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Total Posts</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.navy }}>{announcements.length}</p>
          </div>
          <div style={{ width:1, height:30, background:T.border }} />
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Pinned</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.navy }}>{announcements.filter(a => a.is_pinned).length}</p>
          </div>
          <div style={{ width:1, height:30, background:T.border }} />
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Urgent</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.red }}>{announcements.filter(a => a.priority === 'urgent').length}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:T.green }} />
          <span style={{ fontSize:11, color:T.textMd }}>All residents notified</span>
        </div>
      </div>

      {/* Announcements List */}
      <div className="fade-up-3" style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {announcements.length === 0 ? (
          <div style={{
            background: T.white, borderRadius:18, padding:'48px 20px', textAlign:'center',
            border:`1px solid ${T.border}`
          }}>
            <Megaphone size={48} color={T.textSm} style={{ margin:'0 auto 12px', display:'block' }} />
            <p style={{ margin:0, fontSize:13, color:T.textSm }}>No announcements yet</p>
            <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>Click "New Announcement" to create one</p>
          </div>
        ) : (
          announcements.map((ann) => {
            const priorityStyle = getPriorityStyle(ann.priority);
            return (
              <div key={ann.id} style={{
                background: ann.is_pinned ? `linear-gradient(135deg, ${T.white} 0%, ${T.tealLight} 100%)` : T.white,
                borderRadius: 18,
                border: ann.is_pinned ? `1px solid ${T.teal}` : `1px solid ${T.border}`,
                overflow: 'hidden',
                boxShadow: ann.is_pinned ? `0 4px 12px ${T.teal}20` : '0 2px 8px rgba(27,43,107,0.04)',
                transition: 'all 0.22s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(27,43,107,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ann.is_pinned ? `0 4px 12px ${T.teal}20` : '0 2px 8px rgba(27,43,107,0.04)'; }}>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {ann.is_pinned && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                          background: T.tealLight, color: T.teal
                        }}>
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                        background: priorityStyle.bg, color: priorityStyle.text, border: `1px solid ${priorityStyle.border}`
                      }}>
                        {getPriorityIcon(ann.priority)}
                        {ann.priority}
                      </span>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.navy }}>{ann.title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button 
                        onClick={() => togglePin(ann.id, ann.is_pinned)} 
                        style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textSm, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.teal; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSm; }}
                        title={ann.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin size={14} />
                      </button>
                      <button 
                        onClick={() => deleteAnnouncement(ann.id)} 
                        style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textSm, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSm; }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ margin: '0 0 16px', fontSize: 13, color: T.textMd, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ann.content}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: T.textSm }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} />
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={11} />
                        Sent to all residents
                      </span>
                    </div>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'transparent', border: 'none', fontSize: 11,
                      color: T.teal, cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = T.orange}
                    onMouseLeave={e => e.currentTarget.style.color = T.teal}>
                      <Send size={11} /> Send to WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,26,62,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:T.white, borderRadius:20, maxWidth:500, width:'100%' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:T.navy }}>New Announcement</h3>
                <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>This will be sent to all residents</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ padding:6, borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}>
                <X size={18} color={T.textSm} />
              </button>
            </div>
            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Water Maintenance Notice"
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your announcement here..."
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit', resize:'vertical' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit', background:T.white }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                >
                  <option value="normal">Normal - Regular information</option>
                  <option value="important">Important - Needs attention</option>
                  <option value="urgent">Urgent - Immediate action required</option>
                </select>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  style={{ width:16, height:16, borderRadius:4, border:`1px solid ${T.border}`, cursor:'pointer' }}
                />
                <span style={{ fontSize:12, color:T.textMd }}>Pin this announcement (shows at top)</span>
              </label>
            </div>
            <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:12 }}>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:T.textMd, cursor:'pointer' }}>Cancel</button>
              <button onClick={createAnnouncement} style={{ flex:1, padding:'10px', background:T.navy, border:'none', borderRadius:10, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>Post Announcement</button>
            </div>
          </div>
        </div>
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
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </Layout>
  );
}