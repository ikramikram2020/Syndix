import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';

import { 
  Home, Plus, Edit, Trash2, Building2, X,
  CheckCircle, AlertCircle
} from 'lucide-react';



interface Apartment {
  id: string;
  apartment_number: string;
  floor: number;
  status: string;
  monthly_fee: number;
  resident_id: string | null;
  residents?: {
    full_name: string;
  };
}

interface Building {
  id: string;
  name: string;
  monthly_fee: number;
}

export default function ApartmentsManagement() {
  const router = useRouter();
  const { building_id } = router.query;
  const [building, setBuilding] = useState<Building | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [formData, setFormData] = useState({
    apartment_number: '',
    floor: '',
    monthly_fee: '',
    status: 'vacant'
  });

  useEffect(() => {
    if (building_id) {
      fetchBuildingAndApartments();
    } else {
      fetchUserBuildings();
    }
  }, [building_id]);

  const fetchUserBuildings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('buildings')
        .select('id, name')
        .eq('syndic_id', user.id);
      
      if (data && data.length > 0) {
        router.push(`/dashboard/apartments?building_id=${data[0].id}`);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchBuildingAndApartments = async () => {
    setLoading(true);
    
    const { data: buildingData } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', building_id)
      .single();
    setBuilding(buildingData);

    const { data: apartmentsData } = await supabase
      .from('apartments')
      .select('*, residents(full_name)')
      .eq('building_id', building_id)
      .order('apartment_number', { ascending: true });
    setApartments(apartmentsData || []);
    
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.apartment_number) {
      alert('Please enter apartment number');
      return;
    }

    if (editingApartment) {
      const { error } = await supabase
        .from('apartments')
        .update({
          apartment_number: formData.apartment_number,
          floor: parseInt(formData.floor) || 0,
          monthly_fee: parseFloat(formData.monthly_fee) || building?.monthly_fee || 0,
          status: formData.status
        })
        .eq('id', editingApartment.id);

      if (error) {
        alert('Error updating apartment: ' + error.message);
      } else {
        alert('Apartment updated successfully!');
      }
    } else {
      const { error } = await supabase
        .from('apartments')
        .insert([{
          building_id: building_id,
          apartment_number: formData.apartment_number,
          floor: parseInt(formData.floor) || 0,
          monthly_fee: parseFloat(formData.monthly_fee) || building?.monthly_fee || 0,
          status: 'vacant'
        }]);

      if (error) {
        alert('Error creating apartment: ' + error.message);
      } else {
        alert('Apartment created successfully!');
      }
    }

    setShowModal(false);
    resetForm();
    await fetchBuildingAndApartments();
  };

  const deleteApartment = async (id: string) => {
    if (confirm('Are you sure? This will remove all data associated with this apartment.')) {
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting apartment: ' + error.message);
      } else {
        alert('Apartment deleted successfully');
        await fetchBuildingAndApartments();
      }
    }
  };

  const editApartment = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setFormData({
      apartment_number: apartment.apartment_number,
      floor: apartment.floor.toString(),
      monthly_fee: apartment.monthly_fee?.toString() || '',
      status: apartment.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingApartment(null);
    setFormData({
      apartment_number: '',
      floor: '',
      monthly_fee: '',
      status: 'vacant'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'occupied') {
      return {
        bg: T.greenLight,
        text: '#057A55',
        icon: <CheckCircle size={10} />,
        label: 'Occupied'
      };
    } else {
      return {
        bg: T.tealLight,
        text: T.teal,
        icon: <Home size={10} />,
        label: 'Vacant'
      };
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

  if (!building && !building_id) {
    return (
      <div style={{ minHeight:'100vh', background: T.canvasBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <Building2 size={48} color={T.textSm} style={{ margin:'0 auto 16px' }} />
          <h2 style={{ fontSize:20, fontWeight:700, color: T.navy, marginBottom:8 }}>No Building Selected</h2>
          <p style={{ color: T.textSm, marginBottom:16 }}>Please select a building first</p>
          <button onClick={() => router.push('/dashboard/buildings')} style={{ padding:'10px 24px', background: T.navy, border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Go to Buildings</button>
        </div>
      </div>
    );
  }

  const stats = {
    total: apartments.length,
    occupied: apartments.filter(a => a.status === 'occupied').length,
    vacant: apartments.filter(a => a.status === 'vacant').length
  };

  return (
    <Layout title="Apartments" subtitle={`Manage apartments in ${building?.name}`}>
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
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Property Units</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Apartments 🏠
            </h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>
              {building?.name} · {stats.occupied} occupied, {stats.vacant} vacant
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
            <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>Add Apartment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        <div style={{ background:T.white, borderRadius:16, padding:16, border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#EEF1FB', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Home size={18} color={T.navy} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.total}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Total Apartments</p>
            </div>
          </div>
        </div>
        
        <div style={{ background:T.white, borderRadius:16, padding:16, border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:T.greenLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle size={18} color={T.green} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.occupied}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Occupied</p>
            </div>
          </div>
        </div>
        
        <div style={{ background:T.white, borderRadius:16, padding:16, border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(27,43,107,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:T.orangeLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Home size={18} color={T.orange} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>{stats.vacant}</p>
              <p style={{ margin:0, fontSize:11, color:T.textSm }}>Vacant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Apartments Grid */}
      <div className="fade-up-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {apartments.length === 0 ? (
          <div style={{
            gridColumn:'span 3', background: T.white, borderRadius:18, padding:'48px 20px', textAlign:'center',
            border:`1px solid ${T.border}`
          }}>
            <Home size={48} color={T.textSm} style={{ margin:'0 auto 12px', display:'block' }} />
            <p style={{ margin:0, fontSize:13, color:T.textSm }}>No apartments yet</p>
            <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>Click "Add Apartment" to create one</p>
          </div>
        ) : (
          apartments.map((apartment) => {
            const statusStyle = getStatusBadge(apartment.status);
            return (
              <div key={apartment.id} style={{
                background: T.white, borderRadius:16, border:`1px solid ${T.border}`,
                overflow:'hidden', transition:'all 0.22s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(27,43,107,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ padding: 16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <Home size={16} color={T.teal} />
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.navy }}>Apt {apartment.apartment_number}</h3>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: T.textSm }}>Floor {apartment.floor}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button 
                        onClick={() => editApartment(apartment)}
                        style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textSm, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.teal; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSm; }}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => deleteApartment(apartment.id)}
                        style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textSm, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSm; }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: T.textSm }}>Monthly Fee:</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{(apartment.monthly_fee || building?.monthly_fee || 0).toLocaleString()} DZD</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize: 12, color: T.textSm }}>Status:</span>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap: 4,
                        padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:600,
                        background: statusStyle.bg, color: statusStyle.text
                      }}>
                        {statusStyle.icon}
                        {statusStyle.label}
                      </span>
                    </div>
                    {apartment.residents?.full_name && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize: 11, color: T.textSm }}>Resident:</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{apartment.residents.full_name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {apartment.status === 'vacant' && (
                    <button 
                      onClick={() => router.push(`/dashboard/residents?apartment_id=${apartment.id}`)}
                      style={{
                        width: '100%', marginTop: 8, padding: '6px 12px',
                        background: T.tealLight, border: 'none', borderRadius: 8,
                        fontSize: 11, fontWeight: 600, color: T.teal, cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.teal + '20'}
                      onMouseLeave={e => e.currentTarget.style.background = T.tealLight}
                    >
                      + Assign Resident
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,26,62,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:T.white, borderRadius:20, maxWidth:450, width:'100%' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:T.navy }}>
                  {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
                </h3>
                <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>
                  {editingApartment ? 'Update apartment information' : 'Create a new apartment unit'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ padding:6, borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}>
                <X size={18} color={T.textSm} />
              </button>
            </div>
            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Apartment Number *</label>
                <input
                  type="text"
                  value={formData.apartment_number}
                  onChange={(e) => setFormData({ ...formData, apartment_number: e.target.value })}
                  placeholder="e.g., 101, A101, 1A"
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="1"
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Monthly Fee (DZD)</label>
                <input
                  type="number"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                  placeholder={building?.monthly_fee?.toString() || '5000'}
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.teal}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
                <p style={{ fontSize:10, color: T.textSm, marginTop:4 }}>Leave empty to use building default ({building?.monthly_fee?.toLocaleString() || 5000} DZD)</p>
              </div>
              {editingApartment && (
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit', background:T.white }}
                    onFocus={e => e.currentTarget.style.borderColor = T.teal}
                    onBlur={e => e.currentTarget.style.borderColor = T.border}
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:12 }}>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:T.textMd, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} style={{ flex:1, padding:'10px', background:T.navy, border:'none', borderRadius:10, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>{editingApartment ? 'Update Apartment' : 'Create Apartment'}</button>
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