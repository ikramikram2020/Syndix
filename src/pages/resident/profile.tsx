import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useResidentAuth } from '../../hooks/useResidentAuth';
import { 
  User, Mail, Phone, Home, Building2, 
  Calendar, Shield, Edit, ArrowLeft, 
  CheckCircle, AlertCircle, Save, X, LogOut
} from 'lucide-react';

export default function ResidentProfile() {
  const router = useRouter();
  const { resident, logout } = useResidentAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (resident) {
      setFormData({
        phone: resident.phone || '',
        email: resident.email || ''
      });
      setLoading(false);
    }
  }, [resident]);

  const saveChanges = async () => {
    if (!resident) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('residents')
      .update({
        phone: formData.phone,
        email: formData.email
      })
      .eq('id', resident.id);

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      resident.phone = formData.phone;
      resident.email = formData.email;
      setEditing(false);
      alert('Profile updated successfully!');
    }
    setSaving(false);
  };

  if (loading || !resident) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-bold">My Profile</h1>
              <p className="text-blue-300 text-sm">Your personal information</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg"
            >
              <Edit size={18} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-5">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Avatar */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-bold text-3xl">{resident.full_name?.charAt(0)}</span>
            </div>
            <h2 className="text-white text-xl font-bold mt-3">{resident.full_name}</h2>
            <p className="text-blue-200 text-sm">Resident</p>
          </div>

          {/* Info */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Home size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Apartment</p>
                <p className="font-medium text-slate-800">Apartment {resident.apartment_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Building</p>
                <p className="font-medium text-slate-800">{resident.building_name}</p>
                <p className="text-xs text-slate-400">{resident.building_city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Email</p>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                ) : (
                  <p className="font-medium text-slate-800">{resident.email || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Phone size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Phone</p>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                ) : (
                  <p className="font-medium text-slate-800">{resident.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Member Since</p>
                <p className="font-medium text-slate-800">2024</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Shield size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Account Status</p>
                <p className="font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} /> Active
                </p>
              </div>
            </div>
          </div>

          {/* Edit Mode Buttons */}
          {editing && (
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Logout Button */}
          {!editing && (
            <div className="p-5 border-t border-slate-100">
              <button
                onClick={logout}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}