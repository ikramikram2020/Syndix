import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { 
  Home, Plus, Edit, Trash2, Eye, Search, Users,
  Building2, CreditCard, Wrench, Megaphone, QrCode,
  LogOut, Menu, X, ChevronRight, Sparkles, MapPin,
  CheckCircle, XCircle, AlertCircle
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      // If no building_id, show building selector
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
        // Redirect to first building or show selector
        router.push(`/dashboard/apartments?building_id=${data[0].id}`);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchBuildingAndApartments = async () => {
    setLoading(true);
    
    // Fetch building
    const { data: buildingData } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', building_id)
      .single();
    setBuilding(buildingData);

    // Fetch apartments
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
      // Update existing apartment
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
      // Create new apartment
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

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'occupied':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={10} /> Occupied</span>;
      case 'vacant':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Home size={10} /> Vacant</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'buildings', label: 'Buildings', icon: Building2, href: '/dashboard/buildings' },
    { id: 'apartments', label: 'Apartments', icon: Home, href: '/dashboard/apartments' },
    { id: 'residents', label: 'Residents', icon: Users, href: '/dashboard/residents' },
    { id: 'payments', label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/dashboard/maintenance' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, href: '/dashboard/announcements' },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode, href: '/dashboard/qr-codes' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!building && !building_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Building2 size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-700">No Building Selected</h2>
          <p className="text-slate-500 mt-2">Please select a building first</p>
          <button onClick={() => router.push('/dashboard/buildings')} className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg">Go to Buildings</button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Menu Button */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md">
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-950 shadow-2xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-blue-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-white tracking-tight">SYNDIX</p>
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">Apartments</p>
              </div>
            </div>
          </div>

          <div className="mx-3 mt-4 p-3 rounded-xl bg-blue-800/30 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 size={12} className="text-blue-300" />
              <p className="text-[10px] font-medium text-blue-300 uppercase">Current Building</p>
            </div>
            <p className="font-bold text-white text-sm">{building?.name}</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'apartments';
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

          <div className="p-3 border-t border-blue-800/50">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all">
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Apartments</h1>
              <p className="text-sm text-slate-500 mt-1">Manage apartments in {building?.name}</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition shadow-sm"
            >
              <Plus size={18} />
              Add Apartment
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Home size={18} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  <p className="text-xs text-slate-500">Total Apartments</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.occupied}</p>
                  <p className="text-xs text-slate-500">Occupied</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Home size={18} className="text-amber-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.vacant}</p>
                  <p className="text-xs text-slate-500">Vacant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Apartments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-100">
                <Home size={48} className="mx-auto mb-3 text-slate-300" />
                <p>No apartments yet. Click "Add Apartment" to create one.</p>
              </div>
            ) : (
              apartments.map((apartment) => (
                <div key={apartment.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Home size={16} className="text-blue-600" />
                          <h3 className="font-semibold text-slate-800">Apartment {apartment.apartment_number}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Floor {apartment.floor}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => editApartment(apartment)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => deleteApartment(apartment.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Monthly Fee:</span>
                        <span className="text-sm font-semibold text-slate-800">{apartment.monthly_fee?.toLocaleString() || building?.monthly_fee?.toLocaleString() || 0} MAD</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Status:</span>
                        {getStatusBadge(apartment.status)}
                      </div>
                      {apartment.residents?.full_name && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Resident:</span>
                          <span className="text-sm font-medium text-slate-700">{apartment.residents.full_name}</span>
                        </div>
                      )}
                    </div>

                    {apartment.status === 'vacant' && (
                      <button 
                        onClick={() => router.push(`/dashboard/residents?apartment_id=${apartment.id}`)}
                        className="w-full mt-2 py-2 text-center text-sm text-blue-600 border-t border-slate-100 hover:bg-blue-50 transition"
                      >
                        + Assign Resident
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {editingApartment ? 'Update apartment information' : 'Create a new apartment unit'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apartment Number *</label>
                <input
                  type="text"
                  value={formData.apartment_number}
                  onChange={(e) => setFormData({ ...formData, apartment_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 101, A101, 1A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (MAD)</label>
                <input
                  type="number"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder={building?.monthly_fee?.toString() || '500'}
                />
                <p className="text-xs text-slate-400 mt-1">Leave empty to use building default ({building?.monthly_fee || 500} MAD)</p>
              </div>
              {editingApartment && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                {editingApartment ? 'Update Apartment' : 'Create Apartment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}