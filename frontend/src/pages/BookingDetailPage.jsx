import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../api';
import { useAuth } from '../AuthContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
    pending: '#f59e0b', requested: '#f59e0b', accepted: '#3b82f6', in_progress: '#8b5cf6',
    completed: '#10b981', cancelled: '#ef4444', rejected: '#ef4444',
};
const WORKER_PENDING_STATES = ['pending', 'requested'];
const CUSTOMER_CANCEL_STATES = ['pending', 'requested', 'accepted'];

export default function BookingDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reason, setReason] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [bRes, hRes] = await Promise.allSettled([
                bookingAPI.getById(id),
                bookingAPI.getHistory(id),
            ]);
            if (bRes.status === 'fulfilled') setBooking(bRes.value.data.data);
            else setError('Booking not found.');
            if (hRes.status === 'fulfilled') setHistory(hRes.value.data.data || []);
        } catch { setError('Failed to load booking.'); }
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const changeStatus = useCallback(async (status) => {
        try {
            await bookingAPI.updateStatus(id, status, reason);
            setReason('');
            toast.success('Status updated to ' + status);
            load();
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Failed to change status'); 
        }
    }, [id, load, reason]);

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    const isCustomer = booking?.customer?.user?.userId === user?.userId;
    const isWorker = booking?.worker?.user?.userId === user?.userId;

    if (loading) return (
        <div className="animate-fade-in flex items-center justify-center h-64 gap-3 text-cyan-600">
            <span className="spinner" /> Loading booking...
        </div>
    );
    if (error || !booking) return (
        <div className="animate-fade-in bg-white p-12 text-center rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto mt-12">
            <span className="text-5xl block mb-4">📅</span>
            <p className="text-slate-600 mb-6">{error || 'Booking not found.'}</p>
            <Link to="/bookings" className="inline-block bg-cyan-600 text-white font-medium py-2 px-6 rounded-xl hover:bg-cyan-700 transition">Back to Bookings</Link>
        </div>
    );

    return (
        <div className="animate-fade-in max-w-6xl mx-auto px-4 py-8">
            <Link to="/bookings" className="text-cyan-600 font-semibold text-sm hover:underline inline-block mb-6">
                &larr; Back to Bookings
            </Link>

            <div className="flex flex-wrap lg:flex-nowrap gap-6">
                {/* Left: Details */}
                <div className="flex-1 w-full lg:w-2/3 min-w-[300px]">
                    <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start flex-wrap gap-4 mb-6 pb-6 border-b border-slate-100">
                            <h1 className="text-2xl font-extrabold text-slate-900">Booking #{booking.bookingId}</h1>
                            <StatusBadge status={booking.bookingStatus} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-1">Customer</div>
                                <div className="text-base font-bold text-slate-800">{booking.customer?.firstName} {booking.customer?.lastName}</div>
                                <div className="text-sm text-slate-500 mt-1">{booking.customer?.user?.email}</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-1">Worker</div>
                                <div className="text-base font-bold text-slate-800">
                                    {booking.worker?.firstName} {booking.worker?.lastName}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">{booking.worker?.user?.email}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-1">Scheduled Date</div>
                                <div className="text-base font-semibold text-slate-800">{booking.scheduledDate || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-1">Scheduled Time</div>
                                <div className="text-base font-semibold text-slate-800">{booking.scheduledTime || 'N/A'}</div>
                            </div>
                        </div>

                        {booking.notes && (
                            <div className="mb-6">
                                <div className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-2">Notes</div>
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-sm italic">
                                    {booking.notes}
                                </div>
                            </div>
                        )}

                        {booking.finalCost && (
                            <div className="inline-block bg-slate-50 border border-slate-100 px-6 py-3 rounded-xl mt-2">
                                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Total Price</span>
                                <div className="text-2xl font-black text-cyan-600">LKR {booking.finalCost}</div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-base font-bold text-slate-800 mb-4">Manage Booking Actions</h3>
                        
                        <div className="flex flex-wrap gap-3 mb-5">
                            {isCustomer && CUSTOMER_CANCEL_STATES.includes(booking.bookingStatus) && (
                                <button className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-2 px-4 rounded-xl transition" onClick={() => changeStatus('cancelled')}>Cancel Booking</button>
                            )}
                            {isCustomer && booking.bookingStatus === 'completed' && (
                                <Link to="/reviews" className="bg-amber-400 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl transition">⭐ Leave Review</Link>
                            )}
                            {isWorker && WORKER_PENDING_STATES.includes(booking.bookingStatus) && (
                                <>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition" onClick={() => changeStatus('accepted')}>✓ Accept</button>
                                    <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-xl transition" onClick={() => changeStatus('rejected')}>✗ Reject</button>
                                </>
                            )}
                            {isWorker && booking.bookingStatus === 'accepted' && (
                                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition" onClick={() => changeStatus('in_progress')}>Start Work</button>
                            )}
                            {isWorker && booking.bookingStatus === 'in_progress' && (
                                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition" onClick={() => changeStatus('completed')}>✓ Mark Complete</button>
                            )}
                            <Link to="/messages" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl transition">💬 Message Partner</Link>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason / Note (optional when changing status)</label>
                            <input className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition" 
                                placeholder="Add an optional reason..." value={reason} onChange={e => setReason(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Right: Timeline */}
                <div className="flex-none w-full lg:w-1/3 min-w-[260px]">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="text-xl">📜</span> Status Timeline
                        </h3>
                        {history.length === 0 ? (
                            <p className="text-slate-500 text-sm">No history available.</p>
                        ) : (
                            <div className="relative pl-6">
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                                {history.map((h, i) => {
                                    // newStatus is the target status in history records
                                    const statusVal = h.newStatus || h.status; 
                                    const color = STATUS_COLOR[statusVal] || '#94a3b8';
                                    return (
                                        <div key={i} className="mb-6 relative group">
                                            <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 transition" 
                                                 style={{ backgroundColor: color, '--tw-ring-color': `${color}40` }}></div>
                                            <div className="font-bold text-sm text-slate-800 capitalize">
                                                {statusVal?.replace(/_/g, ' ')}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 font-medium">{formatDate(h.changedAt)}</div>
                                            {h.changeReason && (
                                                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                                                    {h.changeReason}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
