import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { equipmentAPI } from '../api';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eqRes, bookRes] = await Promise.allSettled([
          equipmentAPI.getAll(),
          equipmentAPI.getSupplierBookings(),
        ]);
        setEquipment(eqRes.status === 'fulfilled' ? eqRes.value?.data?.data || [] : []);
        setBookings(bookRes.status === 'fulfilled' ? bookRes.value?.data?.data || [] : []);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const name = user?.email?.split('@')[0] || 'Supplier';
  const totalItems = equipment.length;
  const rentedOut = bookings.filter(b => b.bookingStatus === 'rented_out' || b.bookingStatus === 'reserved').length;
  const revenue = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

  return (
    <div className="fade-in space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#152a2a] to-[#1e3b3b] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#13ecec]/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[#13ecec] mb-1">Supplier Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-black mb-1">Hello, {name}</h1>
          <p className="text-sm text-slate-300">Manage your equipment inventory and rentals</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Equipment', value: totalItems, icon: 'inventory_2', color: 'bg-[#13ecec]/10 text-[#0ea5a5]' },
          { label: 'Currently Rented', value: rentedOut, icon: 'local_shipping', color: 'bg-orange-50 text-orange-600' },
          { label: 'Total Bookings', value: bookings.length, icon: 'calendar_today', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Revenue', value: `Rs.${revenue.toLocaleString()}`, icon: 'payments', color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => navigate('/equipment')} className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-lg bg-[#13ecec]/10 text-[#0ea5a5] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-xl">add_circle</span>
          </div>
          <p className="text-sm font-bold text-slate-900">Manage Inventory</p>
          <p className="text-xs text-slate-500">Add or update equipment</p>
        </button>
        <button onClick={() => navigate('/bookings')} className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-xl">receipt_long</span>
          </div>
          <p className="text-sm font-bold text-slate-900">Rental Bookings</p>
          <p className="text-xs text-slate-500">View rental requests</p>
        </button>
        <button onClick={() => navigate('/messages')} className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-xl">chat</span>
          </div>
          <p className="text-sm font-bold text-slate-900">Messages</p>
          <p className="text-xs text-slate-500">Chat with customers</p>
        </button>
      </div>

      {/* Equipment Inventory Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Equipment Inventory</h2>
          <button onClick={() => navigate('/equipment')} className="text-[#13ecec] text-sm font-semibold hover:underline flex items-center gap-1">
            Manage All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><span className="spinner" /></div>
        ) : equipment.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">inventory_2</span>
            <p className="text-slate-500 mb-3">No equipment added yet</p>
            <button onClick={() => navigate('/equipment')} className="text-sm font-bold text-[#13ecec] hover:underline">
              Add your first item
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left p-4 font-semibold text-slate-600">Equipment</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Daily Rate</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Condition</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.slice(0, 5).map(eq => (
                    <tr key={eq.equipmentId || eq.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{eq.equipmentName || eq.name}</td>
                      <td className="p-4 text-slate-600">Rs.{eq.rentalPricePerDay || eq.dailyRate || 0}/day</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          eq.equipmentCondition === 'new' ? 'bg-green-50 text-green-600' :
                          eq.equipmentCondition === 'excellent' ? 'bg-blue-50 text-blue-600' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {eq.equipmentCondition || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          eq.isAvailable !== false ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {eq.isAvailable !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
