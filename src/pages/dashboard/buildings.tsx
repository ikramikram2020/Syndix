import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';

import { 
  Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, DollarSign, Home, X
} from 'lucide-react';

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  total_floors: number;
  total_apartments: number;
  monthly_fee: number;
  contact_phone: string;
  contact_email: string;
  created_at: string;
}

export default function BuildingsManagement() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    total_floors: '',
    total_apartments: '',
    monthly_fee: '',
    contact_phone: '',
    contact_email: ''
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('buildings')
        .select('*')
        .eq('syndic_id', user.id)
        .order('created_at', { ascending: false });
      setBuildings(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.city) {
      alert('Please fill required fields');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (editingBuilding) {
      const { error } = await supabase
        .from('buildings')
        .update({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          total_floors: parseInt(formData.total_floors) || 0,
          total_apartments: parseInt(formData.total_apartments) || 0,
          monthly_fee: parseFloat(formData.monthly_fee) || 0,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBuilding.id);

      if (error) {
        alert('Error updating building: ' + error.message);
      } else {
        alert('Building updated successfully!');
      }
    } else {
      const { error } = await supabase
        .from('buildings')
        .insert([{
          syndic_id: user?.id,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          total_floors: parseInt(formData.total_floors) || 0,
          total_apartments: parseInt(formData.total_apartments) || 0,
          monthly_fee: parseFloat(formData.monthly_fee) || 0,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
        }]);

      if (error) {
        alert('Error creating building: ' + error.message);
      } else {
        alert('Building created successfully!');
      }
    }

    setShowModal(false);
    resetForm();
    await fetchBuildings();
  };

  const deleteBuilding = async (id: string) => {
    if (confirm('Are you sure? This will delete all apartments, residents, and data for this building.')) {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting building: ' + error.message);
      } else {
        alert('Building deleted successfully');
        await fetchBuildings();
      }
    }
  };

  const editBuilding = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      address: building.address || '',
      city: building.city || '',
      postal_code: building.postal_code || '',
      total_floors: building.total_floors.toString(),
      total_apartments: building.total_apartments.toString(),
      monthly_fee: building.monthly_fee.toString(),
      contact_phone: building.contact_phone || '',
      contact_email: building.contact_email || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBuilding(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      postal_code: '',
      total_floors: '',
      total_apartments: '',
      monthly_fee: '',
      contact_phone: '',
      contact_email: ''
    });
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
    <Layout title="Buildings Management" subtitle="Manage your properties">
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
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Property Portfolio</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Buildings 🏢
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {buildings.length} {buildings.length === 1 ? 'property' : 'properties'} in your portfolio
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{
              padding:'8px 20px', borderRadius:30,
              background: T.orange, border:'none',
              display:'flex', alignItems:'center', gap:8, cursor:'pointer',
              boxShadow:'0 2px 8px rgba(245,166,35,0.3)'
            }}>
            <Plus size={16} color="#fff" />
            <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>Add Building</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="fade-up-2" style={{
        background:T.white, borderRadius:12, padding:'12px 20px', marginBottom:20,
        border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Total Buildings</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.navy }}>{buildings.length}</p>
          </div>
          <div style={{ width:1, height:30, background:T.border }} />
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Total Apartments</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.navy }}>{buildings.reduce((sum, b) => sum + b.total_apartments, 0)}</p>
          </div>
          <div style={{ width:1, height:30, background:T.border }} />
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Monthly Revenue</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.green }}>{buildings.reduce((sum, b) => sum + (b.monthly_fee * b.total_apartments), 0).toLocaleString()} DZD</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:T.green }} />
          <span style={{ fontSize:11, color:T.textMd }}>All buildings active</span>
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="fade-up-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
        {buildings.length === 0 ? (
          <div style={{
            gridColumn:'span 3', background: T.white, borderRadius:18, padding:'48px 20px', textAlign:'center',
            border:`1px solid ${T.border}`
          }}>
            <Building2 size={48} color={T.textSm} style={{ margin:'0 auto 12px', display:'block' }} />
            <p style={{ margin:0, fontSize:13, color:T.textSm }}>No buildings yet</p>
            <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>Click "Add Building" to create one</p>
          </div>
        ) : (
          buildings.map((building) => (
            <div key={building.id} style={{
              background: T.white, borderRadius:18, border:`1px solid ${T.border}`,
              overflow:'hidden', transition:'all 0.22s', cursor:'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(27,43,107,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ padding: 20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `linear-gradient(135deg, ${T.navy}10, ${T.teal}20)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Building2 size={22} color={T.navy} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.navy }}>{building.name}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: T.textSm }}>{building.city}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button 
                      onClick={() => editBuilding(building)}
                      style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textSm, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.teal; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSm; }}
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => deleteBuilding(building.id)}
                      style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textSm, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSm; }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {building.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textMd }}>
                      <MapPin size={12} color={T.textSm} />
                      <span>{building.address}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textMd }}>
                    <Home size={12} color={T.textSm} />
                    <span>{building.total_apartments} apartments • {building.total_floors} floors</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textMd }}>
                    <DollarSign size={12} color={T.textSm} />
                    <span><strong style={{ color: T.navy }}>{building.monthly_fee.toLocaleString()} DZD</strong> / month per unit</span>
                  </div>
                  {building.contact_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textMd }}>
                      <Phone size={12} color={T.textSm} />
                      <span>{building.contact_phone}</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => router.push(`/dashboard/apartments?building_id=${building.id}`)}
                  style={{
                    width: '100%', padding: '8px 16px', background: 'transparent',
                    border: `1px solid ${T.border}`, borderRadius: 10,
                    fontSize: 12, fontWeight: 600, color: T.teal, cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.tealLight; e.currentTarget.style.borderColor = T.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.border; }}
                >
                  View Apartments →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,26,62,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:T.white, borderRadius:20, maxWidth:500, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:T.white }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:T.navy }}>
                  {editingBuilding ? 'Edit Building' : 'Add New Building'}
                </h3>
                <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>
                  {editingBuilding ? 'Update building information' : 'Create a new property'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ padding:6, borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}>
                <X size={18} color={T.textSm} />
              </button>
            </div>
            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Building Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sunshine Tower"
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Algiers"
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="16000"
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Total Floors</label>
                  <input
                    type="number"
                    value={formData.total_floors}
                    onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                    placeholder="5"
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Total Apartments</label>
                  <input
                    type="number"
                    value={formData.total_apartments}
                    onChange={(e) => setFormData({ ...formData, total_apartments: e.target.value })}
                    placeholder="20"
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  />
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Monthly Fee (DZD)</label>
                <input
                  type="number"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                  placeholder="5000"
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+213 5XX XXX XXX"
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="admin@building.com"
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:12 }}>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:T.textMd, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} style={{ flex:1, padding:'10px', background:T.navy, border:'none', borderRadius:10, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>{editingBuilding ? 'Update Building' : 'Create Building'}</button>
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