import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Building2, MapPin, Home, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function BuildingSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    totalFloors: '',
    totalApartments: '',
    monthlyFee: '',
    contactPhone: '',
    contactEmail: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    const { data: building, error: dbError } = await supabase
      .from('buildings')
      .insert([{
        syndic_id: user?.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        total_floors: parseInt(formData.totalFloors) || 0,
        total_apartments: parseInt(formData.totalApartments) || 0,
        monthly_fee: parseFloat(formData.monthlyFee) || 0,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
      }])
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
    } else {
      localStorage.setItem('building_setup_completed', 'true');
      localStorage.setItem('building_id', building.id);
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-[#1a3a8f] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-brand-teal text-white' : 'bg-white/20 text-white/50'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-brand-teal' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/70">Building Info</span>
            <span className="text-xs text-white/70">Details</span>
            <span className="text-xs text-white/70">Complete</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Building2 size={48} className="text-brand-teal mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Syndix!</h1>
            <p className="text-gray-500 mt-2">Let's set up your building information</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange}
                    placeholder="e.g., Sunshine Tower"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleChange}
                    placeholder="Street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleChange}
                      placeholder="Casablanca"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                      placeholder="20000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)}
                  className="w-full mt-4 py-3 bg-brand-teal text-white font-semibold rounded-lg hover:bg-brand-teal/90 transition flex items-center justify-center gap-2">
                  Next <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                    <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange}
                      placeholder="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Apartments *</label>
                    <input type="number" name="totalApartments" required value={formData.totalApartments} onChange={handleChange}
                      placeholder="20"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (MAD) *</label>
                  <input type="number" name="monthlyFee" required value={formData.monthlyFee} onChange={handleChange}
                    placeholder="500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                      placeholder="+212 6XX XXX XXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                      placeholder="admin@building.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 mt-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">Back</button>
                  <button type="button" onClick={() => setStep(3)}
                    className="flex-1 mt-4 py-3 bg-brand-teal text-white font-semibold rounded-lg hover:bg-brand-teal/90 transition flex items-center justify-center gap-2">
                    Review <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Building Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Building:</span> {formData.name}</p>
                    <p><span className="text-gray-500">Address:</span> {formData.address}, {formData.city}</p>
                    <p><span className="text-gray-500">Floors:</span> {formData.totalFloors || 'Not specified'}</p>
                    <p><span className="text-gray-500">Apartments:</span> {formData.totalApartments}</p>
                    <p><span className="text-gray-500">Monthly Fee:</span> {formData.monthlyFee} MAD</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">Back</button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                    {loading ? 'Setting up...' : 'Complete Setup'}
                    {!loading && <CheckCircle size={18} />}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}