import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useResidentAuth } from '../../hooks/useResidentAuth';
import { 
  Megaphone, Pin, Bell, AlertCircle, Star, 
  Clock, ArrowLeft, Filter, Calendar
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

export default function ResidentAnnouncements() {
  const router = useRouter();
  const { resident } = useResidentAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (resident) {
      fetchAnnouncements();
    }
  }, [resident]);

  const fetchAnnouncements = async () => {
    if (!resident) return;
    setLoading(true);
    
    const { data: apartment } = await supabase
      .from('apartments')
      .select('building_id')
      .eq('apartment_number', resident.apartment_number)
      .single();
    
    if (apartment) {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('building_id', apartment.building_id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  const filteredAnnouncements = announcements.filter(ann => {
    if (filter === 'pinned') return ann.is_pinned;
    if (filter === 'urgent') return ann.priority === 'urgent';
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'urgent': return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Urgent' };
      case 'important': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Star, label: 'Important' };
      default: return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Bell, label: 'Normal' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Announcements</h1>
            <p className="text-blue-300 text-sm">Latest updates from your syndic</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 bg-blue-800/20 rounded-xl p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'pinned', label: 'Pinned' },
            { id: 'urgent', label: 'Urgent' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filter === tab.id ? 'bg-orange-500 text-white' : 'text-blue-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="px-5 space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center">
            <Megaphone size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400">No announcements yet</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const priority = getPriorityBadge(ann.priority);
            const PriorityIcon = priority.icon;
            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl p-4 ${ann.is_pinned ? 'border-l-4 border-l-orange-500' : ''}`}
              >
                {ann.is_pinned && (
                  <div className="flex items-center gap-1 mb-2">
                    <Pin size={12} className="text-orange-500" />
                    <span className="text-xs text-orange-500">Pinned</span>
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800 text-lg">{ann.title}</h3>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${priority.bg}`}>
                    <PriorityIcon size={10} className={priority.text} />
                    <span className={`text-xs font-medium ${priority.text}`}>{priority.label}</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">{ann.content}</p>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                  <Calendar size={12} className="text-slate-400" />
                  <p className="text-xs text-slate-400">{new Date(ann.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}