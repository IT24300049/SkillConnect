import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workerAPI, reviewAPI, bookingAPI, jobAPI } from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

function Stars({ rating = 0 }) {
    return (
        <span style={{ display: 'inline-flex', gap: 2, fontSize: 18 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0' }}>★</span>
            ))}
        </span>
    );
}

const MODAL = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
};
const CARD_MODAL = {
    background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    padding: 32, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto'
};

export default function WorkerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [worker, setWorker] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBooking, setShowBooking] = useState(false);
    const [bookForm, setBookForm] = useState({ jobId: '', scheduledDate: '', scheduledHour: '09', scheduledMinute: '00', scheduledPeriod: 'AM', notes: '' });
    const [booking, setBooking] = useState(false);
    const [busyDates, setBusyDates] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [busySlots, setBusySlots] = useState([]);
    const [myJobs, setMyJobs] = useState([]);

    const availableJobOptions = myJobs.filter(job => ['active', 'assigned'].includes(String(job.jobStatus || '').toLowerCase()));

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [wRes, rRes, bRes] = await Promise.allSettled([
                    workerAPI.getById(id),
                    reviewAPI.getForWorker(id),
                    bookingAPI.getBusyDates(id)
                ]);
                const aRes = await workerAPI.getAvailability(id).catch(() => null);
                const bsRes = await bookingAPI.getBusySlots(id).catch(() => null);
                const jobsRes = user?.role === 'customer' ? await jobAPI.getMine().catch(() => null) : null;
                if (wRes.status === 'fulfilled') setWorker(wRes.value.data.data);
                else setError('Worker not found.');

                if (rRes.status === 'fulfilled') setReviews(rRes.value.data.data || []);
                if (bRes.status === 'fulfilled') setBusyDates(bRes.value.data.data || []);
                if (aRes?.data?.data) setAvailability(aRes.data.data || []);
                if (bsRes?.data?.data) setBusySlots(bsRes.data.data || []);
                if (jobsRes?.data?.data) setMyJobs(jobsRes.data.data || []);
            } catch { setError('Failed to load worker.'); }
            finally { setLoading(false); }
        };
        load();
    }, [id, user?.role]);

    const toDateKey = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return null;
        const [h, m] = String(timeStr).split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
    };

    const slotLabelFromMinutes = (minutes) => {
        const hour24 = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
    };

    const applySlotToForm = (dateKey, minutes) => {
        const hour24 = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

        setBookForm((prev) => ({
            ...prev,
            scheduledDate: dateKey,
            scheduledHour: String(hour12).padStart(2, '0'),
            scheduledMinute: String(minute).padStart(2, '0'),
            scheduledPeriod: period,
        }));
    };

    const nextSevenDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return {
            date,
            key: toDateKey(date),
            label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        };
    });

    const isSlotAvailable = (dateKey, slotMinutes) => {
        const hhmm = `${String(Math.floor(slotMinutes / 60)).padStart(2, '0')}:${String(slotMinutes % 60).padStart(2, '0')}`;
        const isBooked = busySlots.some(s => s.scheduledDate === dateKey && String(s.scheduledTime || '').slice(0, 5) === hhmm);
        if (isBooked) return false;

        // Get all availability entries for this day
        const dayEntries = availability.filter((a) => a.availableDate === dateKey);

        // If the worker has no availability configured for this date at all,
        // treat all slots as free by default (unless already booked).
        if (dayEntries.length === 0) return true;

        // Otherwise, only slots that fall within an explicitly available window
        // (isAvailable !== false) are treated as free.
        const windows = dayEntries
            .filter((a) => a.isAvailable !== false)
            .map((a) => ({
                start: parseTimeToMinutes(a.startTime),
                end: parseTimeToMinutes(a.endTime),
            }))
            .filter((w) => w.start !== null && w.end !== null && w.end > w.start);

        // If there are entries for the day but none marked available,
        // consider the day unavailable.
        if (windows.length === 0) return false;

        return windows.some((w) => slotMinutes >= w.start && slotMinutes < w.end);
    };

    const to24Hour = (hour12, period) => {
        let hour = parseInt(hour12, 10);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return hour;
    };

    const getSelectedSlotMinutes = () => {
        const hour24 = to24Hour(bookForm.scheduledHour, bookForm.scheduledPeriod);
        return hour24 * 60 + parseInt(bookForm.scheduledMinute || '0', 10);
    };

    const selectedSlotAvailable = bookForm.scheduledDate
        ? isSlotAvailable(bookForm.scheduledDate, getSelectedSlotMinutes())
        : true;

    const getDaySlots = (dateKey) => {
        const slots = [];
        for (let hour = 8; hour <= 19; hour += 1) {
            const slotMinutes = hour * 60;
            slots.push({
                minutes: slotMinutes,
                label: slotLabelFromMinutes(slotMinutes),
                available: isSlotAvailable(dateKey, slotMinutes),
            });
        }
        return slots;
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!bookForm.scheduledDate) {
            toast.error('Please select a date first.');
            return;
        }
        setBooking(true);
        // Build HH:mm time string from friendly selects
        const hour24 = to24Hour(bookForm.scheduledHour, bookForm.scheduledPeriod);
        const scheduledTime = `${String(hour24).padStart(2, '0')}:${bookForm.scheduledMinute}`;
        try {
            await bookingAPI.create({
                jobId: bookForm.jobId ? parseInt(bookForm.jobId, 10) : null,
                workerId: worker.workerId,
                scheduledDate: bookForm.scheduledDate,
                scheduledTime,
                notes: bookForm.notes,
            });
            toast.success('Booking created successfully!');
            setShowBooking(false);
            setBookForm({ jobId: '', scheduledDate: '', scheduledHour: '09', scheduledMinute: '00', scheduledPeriod: 'AM', notes: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally { setBooking(false); }
    };

    const formatDate = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) return (
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#0891b2' }}>
            <span className="spinner" /> Loading worker profile...
        </div>
    );

    if (error || !worker) return (
        <div className="fade-in">
            <div className="empty-state">
                <span className="empty-icon">👷</span>
                <p>{error || 'Worker not found.'}</p>
                <Link to="/workers" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Workers</Link>
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            <Link to="/workers" style={{ color: '#0891b2', fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
                ← Back to Workers
            </Link>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Left: Profile */}
                <div style={{ flex: '1 1 60%', minWidth: 300 }}>
                    <div className="hm-card" style={{ padding: 28, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                            <div className="avatar" style={{ width: 80, height: 80, fontSize: 28 }}>
                                {worker.firstName?.[0]}{worker.lastName?.[0]}
                            </div>
                            <div>
                                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0c4a6e', marginBottom: 4 }}>
                                    {worker.firstName} {worker.lastName}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                                    <span className={`badge ${worker.isVerified ? 'badge-green' : 'badge-yellow'}`}>
                                        {worker.isVerified ? '✓ Verified' : '⏳ Pending'}
                                    </span>
                                    {worker.district && <span className="badge badge-teal">📍 {worker.city ? `${worker.city}, ` : ''}{worker.district}</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Stars rating={worker.averageRating} />
                                    <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                                        {worker.averageRating || '0'} ({reviews.length} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {worker.bio && (
                            <>
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', marginBottom: 6 }}>About</h3>
                                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{worker.bio}</p>
                            </>
                        )}

                        {worker.hourlyRateMin && (
                            <div className="stat-card" style={{ display: 'inline-block', padding: '12px 20px' }}>
                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Hourly Rate</span>
                                <div style={{ fontSize: 20, fontWeight: 900, color: '#0891b2' }}>
                                    LKR {worker.hourlyRateMin} – {worker.hourlyRateMax}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews */}
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 12 }}>Reviews ({reviews.length})</h2>
                    {reviews.length === 0 ? (
                        <div className="empty-state" style={{ padding: 40 }}>
                            <span className="empty-icon">⭐</span>
                            <p>No reviews yet for this worker.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {reviews.map(r => (
                                <div key={r.reviewId} className="hm-card" style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <Stars rating={r.overallRating} />
                                        <span style={{ fontWeight: 700, fontSize: 13, color: '#0c4a6e' }}>{r.overallRating}/5</span>
                                    </div>
                                    {r.reviewText && <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 6 }}>"{r.reviewText}"</p>}
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                        By {r.reviewer?.email || 'Customer'} · {formatDate(r.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div style={{ flex: '1 1 30%', minWidth: 260 }}>
                    <div className="hm-card" style={{ padding: 24, position: 'sticky', top: 88 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {user?.role === 'customer' && (
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={() => setShowBooking(true)}>
                                    📅 Book This Worker
                                </button>
                            )}
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => navigate('/messages')}>
                                💬 Message Worker
                            </button>
                            <hr className="hm-divider" />
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                <div>Total Jobs: <strong style={{ color: '#0c4a6e' }}>{worker.totalJobs || 0}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal (Tailwind) */}
            {showBooking && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBooking(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 lg:p-8" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-3xl">📅</span> Book {worker.firstName}
                        </h2>
                        
                        <form onSubmit={handleBook} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Link to My Job (Optional)</label>
                                <select
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                    value={bookForm.jobId}
                                    onChange={e => setBookForm({ ...bookForm, jobId: e.target.value })}
                                >
                                    <option value="">No linked job</option>
                                    {availableJobOptions.map(job => (
                                        <option key={job.jobId} value={job.jobId}>
                                            #{job.jobId} - {job.jobTitle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                                <input type="date" required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookForm.scheduledDate} 
                                    onChange={e => setBookForm({ ...bookForm, scheduledDate: e.target.value })} 
                                />
                                {busyDates.includes(bookForm.scheduledDate) && (
                                    <div className="text-red-500 text-xs mt-2 font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                                        ⚠️ Worker has existing bookings on this date. Please ensure you select an available time.
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-bold text-slate-700">7-Day Availability</label>
                                    <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Free</span>
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">Busy</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {nextSevenDays.map(day => {
                                        const slots = getDaySlots(day.key);
                                        const freeCount = slots.filter(s => s.available).length;
                                        return (
                                            <details key={day.key} className="bg-white border text-sm border-slate-200 rounded-lg overflow-hidden group">
                                                <summary className="list-none cursor-pointer p-3 flex items-center justify-between font-semibold text-slate-700 hover:bg-slate-50">
                                                    <span>{day.label}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${freeCount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                        {freeCount > 0 ? `${freeCount} free slot(s)` : 'Not available'}
                                                    </span>
                                                </summary>
                                                <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                    {slots.map(slot => (
                                                        <button
                                                            type="button"
                                                            key={slot.label}
                                                            onClick={() => slot.available && applySlotToForm(day.key, slot.minutes)}
                                                            disabled={!slot.available}
                                                            className={`text-xs font-bold py-2 rounded-lg transition border ${
                                                                slot.available 
                                                                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' 
                                                                    : 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed opacity-60'
                                                            }`}
                                                        >
                                                            {slot.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </details>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Exact Time</label>
                                <div className="flex gap-2">
                                    <select className="flex-1 border border-slate-200 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                                        value={bookForm.scheduledHour}
                                        onChange={e => setBookForm({ ...bookForm, scheduledHour: e.target.value })}>
                                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <span className="text-xl font-bold text-slate-400 self-center">:</span>
                                    <select className="flex-1 border border-slate-200 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                                        value={bookForm.scheduledMinute}
                                        onChange={e => setBookForm({ ...bookForm, scheduledMinute: e.target.value })}>
                                        {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select className="flex-1 border border-slate-200 bg-slate-50 font-bold text-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                                        value={bookForm.scheduledPeriod}
                                        onChange={e => setBookForm({ ...bookForm, scheduledPeriod: e.target.value })}>
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Notes for Worker</label>
                                <textarea 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition resize-y" 
                                    rows={3} 
                                    placeholder="Describe what you need help with..."
                                    value={bookForm.notes} 
                                    onChange={e => setBookForm({ ...bookForm, notes: e.target.value })} 
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" 
                                    disabled={booking || !selectedSlotAvailable}
                                    className={`flex-1 font-bold py-3 px-4 rounded-xl transition shadow-sm
                                        ${(!selectedSlotAvailable || booking)
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-200 hover:shadow-lg'
                                        }`}
                                >
                                    {booking ? 'Confirming...' : (!selectedSlotAvailable ? 'Time Slot Unavailable' : 'Confirm Booking')}
                                </button>
                                <button type="button" 
                                    className="flex-none bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-3 px-6 rounded-xl transition" 
                                    onClick={() => setShowBooking(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
