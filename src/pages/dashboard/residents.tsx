import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { 
  UserPlus, QrCode, Download, Mail, Trash2, Edit, Search,
  X, CheckCircle, AlertCircle, Loader2, Users, Building2,
  Phone, Mail as MailIcon, Calendar, Home, Key, Award,
  TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Wrench, Megaphone,
  PlusCircle, LogOut, Menu, ChevronRight, Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import { signOut } from '../../lib/auth';

// Types
interface Resident {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cin_number: string | null;
  move_in_date: string | null;
  status: string;
  apartments?: {
    apartment_number: string;
    floor: number;
  };
}

interface Apartment {
  id: string;
  apartment_number: string;
  floor: number;
  status: string;
}

interface Building {
  id: string;
  name: string;
  city: string;
}

export default function ResidentsManagement() {
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddApartmentModal, setShowAddApartmentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<{ resident: Resident; qrDataUrl: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newApartment, setNewApartment] = useState({ apartment_number: '', floor: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cin_number: '',
    apartment_id: '',
    move_in_date: ''
  });

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

  const addApartment = async () => {
    if (!newApartment.apartment_number) {
      alert('Please enter apartment number');
      return;
    }

    const { error } = await supabase
      .from('apartments')
      .insert([{
        building_id: building?.id,
        apartment_number: newApartment.apartment_number,
        floor: parseInt(newApartment.floor) || 0,
        status: 'vacant'
      }]);

    if (error) {
      alert('Error adding apartment: ' + error.message);
    } else {
      setShowAddApartmentModal(false);
      setNewApartment({ apartment_number: '', floor: '' });
      if (building) {
        await fetchApartments(building.id);
      }
      alert('Apartment added successfully!');
    }
  };

  const generateQRCode = async (resident: Resident) => {
    const token = `${resident.id}-${Date.now()}`;
    const qrDataUrl = await QRCode.toDataURL(token);
    
    await supabase.from('qr_codes').insert([{
      resident_id: resident.id,
      qr_token: token,
      qr_image: qrDataUrl,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }]);

    return { token, qrDataUrl };
  };

  const addResident = async () => {
    if (!formData.apartment_id) {
      alert('Please select an apartment');
      return;
    }
    
    if (!formData.full_name) {
      alert('Please enter resident name');
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

      const { qrDataUrl } = await generateQRCode(resident);
      setShowQRModal({ resident, qrDataUrl });
      
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

  const sendQRByEmail = async (resident: Resident, qrDataUrl: string) => {
    alert(`QR code would be sent to ${resident.email}`);
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
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const filteredResidents = residents.filter((resident: Resident) =>
    resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resident.email && resident.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const occupancyRate = apartments.length + residents.length > 0 
    ? (residents.length / (apartments.length + residents.length)) * 100 
    : 0;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'residents', label: 'Residents', icon: Users, href: '/dashboard/residents' },
    { id: 'payments', label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/dashboard/maintenance' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, href: '/dashboard/announcements' },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode, href: '/dashboard/qr-codes' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Same as Dashboard */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-950 shadow-2xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-blue-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-white tracking-tight">SYNDIX</p>
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">Residents</p>
              </div>
            </div>
          </div>

          {/* Building Info */}
          <div className="mx-3 mt-4 p-3 rounded-xl bg-blue-800/30 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 size={12} className="text-blue-300" />
              <p className="text-[10px] font-medium text-blue-300 uppercase">Current Building</p>
            </div>
            <p className="font-bold text-white text-sm">{building?.name}</p>
            <p className="text-[10px] text-blue-300 mt-1">{building?.city}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'residents';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500' 
                      : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'}`}
                >
                  <Icon size={16} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-blue-800/50">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all">
              <LogOut size={16} />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Residents Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage building residents and generate QR access codes</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users size={18} className="text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{residents.length}</p>
                    <p className="text-xs text-slate-500">Total Residents</p>
                  </div>
                </div>
                <TrendingUp size={16} className="text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Building2 size={18} className="text-green-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{apartments.length}</p>
                  <p className="text-xs text-slate-500">Vacant Apartments</p>
                </div>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${100 - occupancyRate}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <QrCode size={18} className="text-amber-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{residents.length}</p>
                  <p className="text-xs text-slate-500">QR Codes Ready</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Award size={18} className="text-purple-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{Math.round(occupancyRate)}%</p>
                  <p className="text-xs text-slate-500">Occupancy Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning if no apartments */}
          {apartments.length === 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No vacant apartments available</p>
                  <p className="text-xs text-amber-600">Please add apartments before adding residents</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddApartmentModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition"
              >
                <PlusCircle size={16} />
                Add Apartment
              </button>
            </div>
          )}

          {/* Search and Add Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddApartmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  <PlusCircle size={18} />
                  Add Apartment
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition shadow-sm"
                  disabled={apartments.length === 0}
                >
                  <UserPlus size={18} />
                  Add Resident
                </button>
              </div>
            </div>
          </div>

          {/* Residents Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Resident</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Apartment</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Move-in Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">QR Code</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Users size={40} className="text-slate-300" />
                          <p>No residents found. Click "Add Resident" to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map((resident) => (
                      <tr key={resident.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-medium text-slate-800">{resident.full_name}</p>
                            <p className="text-xs text-slate-400">CIN: {resident.cin_number || '-'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Apt {resident.apartments?.apartment_number}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">Floor {resident.apartments?.floor}</p>
                        </td>
                        <td className="px-5 py-3">
                          {resident.email && <p className="text-sm flex items-center gap-1"><MailIcon size={12} /> {resident.email}</p>}
                          {resident.phone && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={12} /> {resident.phone}</p>}
                          {!resident.email && !resident.phone && <span className="text-xs text-slate-400">-</span>}
                        </td>
                        <td className="px-5 py-3 text-sm">
                          {resident.move_in_date ? new Date(resident.move_in_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={async () => {
                              const { qrDataUrl } = await generateQRCode(resident);
                              setShowQRModal({ resident, qrDataUrl });
                            }}
                            className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                            title="Generate QR Code"
                          >
                            <QrCode size={16} />
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition" title="Edit">
                              <Edit size={14} />
                            </button>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Apartment Modal */}
      {showAddApartmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Add New Apartment</h2>
                <p className="text-xs text-slate-500 mt-0.5">Create a new apartment unit</p>
              </div>
              <button onClick={() => setShowAddApartmentModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apartment Number *</label>
                <input
                  type="text"
                  value={newApartment.apartment_number}
                  onChange={(e) => setNewApartment({ ...newApartment, apartment_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 101, A101, 1A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
                <input
                  type="number"
                  value={newApartment.floor}
                  onChange={(e) => setNewApartment({ ...newApartment, floor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowAddApartmentModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={addApartment} className="flex-1 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">Add Apartment</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resident Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Add New Resident</h2>
                <p className="text-xs text-slate-500 mt-0.5">Fill in the resident information</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="resident@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CIN Number</label>
                <input
                  type="text"
                  value={formData.cin_number}
                  onChange={(e) => setFormData({ ...formData, cin_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="National ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apartment *</label>
                <select
                  value={formData.apartment_id}
                  onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an apartment</option>
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      Apartment {apt.apartment_number} - Floor {apt.floor}
                    </option>
                  ))}
                </select>
                {apartments.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No apartments available. Please add an apartment first.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Move-in Date</label>
                <input
                  type="date"
                  value={formData.move_in_date}
                  onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button 
                onClick={addResident} 
                disabled={!formData.apartment_id || !formData.full_name || apartments.length === 0}
                className="flex-1 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                Add Resident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full text-center p-6">
            <div className="mb-4">
              <CheckCircle size={48} className="text-green-500 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">QR Code Generated!</h2>
            <p className="text-slate-500 mb-4">For {showQRModal.resident.full_name}</p>
            <div className="bg-slate-100 p-4 rounded-xl mb-4">
              <img src={showQRModal.qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => downloadQR(showQRModal.qrDataUrl, showQRModal.resident.full_name)}
                className="flex-1 py-2 bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 transition"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={() => sendQRByEmail(showQRModal.resident, showQRModal.qrDataUrl)}
                className="flex-1 py-2 border border-slate-200 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition"
              >
                <Mail size={16} /> Send Email
              </button>
            </div>
            <button onClick={() => setShowQRModal(null)} className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}