import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { 
  Building2, Plus, Edit, Trash2, Eye, Search,
  Home, Users, CreditCard, Wrench, Megaphone, QrCode,
  LogOut, Menu, X, ChevronRight, Sparkles, Calendar,
  MapPin, Phone, Mail, DollarSign, AlertCircle, CheckCircle
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      // Update existing building
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
      // Create new building
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

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
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
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">Buildings</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'buildings';
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
              <h1 className="text-2xl font-bold text-slate-800">Buildings Management</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your properties</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition shadow-sm"
            >
              <Plus size={18} />
              Add Building
            </button>
          </div>

          {/* Buildings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-100">
                <Building2 size={48} className="mx-auto mb-3 text-slate-300" />
                <p>No buildings yet. Click "Add Building" to create one.</p>
              </div>
            ) : (
              buildings.map((building) => (
                <div key={building.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 size={18} className="text-blue-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{building.name}</h3>
                          <p className="text-xs text-slate-500">{building.city}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => editBuilding(building)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => deleteBuilding(building.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{building.address || 'Address not set'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Home size={14} className="text-slate-400" />
                        <span>{building.total_apartments} apartments • {building.total_floors} floors</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign size={14} className="text-slate-400" />
                        <span>{building.monthly_fee.toLocaleString()} MAD / month</span>
                      </div>
                      {building.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          <span>{building.contact_phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => router.push(`/dashboard/apartments?building_id=${building.id}`)}
                        className="w-full py-2 text-center text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        View Apartments →
                      </button>
                    </div>
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
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingBuilding ? 'Edit Building' : 'Add New Building'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {editingBuilding ? 'Update building information' : 'Create a new property'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Building Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sunshine Tower"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Casablanca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="20000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Floors</label>
                  <input
                    type="number"
                    value={formData.total_floors}
                    onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Apartments</label>
                  <input
                    type="number"
                    value={formData.total_apartments}
                    onChange={(e) => setFormData({ ...formData, total_apartments: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (MAD)</label>
                <input
                  type="number"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="admin@building.com"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                {editingBuilding ? 'Update Building' : 'Create Building'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}