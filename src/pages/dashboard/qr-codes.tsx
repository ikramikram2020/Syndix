import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { 
  QrCode, Download, Mail, Trash2, Eye, Search,
  Home, Users, Building2, CreditCard, Wrench, Megaphone,
  LogOut, Menu, X, ChevronRight, Sparkles, CheckCircle, AlertCircle
} from 'lucide-react';

interface QRCodeItem {
  id: string;
  qr_token: string;
  qr_image: string;
  is_active: boolean;
  scanned_count: number;
  created_at: string;
  expires_at: string;
  residents?: {
    full_name: string;
    apartment_number: string;
    email: string;
  };
}

interface Building {
  id: string;
  name: string;
  city: string;
}

export default function QRCodesManagement() {
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        await fetchQRCodes(buildingData.id);
      }
    }
    setLoading(false);
  };

  const fetchQRCodes = async (buildingId: string) => {
    // First get all residents in this building
    const { data: residents } = await supabase
      .from('residents')
      .select('id')
      .eq('building_id', buildingId);
    
    const residentIds = residents?.map(r => r.id) || [];
    
    if (residentIds.length === 0) {
      setQrCodes([]);
      return;
    }
    
    // Then get QR codes for those residents
    const { data } = await supabase
      .from('qr_codes')
      .select('*, residents(full_name, apartment_number, email)')
      .in('resident_id', residentIds)
      .order('created_at', { ascending: false });
    
    setQrCodes(data || []);
  };

  const downloadQR = (qrImage: string, residentName: string) => {
    const link = document.createElement('a');
    link.download = `QR-${residentName.replace(/\s/g, '-')}.png`;
    link.href = qrImage;
    link.click();
  };

  const sendQRByEmail = async (residentEmail: string, residentName: string) => {
    alert(`QR code would be sent to ${residentEmail}`);
    // Integrate with email service here
  };

  const deactivateQR = async (id: string) => {
    if (confirm('Deactivate this QR code? The resident will no longer have access.')) {
      await supabase
        .from('qr_codes')
        .update({ is_active: false })
        .eq('id', id);
      await fetchData();
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const filteredQRCodes = qrCodes.filter(qr =>
    qr.residents?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <p className="text-[8px] font-semibold text-orange-400 tracking-wider uppercase">QR Codes</p>
              </div>
            </div>
          </div>

          <div className="mx-3 mt-4 p-3 rounded-xl bg-blue-800/30 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 size={12} className="text-blue-300" />
              <p className="text-[10px] font-medium text-blue-300 uppercase">Current Building</p>
            </div>
            <p className="font-bold text-white text-sm">{building?.name}</p>
            <p className="text-[10px] text-blue-300 mt-1">{building?.city}</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'qr-codes';
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">QR Codes Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage resident access QR codes</p>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <QrCode size={20} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">QR codes are automatically generated when adding residents</p>
              <p className="text-xs text-blue-600">Residents scan these codes to access their portal</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by resident name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQRCodes.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-100">
                <QrCode size={48} className="mx-auto mb-3 text-slate-300" />
                <p>No QR codes generated yet. Add residents to generate QR codes.</p>
              </div>
            ) : (
              filteredQRCodes.map((qr) => (
                <div key={qr.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                  <div className="p-5 text-center">
                    <div className="bg-slate-100 p-3 rounded-xl inline-block mb-3">
                      {qr.qr_image ? (
                        <img src={qr.qr_image} alt="QR Code" className="w-32 h-32 mx-auto" />
                      ) : (
                        <QrCode size={64} className="text-slate-400 mx-auto" />
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-slate-800">{qr.residents?.full_name}</h3>
                    <p className="text-sm text-slate-500">Apartment {qr.residents?.apartment_number}</p>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        qr.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {qr.is_active ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {qr.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-slate-400">Scanned: {qr.scanned_count || 0} times</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => downloadQR(qr.qr_image, qr.residents?.full_name || 'resident')}
                        className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-blue-100 transition"
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        onClick={() => sendQRByEmail(qr.residents?.email || '', qr.residents?.full_name || '')}
                        className="flex-1 py-2 border border-slate-200 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-slate-50 transition"
                      >
                        <Mail size={14} /> Email
                      </button>
                    </div>

                    {qr.is_active && (
                      <button
                        onClick={() => deactivateQR(qr.id)}
                        className="w-full mt-2 py-2 text-red-600 text-sm hover:bg-red-50 rounded-lg transition"
                      >
                        Deactivate QR Code
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}