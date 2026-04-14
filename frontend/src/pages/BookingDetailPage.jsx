import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../api';
import { useAuth } from '../AuthContext';
import StatusBadge from '../components/StatusBadge';

const STATUS_COLOR = {
    pending: '#f59e0b', accepted: '#3b82f6', in_progress: '#8b5cf6',
    completed: '#10b981', cancelled: '#ef4444', rejected: '#ef4444',
};

export default function BookingDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reason, setReason] = useState('');

    const load = async () => {
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
    };

    useEffect(() => { load(); }, [id]);

    const changeStatus = async (status) => {
        try {
            await bookingAPI.updateStatus(id, status, reason);
            setReason('');
            load();
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    const isCustomer = booking?.customer?.userId === user?.userId;
    const isWorker = booking?.worker?.user?.userId === user?.userId;

    if (loading) return (
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#0891b2' }}>
            <span className="spinner" /> Loading booking...
        </div>
    );
    if (error || !booking) return (
        <div className="fade-in empty-state">
            <span className="empty-icon">📅</span>
            <p>{error || 'Booking not found.'}</p>
            <Link to="/bookings" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Bookings</Link>
        </div>
    );

    return (
        <div className="fade-in">
            <Link to="/bookings" style={{ color: '#0891b2', fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
                ← Back to Bookings
            </Link>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Left: Details */}
                <div style={{ flex: '1 1 60%', minWidth: 300 }}>
                    <div className="hm-card" style={{ padding: 28, marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c4a6e' }}>Booking #{booking.bookingId}</h1>
                            <StatusBadge status={booking.bookingStatus} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Customer</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>{booking.customer?.email || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Worker</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>
                                    {booking.worker?.firstName} {booking.worker?.lastName}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Scheduled Date</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>{booking.scheduledDate || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Scheduled Time</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>{booking.scheduledTime || 'N/A'}</div>
                            </div>
                        </div>

                        {booking.notes && (
                            <>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
                                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>{booking.notes}</p>
                            </>
                        )}

                        {booking.totalPrice && (
                            <div className="stat-card" style={{ display: 'inline-block', padding: '10px 18px' }}>
                                <span style={{ fontSize: 11, color: '#64748b' }}>Total Price</span>
                                <div style={{ fontSize: 20, fontWeight: 900, color: '#0891b2' }}>LKR {booking.totalPrice}</div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="hm-card" style={{ padding: 20, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', marginBottom: 12 }}>Actions</h3>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                            {isCustomer && booking.bookingStatus === 'pending' && (
                                <button className="btn-danger" onClick={() => changeStatus('cancelled')}>Cancel Booking</button>
                            )}
                            {isCustomer && booking.bookingStatus === 'completed' && (
                                <Link to="/reviews" className="btn-primary" style={{ textDecoration: 'none' }}>⭐ Leave Review</Link>
                            )}
                            {isWorker && booking.bookingStatus === 'pending' && (
                                <>
                                    <button className="btn-primary" onClick={() => changeStatus('accepted')}>✓ Accept</button>
                                    <button className="btn-danger" onClick={() => changeStatus('rejected')}>✗ Reject</button>
                                </>
                            )}
                            {isWorker && booking.bookingStatus === 'accepted' && (
                                <button className="btn-primary" onClick={() => changeStatus('in_progress')}>Start Work</button>
                            )}
                            {isWorker && booking.bookingStatus === 'in_progress' && (
                                <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }} onClick={() => changeStatus('completed')}>✓ Mark Complete</button>
                            )}
                            <Link to="/messages" className="btn-secondary" style={{ textDecoration: 'none' }}>💬 Message</Link>
                        </div>
                        <div>
                            <label className="hm-label">Reason / Note (optional)</label>
                            <input className="hm-input" placeholder="Add reason for status change..." value={reason} onChange={e => setReason(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Right: Timeline */}
                <div style={{ flex: '1 1 30%', minWidth: 260 }}>
                    <div className="hm-card" style={{ padding: 24, position: 'sticky', top: 88 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Status Timeline</h3>
                        {history.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: 13 }}>No history available.</p>
                        ) : (
                            <div style={{ position: 'relative', paddingLeft: 24 }}>
                                <div style={{ position: 'absolute', left: 8, top: 6, bottom: 6, width: 2, background: '#e0f2fe' }} />
                                {history.map((h, i) => {
                                    const color = STATUS_COLOR[h.status] || '#94a3b8';
                                    return (
                                        <div key={i} style={{ marginBottom: 20, position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute', left: -20, top: 4,
                                                width: 14, height: 14, borderRadius: '50%',
                                                background: color, border: '3px solid #fff',
                                                boxShadow: `0 0 0 2px ${color}33`,
                                            }} />
                                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0c4a6e', textTransform: 'capitalize' }}>
                                                {h.status?.replace(/_/g, ' ')}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(h.changedAt)}</div>
                                            {h.reason && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{h.reason}</div>}
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
