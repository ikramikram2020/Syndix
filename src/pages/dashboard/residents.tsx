import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { T } from '../../styles/theme';

import { 
  UserPlus, QrCode, Download, Mail, Trash2, Edit, Search,
  X, CheckCircle, Users, Building2, Phone, Mail as MailIcon, AlertCircle
} from 'lucide-react';

interface Resident {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cin_number: string | null;
  move_in_date: string | null;
  status: string;
  apartment_id: string | null;
  apartments?: {
    apartment_number: string;
    floor: number;
  };
}

interface Building {
  id: string;
  name: string;
  city: string;
  monthly_fee: number;
}

interface Apartment {
  id: string;
  apartment_number: string;
  floor: number;
  status: string;
}

export default function ResidentsManagement() {
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [showQRModal, setShowQRModal] = useState<{ resident: Resident; qrDataUrl: string; qrUrl: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cin_number: '',
    apartment_id: '',
    move_in_date: ''
  });

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  };

  useEffect(() => {
    fetchBuildingAndData();
  }, []);

  const fetchBuildingAndData = async () => {
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
        await fetchResidents(buildingData.id);
        await fetchApartments(buildingData.id);
      }
    }
    setLoading(false);
  };

  const fetchResidents = async (buildingId: string) => {
    const { data } = await supabase
      .from('residents')
      .select('*, apartments(apartment_number, floor)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false });
    setResidents(data || []);
  };

  const fetchApartments = async (buildingId: string) => {
    const { data } = await supabase
      .from('apartments')
      .select('*')
      .eq('building_id', buildingId)
      .is('resident_id', null);
    setApartments(data || []);
  };

  const generateQRCodeForDisplay = async (resident: Resident) => {
    try {
      setLoading(true);
      const baseUrl = getBaseUrl();
      
      const response = await fetch('/api/resident/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentId: resident.id,
          residentName: resident.full_name,
          buildingId: building?.id,
          apartmentNumber: resident.apartments?.apartment_number,
          baseUrl: baseUrl
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert('Error generating QR code: ' + (data.error || 'Unknown error'));
        return;
      }

      setShowQRModal({ 
        resident, 
        qrDataUrl: data.qrCode, 
        qrUrl: data.accessUrl 
      });
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating QR code');
    } finally {
      setLoading(false);
    }
  };

  const sendQRByEmail = async (resident: Resident, qrDataUrl: string, qrUrl: string) => {
    if (!resident.email) {
      alert('This resident has no email address. Please add an email first.');
      return;
    }
    
    setSendingEmail(true);
    
    try {
      const response = await fetch('/api/resident/send-qr-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resident.email,
          residentName: resident.full_name,
          qrDataUrl: qrDataUrl,
          accessUrl: qrUrl,
          buildingName: building?.name,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`✅ QR code sent successfully to ${resident.email}!`);
      } else {
        alert(`❌ Failed to send email: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const openEditModal = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({
      full_name: resident.full_name || '',
      email: resident.email || '',
      phone: resident.phone || '',
      cin_number: resident.cin_number || '',
      apartment_id: resident.apartment_id || '',
      move_in_date: resident.move_in_date || ''
    });
    setShowEditModal(true);
  };

  const updateResident = async () => {
    if (!formData.full_name) {
      alert('Please enter resident name');
      return;
    }
    
    if (!formData.apartment_id) {
      alert('Please select an apartment');
      return;
    }
    
    setLoading(true);
    
    const oldApartmentId = editingResident?.apartment_id;
    
    const { error } = await supabase
      .from('residents')
      .update({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        cin_number: formData.cin_number || null,
        apartment_id: formData.apartment_id,
        move_in_date: formData.move_in_date || null
      })
      .eq('id', editingResident!.id);

    if (error) {
      alert('Error updating resident: ' + error.message);
      setLoading(false);
      return;
    }
    
    if (oldApartmentId && oldApartmentId !== formData.apartment_id) {
      await supabase
        .from('apartments')
        .update({ resident_id: null, status: 'vacant' })
        .eq('id', oldApartmentId);
    }
    
    await supabase
      .from('apartments')
      .update({ resident_id: editingResident!.id, status: 'occupied' })
      .eq('id', formData.apartment_id);
    
    await fetchResidents(building!.id);
    await fetchApartments(building!.id);
    setShowEditModal(false);
    resetForm();
    alert('Resident updated successfully!');
    setLoading(false);
  };

  const deleteResident = async (id: string) => {
    if (confirm('⚠️ Are you sure? This will delete ALL data for this resident.')) {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error: ' + error.message);
      } else {
        await fetchResidents(building!.id);
        await fetchApartments(building!.id);
        alert('Resident deleted successfully!');
      }
    }
  };

  const addResident = async () => {
    if (!formData.full_name) {
      alert('Please enter resident name');
      return;
    }
    
    if (!formData.apartment_id) {
      alert('Please select an apartment');
      return;
    }
    
    setLoading(true);
    
    const { data: resident, error } = await supabase
      .from('residents')
      .insert([{
        building_id: building?.id,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        cin_number: formData.cin_number || null,
        apartment_id: formData.apartment_id,
        move_in_date: formData.move_in_date || null
      }])
      .select()
      .single();

    if (error) {
      alert('Error adding resident: ' + error.message);
      setLoading(false);
    } else if (resident && building) {
      await supabase
        .from('apartments')
        .update({ resident_id: resident.id, status: 'occupied' })
        .eq('id', formData.apartment_id);
      
      try {
        const baseUrl = getBaseUrl();
        const response = await fetch('/api/resident/generate-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentId: resident.id,
            residentName: resident.full_name,
            buildingId: building.id,
            apartmentNumber: formData.apartment_id,
            baseUrl: baseUrl
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setShowQRModal({ 
            resident, 
            qrDataUrl: data.qrCode, 
            qrUrl: data.accessUrl 
          });
        }
      } catch (err) {
        console.error('QR generation error:', err);
      }
      
      await fetchResidents(building.id);
      await fetchApartments(building.id);
      setShowModal(false);
      resetForm();
    }
    setLoading(false);
  };

  const downloadQR = (qrDataUrl: string, residentName: string) => {
    const link = document.createElement('a');
    link.download = `QR-${residentName.replace(/\s/g, '-')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      cin_number: '',
      apartment_id: '',
      move_in_date: ''
    });
    setEditingResident(null);
  };

  const filteredResidents = residents.filter((resident: Resident) =>
    resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resident.email && resident.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background: T.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${T.orange}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Loading SYNDIX…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const stats = {
    total: residents.length,
    vacant: apartments.length
  };

  return (
    <Layout title="Residents Management" subtitle="Manage building residents and generate QR access codes">
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
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, fontWeight:600, textTransform:'uppercase' }}>Resident Portal</span>
            </div>
            <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>Resident Directory 📋</h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)' }}>{building?.name} · {residents.length} residents</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} style={{ padding:'8px 20px', borderRadius:30, background:T.orange, border:'none', display:'flex', alignItems:'center', gap:8, cursor:'pointer', boxShadow:'0 2px 8px rgba(245,166,35,0.3)' }}>
            <UserPlus size={16} color="#fff" />
            <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>Add Resident</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="fade-up-2" style={{ background:T.white, borderRadius:12, padding:'12px 20px', marginBottom:20, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Total Residents</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.navy }}>{stats.total}</p>
          </div>
          <div style={{ width:1, height:30, background:T.border }} />
          <div>
            <span style={{ fontSize:11, color:T.textSm }}>Vacant Apartments</span>
            <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.orange }}>{stats.vacant}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:T.green }} />
          <span style={{ fontSize:11, color:T.textMd }}>All residents active</span>
        </div>
      </div>

      {/* Warning if no apartments */}
      {apartments.length === 0 && (
        <div className="fade-up-2" style={{ marginBottom:20, padding:'12px 16px', borderRadius:12, background: T.orangeLight, border: `1px solid ${T.orange}30`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <AlertCircle size={16} color={T.orange} />
            <span style={{ fontSize:12, color: T.orangeDeep }}>No vacant apartments available. Please add apartments first.</span>
          </div>
          <button onClick={() => router.push('/dashboard/apartments')} style={{ padding:'4px 12px', background: T.orange, border:'none', borderRadius:8, color:'#fff', fontSize:11, cursor:'pointer' }}>Add Apartment →</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="fade-up-2" style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, padding:'16px 20px', marginBottom:20 }}>
        <div style={{ position:'relative' }}>
          <Search size={18} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:T.textSm }} />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width:'100%', padding:'10px 12px 10px 40px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
        </div>
      </div>

      {/* Residents Table */}
      <div className="fade-up-2" style={{ background:T.white, borderRadius:18, border:`1px solid ${T.border}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(27,43,107,0.04)' }}>
        <div className="table-container" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:T.surface, borderBottom:`1px solid ${T.border}` }}>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Resident</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Apartment</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Contact</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Move-in Date</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>QR Code</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T.textSm, textTransform:'uppercase', letterSpacing:1 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="row-hover" style={{ borderBottom:`1px solid ${T.border}` }}>
                  <td style={{ padding:'14px 20px' }}>
                    <div>
                      <p style={{ margin:0, fontSize:14, fontWeight:600, color:T.navy }}>{resident.full_name}</p>
                      <p style={{ margin:'2px 0 0', fontSize:11, color:T.textSm }}>CIN: {resident.cin_number || '—'}</p>
                    </div>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ display:'inline-flex', padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, background:`${T.teal}15`, color:T.teal }}>Apt {resident.apartments?.apartment_number || '—'}</span>
                    <p style={{ margin:'4px 0 0', fontSize:10, color:T.textSm }}>Floor {resident.apartments?.floor || '—'}</p>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    {resident.email && <p style={{ margin:0, fontSize:12, display:'flex', alignItems:'center', gap:4 }}><MailIcon size={11} color={T.textSm} /> {resident.email}</p>}
                    {resident.phone && <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm, display:'flex', alignItems:'center', gap:4 }}><Phone size={11} color={T.textSm} /> {resident.phone}</p>}
                    {!resident.email && !resident.phone && <span style={{ fontSize:11, color:T.textSm }}>—</span>}
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:12, color:T.textMd }}>{resident.move_in_date ? new Date(resident.move_in_date).toLocaleDateString() : '—'}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <button onClick={() => generateQRCodeForDisplay(resident)} style={{ padding:8, borderRadius:8, background:`${T.teal}10`, border:'none', cursor:'pointer' }} title="Generate QR Code">
                      <QrCode size={14} color={T.teal} />
                    </button>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEditModal(resident)} style={{ padding:6, borderRadius:6, background:'transparent', border:'none', cursor:'pointer', color:T.textSm }} title="Edit">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => deleteResident(resident.id)} style={{ padding:6, borderRadius:6, background:'transparent', border:'none', cursor:'pointer', color:T.textSm }} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filteredResidents.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={6} style={{ padding:'48px 20px', textAlign:'center' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <Users size={40} color={T.textSm} />
                      <p style={{ margin:0, fontSize:13, color:T.textSm }}>No residents found</p>
                      <button onClick={() => { resetForm(); setShowModal(true); }} style={{ marginTop:8, padding:'6px 16px', background:T.navy, border:'none', borderRadius:20, color:'#fff', fontSize:12, cursor:'pointer' }}>Add your first resident</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,26,62,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:T.white, borderRadius:20, maxWidth:500, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:T.white }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:T.navy }}>Add New Resident</h3>
                <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>Fill in the resident information</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ padding:6, borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}><X size={18} color={T.textSm} /></button>
            </div>
            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Full Name *</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Enter full name" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="resident@example.com" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+213 XX XXX XXX" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>CIN Number</label>
                <input type="text" value={formData.cin_number} onChange={(e) => setFormData({ ...formData, cin_number: e.target.value })} placeholder="National ID" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Apartment *</label>
                <select value={formData.apartment_id} onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', background:T.white }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border}>
                  <option value="">Select an apartment</option>
                  {apartments.map((apt) => (<option key={apt.id} value={apt.id}>Apartment {apt.apartment_number} - Floor {apt.floor}</option>))}
                </select>
                {apartments.length === 0 && <p style={{ fontSize:11, color:T.orange, marginTop:4 }}>No apartments available. Please add apartments first.</p>}
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Move-in Date</label>
                <input type="date" value={formData.move_in_date} onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} />
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:12 }}>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:T.textMd, cursor:'pointer' }}>Cancel</button>
              <button onClick={addResident} disabled={!formData.full_name || !formData.apartment_id || apartments.length === 0} style={{ flex:1, padding:'10px', background: (!formData.full_name || !formData.apartment_id || apartments.length === 0) ? T.textSm : T.navy, border:'none', borderRadius:10, fontSize:13, fontWeight:600, color:'#fff', cursor: (!formData.full_name || !formData.apartment_id || apartments.length === 0) ? 'not-allowed' : 'pointer' }}>Add Resident</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {showEditModal && editingResident && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,26,62,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:T.white, borderRadius:20, maxWidth:500, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:T.white }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:T.navy }}>Edit Resident</h3>
                <p style={{ margin:'4px 0 0', fontSize:11, color:T.textSm }}>Update resident information</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ padding:6, borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}><X size={18} color={T.textSm} /></button>
            </div>
            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Full Name *</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Enter full name" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="resident@example.com" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+213 XX XXX XXX" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>CIN Number</label>
                <input type="text" value={formData.cin_number} onChange={(e) => setFormData({ ...formData, cin_number: e.target.value })} placeholder="National ID" style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Apartment *</label>
                <select value={formData.apartment_id} onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none', background:T.white }} onFocus={e => e.currentTarget.style.borderColor = T.teal} onBlur={e => e.currentTarget.style.borderColor = T.border}>
                  <option value="">Select an apartment</option>
                  {apartments.map((apt) => (<option key={apt.id} value={apt.id}>Apartment {apt.apartment_number} - Floor {apt.floor}</option>))}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:T.textMd, marginBottom:6 }}>Move-in Date</label>
                <input type="date" value={formData.move_in_date} onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, outline:'none' }} />
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:12 }}>
              <button onClick={() => setShowEditModal(false)} style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:T.textMd, cursor:'pointer' }}>Cancel</button>
              <button onClick={updateResident} disabled={!formData.full_name || !formData.apartment_id} style={{ flex:1, padding:'10px', background: (!formData.full_name || !formData.apartment_id) ? T.textSm : T.navy, border:'none', borderRadius:10, fontSize:13, fontWeight:600, color:'#fff', cursor: (!formData.full_name || !formData.apartment_id) ? 'not-allowed' : 'pointer' }}>Update Resident</button>
            </div>
          </div>
        </div>
      )}

     {/* QR Code Modal */}
{showQRModal && (
  <div style={{ position:'fixed', inset:0, background:'rgba(15,26,62,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
    <div style={{ background:T.white, borderRadius:24, maxWidth:400, width:'100%', textAlign:'center' }}>
      <div style={{ padding:24 }}>
        {/* Success Icon */}
        <div style={{ marginBottom:16 }}>
          <CheckCircle size={56} color={T.green} style={{ margin:'0 auto' }} />
        </div>
        
        <h3 style={{ margin:'0 0 8px', fontSize:20, fontWeight:700, color:T.navy }}>QR Code Generated!</h3>
        <p style={{ margin:'0 0 20px', fontSize:13, color:T.textMd }}>For {showQRModal.resident.full_name}</p>
        
        {/* QR Code Image */}
        <div style={{ background:T.surface, padding:20, borderRadius:16, marginBottom:20 }}>
          <img src={showQRModal.qrDataUrl} alt="QR Code" style={{ width:180, height:180, margin:'0 auto', display:'block' }} />
        </div>
        
        {/* Buttons */}
        <div style={{ display:'flex', gap:12 }}>
          <button 
            onClick={() => downloadQR(showQRModal.qrDataUrl, showQRModal.resident.full_name)} 
            style={{ flex:1, padding:'12px', background:T.navy, border:'none', borderRadius:12, fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
          >
            <Download size={16} /> Download
          </button>
          <button 
            onClick={() => sendQRByEmail(showQRModal.resident, showQRModal.qrDataUrl, showQRModal.qrUrl)} 
            disabled={sendingEmail} 
            style={{ flex:1, padding:'12px', background:sendingEmail ? T.textSm : T.teal, border:'none', borderRadius:12, fontSize:14, fontWeight:600, color:'#fff', cursor:sendingEmail ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
          >
            {sendingEmail ? 'Sending...' : <><Mail size={16} /> Send Email</>}
          </button>
        </div>
        
        {/* Close button */}
        <button 
          onClick={() => setShowQRModal(null)} 
          style={{ marginTop:16, background:'transparent', border:'none', fontSize:13, color:T.textSm, cursor:'pointer', padding:8 }}
        >
          Close
        </button>
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