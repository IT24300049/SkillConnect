import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { equipmentAPI } from '../api';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [bookForm, setBookForm] = useState({ rentalStartDate: '', rentalEndDate: '', notes: '' });

  useEffect(() => {
    equipmentAPI.getById(id)
      .then((r) => setEquipment(r.data.data))
      .catch(() => setEquipment(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await equipmentAPI.book({ equipmentId: parseInt(id), rentalStartDate: bookForm.rentalStartDate, rentalEndDate: bookForm.rentalEndDate, notes: bookForm.notes || null });
      toast.success('Booking created');
      setShowBook(false);
      setBookForm({ rentalStartDate: '', rentalEndDate: '', notes: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to book'); }
  };

  if (loading) return <div className="spinner mx-auto mt-12" />;
  if (!equipment) return <div className="text-center py-12">Equipment not found</div>;

  const isSupplier = user?.role === 'supplier';
  const condition = (equipment.equipmentCondition || '').replace('_', '');

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 mb-6 hover:text-cyan-600">
        <ArrowLeft size={18} /> Back
      </button>
      <div className="hm-card p-6">
        <h1 className="text-2xl font-bold text-slate-800">{equipment.equipmentName}</h1>
        <p className="text-slate-600 mt-2">{equipment.equipmentDescription}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="badge badge-teal">{equipment.equipmentCategory?.categoryName || 'Uncategorized'}</span>
          <span className="badge badge-blue capitalize">{condition}</span>
          <span className="badge badge-gray">Qty: {equipment.quantityAvailable}/{equipment.quantityTotal}</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-slate-500">Daily Rate</p><p className="font-bold text-cyan-600">Rs. {equipment.rentalPricePerDay} / day</p></div>
          <div><p className="text-xs text-slate-500">Deposit</p><p className="font-semibold">Rs. {equipment.depositAmount}</p></div>
        </div>
        {!isSupplier && (equipment.quantityAvailable || 0) > 0 && (
          <button onClick={() => setShowBook(true)} className="btn-primary mt-6">
            Book Now
          </button>
        )}
      </div>

      {showBook && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBook(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Rent {equipment.equipmentName}</h3>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                  <input type="date" required value={bookForm.rentalStartDate} onChange={e => setBookForm({ ...bookForm, rentalStartDate: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                  <input type="date" required value={bookForm.rentalEndDate} onChange={e => setBookForm({ ...bookForm, rentalEndDate: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (optional)</label>
                <textarea value={bookForm.notes} onChange={e => setBookForm({ ...bookForm, notes: e.target.value })}
                  rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBook(false)} className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm">Cancel</button>
                <button type="submit" className="flex-1 h-11 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600">Rent Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
