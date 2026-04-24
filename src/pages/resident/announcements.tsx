import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { T } from '../../styles/theme';
import { 
  Megaphone, Pin, Bell, AlertCircle, Star, 
  Clock, ArrowLeft, Filter, Calendar, Sparkles,
  ChevronRight, Home
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
  building_id: string;
}

export default function ResidentAnnouncements() {
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [buildingName, setBuildingName] = useState('');

  // Get resident from localStorage directly
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
      fetchBuildingAndAnnouncements(resident);
    } catch (err) {
      console.error('Error parsing resident:', err);
      setLoading(false);
      router.push('/resident');
    }
  }, []);

  const fetchBuildingAndAnnouncements = async (residentData: any) => {
    if (!residentData) return;
    setLoading(true);
    
    try {
      // Get resident's apartment and building using apartment_number
      const { data: apartment, error: aptError } = await supabase
        .from('apartments')
        .select('building_id')
        .eq('apartment_number', residentData.apartment_number)
        .maybeSingle();
      
      if (aptError) {
        console.error('Error fetching apartment:', aptError);
        setLoading(false);
        return;
      }
      
      if (apartment) {
        // Fetch building name
        const { data: building, error: buildingError } = await supabase
          .from('buildings')
          .select('name')
          .eq('id', apartment.building_id)
          .maybeSingle();
        
        if (!buildingError && building) {
          setBuildingName(building.name);
        }
        
        // Fetch announcements for this building
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('building_id', apartment.building_id)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching announcements:', error);
        } else {
          setAnnouncements(data || []);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    if (filter === 'pinned') return ann.is_pinned;
    if (filter === 'urgent') return ann.priority === 'urgent';
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'urgent': 
        return { bg: T.redLight, text: T.red, icon: AlertCircle, label: 'Urgent' };
      case 'important': 
        return { bg: T.orangeLight, text: T.orangeDeep, icon: Star, label: 'Important' };
      default: 
        return { bg: T.tealLight, text: T.teal, icon: Bell, label: 'Normal' };
    }
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
          <p style={{ color: '#fff' }}>Loading announcements...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!resident) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, #0A1A3E, #0D2B5E)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Megaphone size={48} color="rgba(255,255,255,0.3)" />
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>Please login to view announcements</p>
          <button 
            onClick={() => router.push('/resident')} 
            style={{ marginTop: 16, padding: '10px 24px', background: T.orange, border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer' }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.canvasBg,
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
      paddingBottom: 80
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .fade-in-up {
          animation: fadeInUp 0.5s ease both;
        }
        .slide-in {
          animation: slideIn 0.4s ease both;
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
        padding: '24px 20px 32px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
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
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>STAY INFORMED</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Announcements</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{buildingName || 'Your Building'}</p>
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            padding: '12px 16px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={16} color={T.orange} />
              <span style={{ fontSize: 13, color: '#fff' }}>{announcements.length} Announcements</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pin size={14} color={T.orange} />
              <span style={{ fontSize: 13, color: '#fff' }}>{announcements.filter(a => a.is_pinned).length} Pinned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          background: T.white, 
          borderRadius: 14, 
          padding: 4, 
          border: `1px solid ${T.border}`,
          boxShadow: '0 2px 8px rgba(5,15,36,0.05)'
        }}>
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'pinned', label: 'Pinned', icon: Pin },
            { id: 'urgent', label: 'Urgent', icon: AlertCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: isActive ? `linear-gradient(135deg, #0A1A3E, #0D2B5E)` : 'transparent',
                  border: 'none',
                  borderRadius: 10,
                  color: isActive ? '#fff' : T.textMd,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s'
                }}
              >
                {Icon && <Icon size={14} color={isActive ? '#fff' : T.textMd} />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ padding: '20px' }}>
        {filteredAnnouncements.length === 0 ? (
          <div className="fade-in-up" style={{
            background: T.white,
            borderRadius: 24,
            padding: '48px 20px',
            textAlign: 'center',
            border: `1px solid ${T.border}`
          }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Megaphone size={32} color={T.textSm} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>No Announcements</h3>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: T.textSm }}>Check back later for updates from your syndic</p>
          </div>
        ) : (
          <>
            {/* Pinned Announcements Section */}
            {pinnedAnnouncements.length > 0 && filter === 'all' && (
              <div className="slide-in" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Pin size={16} color={T.orange} />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.navy }}>Pinned Announcements</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pinnedAnnouncements.map((ann) => (
                    <AnnouncementCard key={ann.id} announcement={ann} getPriorityBadge={getPriorityBadge} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Announcements Section */}
            {regularAnnouncements.length > 0 && (
              <div className="fade-in-up">
                {(filter === 'all' && pinnedAnnouncements.length > 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Bell size={16} color={T.teal} />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.navy }}>Recent Updates</h3>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {regularAnnouncements.map((ann) => (
                    <AnnouncementCard key={ann.id} announcement={ann} getPriorityBadge={getPriorityBadge} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation Hint */}
      <div style={{ textAlign: 'center', padding: '16px 20px' }}>
        <p style={{ fontSize: 11, color: T.textSm, margin: 0 }}>
          Stay connected with your building community
        </p>
      </div>
    </div>
  );
}

// Announcement Card Component
function AnnouncementCard({ announcement, getPriorityBadge }: { announcement: Announcement; getPriorityBadge: (priority: string) => any }) {
  const [expanded, setExpanded] = useState(false);
  const priority = getPriorityBadge(announcement.priority);
  const PriorityIcon = priority.icon;
  const isLongContent = announcement.content.length > 150;

  return (
    <div 
      className="card-hover"
      style={{
        background: T.white,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        borderLeft: announcement.is_pinned ? `4px solid ${T.orange}` : `1px solid ${T.border}`,
        overflow: 'hidden',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            {announcement.is_pinned && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <Pin size={12} color={T.orange} />
                <span style={{ fontSize: 10, fontWeight: 600, color: T.orange }}>PINNED</span>
              </div>
            )}
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.navy, lineHeight: 1.3 }}>
              {announcement.title}
            </h3>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            background: priority.bg,
            flexShrink: 0,
            marginLeft: 12
          }}>
            <PriorityIcon size={10} color={priority.text} />
            <span style={{ fontSize: 10, fontWeight: 600, color: priority.text }}>{priority.label}</span>
          </div>
        </div>

        {/* Content */}
        <p style={{ 
          margin: '0 0 12px', 
          fontSize: 13, 
          color: T.textMd, 
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap'
        }}>
          {expanded || !isLongContent ? announcement.content : `${announcement.content.substring(0, 150)}...`}
        </p>

        {/* Read More Toggle */}
        {isLongContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: T.teal,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {expanded ? 'Show less' : 'Read more'}
            <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
        )}

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          paddingTop: 12, 
          borderTop: `1px solid ${T.border}`,
          fontSize: 11,
          color: T.textSm
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} />
            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            <span>{new Date(announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}