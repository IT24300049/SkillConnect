import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, jobAPI, workerAPI } from '../api';
import { useAuth } from '../AuthContext';

const STATUS_STYLE = {
    requested: { bg: '#fef3c7', color: '#92400e', label: '⏳ Requested' },
    accepted: { bg: '#dbeafe', color: '#1e40af', label: '✓ Accepted' },
    in_progress: { bg: '#ede9fe', color: '#5b21b6', label: '🔨 In Progress' },
    completed: { bg: '#d1fae5', color: '#065f46', label: '✅ Completed' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: '❌ Cancelled' },
    rejected: { bg: '#f1f5f9', color: '#475569', label: '🚫 Rejected' },
};

const TRANSITIONS = {
    requested: ['accepted', 'rejected', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [], cancelled: [], rejected: [],
};

const MODAL = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16, paddingTop: 125
};
const CARD_MODAL = {
    background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto'
};

export default function BookingsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewAs, setViewAs] = useState(user?.role === 'worker' ? 'worker' : 'customer');
    const [showForm, setShowForm] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [form, setForm] = useState({ workerId: '', scheduledDate: '', scheduledTime: '', notes: '' });
    const [history, setHistory] = useState([]);
    const [historyBookingId, setHistoryBookingId] = useState(null);
    const [editBooking, setEditBooking] = useState(null);
    const [editForm, setEditForm] = useState({ notes: '', scheduledDate: '', scheduledTime: '' });
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const load = async () => {
        setLoading(true);
        setError('');
        try { const res = await bookingAPI.getMine(viewAs); setBookings(res.data.data || []); }
        catch (err) {
            if (err.response?.status === 404 && viewAs === 'worker') {
                setError('You do not have a worker profile yet. Register as a worker to manage incoming bookings.');
                setBookings([]);
            } else {
                setError('Failed to load bookings. Check your connection or login status.');
            }
        }
        finally { setLoading(false); }
    };

    const loadFormData = async () => {
        try {
            const [j, w] = await Promise.all([jobAPI.getAll({}), workerAPI.getAll()]);
            setJobs(j.data.data || []); setWorkers(w.data.data || []);
        } catch { }
    };

    useEffect(() => { load(); }, [viewAs]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await bookingAPI.create({
                ...form,
                workerId: parseInt(form.workerId),
                notes: form.notes || null,
            });
            setShowForm(false); load();
        }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const handleStatusChange = async (bookingId, status) => {
        const reason = (status === 'cancelled' || status === 'rejected') ? prompt('Enter a reason (optional):') || '' : '';
        try { await bookingAPI.updateStatus(bookingId, status, reason); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const viewHistory = async (bookingId) => {
        try { const res = await bookingAPI.getHistory(bookingId); setHistory(res.data.data || []); setHistoryBookingId(bookingId); }
        catch { alert('Failed to load history'); }
    };

    const handleDelete = async (bookingId) => {
        if (!confirm('Delete this booking?')) return;
        try { await bookingAPI.delete(bookingId); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const openEdit = (b) => { setEditBooking(b); setEditForm({ notes: b.notes || '', scheduledDate: b.scheduledDate || '', scheduledTime: b.scheduledTime || '' }); };

    const handleEdit = async (e) => {
        e.preventDefault();
        try { await bookingAPI.update(editBooking.bookingId, editForm); setEditBooking(null); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c4a6e', marginBottom: 2 }}>📅 Bookings</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Manage and track your service bookings</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Toggle view - only show if user has potential for both roles */}
                    <div style={{ display: 'flex', background: '#e0f2fe', borderRadius: 10, padding: 3, gap: 3 }}>
                        <button onClick={() => setViewAs('customer')}
                            style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                fontSize: 12, fontWeight: 700,
                                background: viewAs === 'customer' ? '#fff' : 'transparent',
                                color: viewAs === 'customer' ? '#0891b2' : '#64748b',
                                boxShadow: viewAs === 'customer' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.15s'
                            }}>
                            As customer
                        </button>
                        {user?.role === 'worker' && (
                            <button onClick={() => setViewAs('worker')}
                                style={{
                                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontSize: 12, fontWeight: 700,
                                    background: viewAs === 'worker' ? '#fff' : 'transparent',
                                    color: viewAs === 'worker' ? '#0891b2' : '#64748b',
                                    boxShadow: viewAs === 'worker' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.15s'
                                }}>
                                As worker
                            </button>
                        )}
                    </div>
                    {user?.role === 'worker' && viewAs === 'worker' && (
                        <button className="btn-primary" onClick={() => { loadFormData(); setShowForm(true); }}>
                            + New Booking
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span>❌ {error}</span>
                    <button className="btn-secondary" style={{ padding: '5px 14px', fontSize: 12, flexShrink: 0 }} onClick={load}>Retry</button>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#0891b2' }}>
                    <span className="spinner" /> Loading bookings...
                </div>
            ) : bookings.length === 0 ? (
                <div className="hm-card" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                    <p style={{ color: '#64748b' }}>No bookings yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {bookings.map(b => {
                        const s = STATUS_STYLE[b.bookingStatus] || { bg: '#f1f5f9', color: '#475569', label: b.bookingStatus };
                        return (
                            <div key={b.bookingId} className="hm-card" style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    {/* Left: info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 800, color: '#0c4a6e', fontSize: 14 }}>Booking #{b.bookingId}</span>
                                            <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: '#475569' }}>
                                            {b.job?.jobTitle && <span>📋 <strong>{b.job.jobTitle}</strong></span>}
                                            {(b.worker?.firstName) && <span>👷 {b.worker.firstName} {b.worker.lastName}</span>}
                                            {b.scheduledDate && <span>📅 {b.scheduledDate} {b.scheduledTime && `at ${b.scheduledTime}`}</span>}
                                            {b.notes && <span>📝 {b.notes}</span>}
                                            {b.cancellationReason && <span style={{ color: '#ef4444' }}>❌ {b.cancellationReason}</span>}
                                        </div>
                                    </div>

                                    {/* Right: action buttons */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                        <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 11, justifyContent: 'center' }}
                                            onClick={() => navigate(`/bookings/${b.bookingId}`)}>View Details</button>
                                        {TRANSITIONS[b.bookingStatus]?.map(status => {
                                            const isCancellation = status === 'cancelled';
                                            const canWorkerChange = user?.role === 'worker' && viewAs === 'worker';
                                            const canCustomerCancel = viewAs === 'customer' && isCancellation;
                                            if (!canWorkerChange && !canCustomerCancel) return null;
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(b.bookingId, status)}
                                                    className={['accepted', 'in_progress', 'completed'].includes(status) ? 'btn-primary' : 'btn-danger'}
                                                    style={{ padding: '6px 14px', fontSize: 11, justifyContent: 'center' }}
                                                >
                                                    → {status.replace(/_/g, ' ')}
                                                </button>
                                            );
                                        })}
                                        <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 11 }}
                                            onClick={() => viewHistory(b.bookingId)}>📜 History</button>
                                        {b.bookingStatus === 'requested' && (
                                            <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 11 }}
                                                onClick={() => openEdit(b)}>✏️ Edit</button>
                                        )}
                                        {['requested', 'completed', 'cancelled', 'rejected'].includes(b.bookingStatus) && (
                                            <button className="btn-danger" style={{ padding: '6px 14px', fontSize: 11 }}
                                                onClick={() => handleDelete(b.bookingId)}>🗑 Delete</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Booking Modal */}
            {showForm && (
                <div style={MODAL} onClick={() => setShowForm(false)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>📅 New Booking</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                            <div>
                                <label className="hm-label">Worker</label>
                                <select className="hm-input" required value={form.workerId} onChange={e => setForm({ ...form, workerId: e.target.value })}>
                                    <option value="">Select a worker</option>
                                    {workers.map(w => <option key={w.workerId} value={w.workerId}>{w.firstName} {w.lastName}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="hm-label">Date</label><input className="hm-input" type="date" required min={today} value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} /></div>
                                <div><label className="hm-label">Time</label><input className="hm-input" type="time" required value={form.scheduledTime} onChange={e => setForm({ ...form, scheduledTime: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="hm-label">Notes (optional)</label>
                                <textarea className="hm-input" rows={2} style={{ resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Send Request</button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyBookingId && (
                <div style={MODAL} onClick={() => setHistoryBookingId(null)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>📜 Booking #{historyBookingId} History</h2>
                        {history.length === 0 ? <p style={{ color: '#64748b', fontSize: 13 }}>No history yet.</p> : (
                            <div style={{ position: 'relative', paddingLeft: 20, borderLeft: '2px solid #bae6fd' }}>
                                {history.map((h, i) => (
                                    <div key={h.historyId} style={{ marginBottom: 16, position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: -25, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#0891b2', border: '2px solid #fff' }} />
                                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0c4a6e' }}>
                                            {h.oldStatus ? `${h.oldStatus} → ${h.newStatus}` : `Created (${h.newStatus})`}
                                        </div>
                                        {h.changeReason && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{h.changeReason}</div>}
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{new Date(h.changedAt).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn-secondary" style={{ width: '100%', marginTop: 16, textAlign: 'center' }} onClick={() => setHistoryBookingId(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Edit Booking Modal */}
            {editBooking && (
                <div style={MODAL} onClick={() => setEditBooking(null)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>✏️ Edit Booking #{editBooking.bookingId}</h2>
                        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="hm-label">Date</label><input className="hm-input" type="date" min={today} value={editForm.scheduledDate} onChange={e => setEditForm({ ...editForm, scheduledDate: e.target.value })} /></div>
                                <div><label className="hm-label">Time</label><input className="hm-input" type="time" value={editForm.scheduledTime} onChange={e => setEditForm({ ...editForm, scheduledTime: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="hm-label">Notes</label>
                                <textarea className="hm-input" rows={3} style={{ resize: 'vertical' }} value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save</button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setEditBooking(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
