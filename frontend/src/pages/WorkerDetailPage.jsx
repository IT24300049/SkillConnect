import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workerAPI, reviewAPI, bookingAPI } from '../api';
import { useAuth } from '../AuthContext';

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
    const [bookForm, setBookForm] = useState({ scheduledDate: '', scheduledHour: '09', scheduledMinute: '00', scheduledPeriod: 'AM', notes: '' });
    const [booking, setBooking] = useState(false);
    const [busyDates, setBusyDates] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [busySlots, setBusySlots] = useState([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [wRes, bRes] = await Promise.allSettled([
                    workerAPI.getById(id),
                    bookingAPI.getBusyDates(id)
                ]);
                const aRes = await workerAPI.getAvailability(id).catch(() => null);
                const bsRes = await bookingAPI.getBusySlots(id).catch(() => null);

                let workerData = null;
                if (wRes.status === 'fulfilled') {
                    workerData = wRes.value.data.data;
                    setWorker(workerData);
                } else {
                    setError('Worker not found.');
                }

                if (workerData) {
                    const workerUserId = workerData?.user?.userId ?? workerData?.userId ?? id;
                    const rRes = await reviewAPI.getForWorker(workerUserId).catch(() => null);
                    setReviews(rRes?.data?.data || []);
                } else {
                    setReviews([]);
                }

                if (bRes.status === 'fulfilled') setBusyDates(bRes.value.data.data || []);
                if (aRes?.data?.data) setAvailability(aRes.data.data || []);
                if (bsRes?.data?.data) setBusySlots(bsRes.data.data || []);
            } catch { setError('Failed to load worker.'); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const averageFromReviews = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + Number(r?.overallRating || 0), 0) / reviews.length
        : 0;
    const displayAverageRating = reviews.length > 0
        ? averageFromReviews
        : Number(worker?.averageRating || 0);
    const displayAverageRatingText = Number.isFinite(displayAverageRating)
        ? displayAverageRating.toFixed(1).replace(/\.0$/, '')
        : '0';
    const displayTotalJobs = Math.max(Number(worker?.totalJobs || 0), reviews.length);

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

    const getSelectedSlotMinutes = () => {
        let hour = parseInt(bookForm.scheduledHour);
        if (bookForm.scheduledPeriod === 'PM' && hour !== 12) hour += 12;
        if (bookForm.scheduledPeriod === 'AM' && hour === 12) hour = 0;
        return hour * 60 + parseInt(bookForm.scheduledMinute || '0');
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
        setBooking(true);
        // Build HH:mm time string from friendly selects
        let hour = parseInt(bookForm.scheduledHour);
        if (bookForm.scheduledPeriod === 'PM' && hour !== 12) hour += 12;
        if (bookForm.scheduledPeriod === 'AM' && hour === 12) hour = 0;
        const scheduledTime = `${String(hour).padStart(2, '0')}:${bookForm.scheduledMinute}`;
        try {
            await bookingAPI.create({
                workerId: worker.workerId,
                scheduledDate: bookForm.scheduledDate,
                scheduledTime,
                notes: bookForm.notes,
            });
            alert('Booking created successfully!');
            setShowBooking(false);
            setBookForm({ scheduledDate: '', scheduledHour: '09', scheduledMinute: '00', scheduledPeriod: 'AM', notes: '' });
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Booking failed'));
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
                                    <Stars rating={displayAverageRating} />
                                    <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                                        {displayAverageRatingText} ({reviews.length} reviews)
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
                                <div>Total Jobs: <strong style={{ color: '#0c4a6e' }}>{displayTotalJobs}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBooking && (
                <div style={MODAL} onClick={() => setShowBooking(false)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>📅 Book {worker.firstName}</h2>
                        <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="hm-label">Date</label>
                                <input className="hm-input" type="date" required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookForm.scheduledDate} onChange={e => setBookForm({ ...bookForm, scheduledDate: e.target.value })} />
                                {busyDates.includes(bookForm.scheduledDate) && (
                                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                                        ⚠️ Worker has bookings on this date. Select a green free slot below.
                                    </div>
                                )}
                            </div>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <label className="hm-label" style={{ marginBottom: 0 }}>7-Day Schedule</label>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>Free</span>
                                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>Not available</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {nextSevenDays.map(day => {
                                        const slots = getDaySlots(day.key);
                                        const freeCount = slots.filter(s => s.available).length;
                                        return (
                                            <details key={day.key} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff' }}>
                                                <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#0c4a6e' }}>
                                                    <span>{day.label}</span>
                                                    <span style={{ fontSize: 11, color: freeCount > 0 ? '#166534' : '#991b1b', fontWeight: 800 }}>
                                                        {freeCount > 0 ? `${freeCount} free slot(s)` : 'No free slots'}
                                                    </span>
                                                </summary>
                                                <div style={{ padding: '0 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                                    {slots.map(slot => (
                                                        <button
                                                            type="button"
                                                            key={slot.label}
                                                            onClick={() => slot.available && applySlotToForm(day.key, slot.minutes)}
                                                            style={{
                                                                border: '1px solid',
                                                                borderColor: slot.available ? '#86efac' : '#fecaca',
                                                                background: slot.available ? '#dcfce7' : '#fee2e2',
                                                                color: slot.available ? '#166534' : '#991b1b',
                                                                borderRadius: 8,
                                                                padding: '8px 6px',
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                cursor: slot.available ? 'pointer' : 'not-allowed',
                                                                opacity: slot.available ? 1 : 0.7,
                                                            }}
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
                                <label className="hm-label">Time</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {/* Hour */}
                                    <select className="hm-input" style={{ flex: 1 }}
                                        value={bookForm.scheduledHour}
                                        onChange={e => setBookForm({ ...bookForm, scheduledHour: e.target.value })}>
                                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    {/* Minute */}
                                    <select className="hm-input" style={{ flex: 1 }}
                                        value={bookForm.scheduledMinute}
                                        onChange={e => setBookForm({ ...bookForm, scheduledMinute: e.target.value })}>
                                        {['00', '15', '30', '45'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    {/* AM/PM */}
                                    <select className="hm-input" style={{ flex: 1 }}
                                        value={bookForm.scheduledPeriod}
                                        onChange={e => setBookForm({ ...bookForm, scheduledPeriod: e.target.value })}>
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>
                            {busyDates.length > 0 && (
                                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, fontSize: 12 }}>
                                    <div style={{ fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Busy Dates:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {busyDates.map(d => <span key={d} style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 4 }}>{d}</span>)}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="hm-label">Notes</label>
                                <textarea className="hm-input" rows={3} style={{ resize: 'vertical' }}
                                    placeholder="Describe the work needed..."
                                    value={bookForm.notes} onChange={e => setBookForm({ ...bookForm, notes: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary"
                                    disabled={booking || !selectedSlotAvailable}
                                    style={{ flex: 1, justifyContent: 'center', opacity: !selectedSlotAvailable ? 0.5 : 1 }}>
                                    {booking ? 'Booking...' : (!selectedSlotAvailable ? 'Choose a free slot' : 'Confirm Booking')}
                                </button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setShowBooking(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
