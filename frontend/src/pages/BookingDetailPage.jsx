import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI, reviewAPI, complaintAPI } from '../api';
import { useAuth } from '../AuthContext';
import StatusBadge from '../components/StatusBadge';

const STATUS_COLOR = {
    pending: '#f59e0b', accepted: '#3b82f6', in_progress: '#8b5cf6',
    completed: '#10b981', cancelled: '#ef4444', rejected: '#ef4444',
};

const STARS = [1, 2, 3, 4, 5];
const COMPLAINT_CATEGORIES = ['service_quality', 'inappropriate_behavior', 'fraud', 'payment_issue', 'other'];

export default function BookingDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reason, setReason] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
    const [complaintForm, setComplaintForm] = useState({
        complaintCategory: 'other',
        complaintTitle: '',
        complaintDescription: '',
    });
    const [myReviewForBooking, setMyReviewForBooking] = useState(null);
    const [myComplaintsForBooking, setMyComplaintsForBooking] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [complaintSubmitting, setComplaintSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

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

    const customerUserId = booking?.customer?.user?.userId
        ?? booking?.customer?.userId
        ?? null;
    const workerUserId = booking?.worker?.user?.userId
        ?? booking?.worker?.userId
        ?? null;

    const isCustomer = customerUserId === user?.userId;
    const isWorker = workerUserId === user?.userId;
    const isParticipant = isCustomer || isWorker;
    const isCompleted = booking?.bookingStatus === 'completed';
    const canLeaveFeedback = isCompleted && isParticipant;
    const counterpartUserId = isCustomer ? workerUserId : customerUserId;
    const reviewerType = isWorker ? 'worker' : 'customer';

    const loadFeedbackData = async () => {
        if (!canLeaveFeedback || !booking?.bookingId) {
            setMyReviewForBooking(null);
            setMyComplaintsForBooking([]);
            return;
        }

        setFeedbackLoading(true);
        try {
            const [reviewsRes, complaintsRes] = await Promise.allSettled([
                reviewAPI.getMine(),
                complaintAPI.getMine(),
            ]);

            if (reviewsRes.status === 'fulfilled') {
                const mine = reviewsRes.value.data.data || [];
                const found = mine.find(r => r.booking?.bookingId === booking.bookingId) || null;
                setMyReviewForBooking(found);
            } else {
                setMyReviewForBooking(null);
            }

            if (complaintsRes.status === 'fulfilled') {
                const mine = complaintsRes.value.data.data || [];
                const linked = mine.filter(c => c.booking?.bookingId === booking.bookingId);
                setMyComplaintsForBooking(linked);
            } else {
                setMyComplaintsForBooking([]);
            }
        } finally {
            setFeedbackLoading(false);
        }
    };

    useEffect(() => {
        loadFeedbackData();
    }, [booking?.bookingId, booking?.bookingStatus, user?.userId]);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!counterpartUserId) {
            setFeedbackMessage('Unable to identify who should be reviewed for this booking.');
            return;
        }

        setReviewSubmitting(true);
        setFeedbackMessage('');
        try {
            await reviewAPI.submit({
                bookingId: booking.bookingId,
                revieweeId: counterpartUserId,
                rating: reviewForm.rating,
                reviewText: reviewForm.reviewText,
                reviewerType,
            });
            setFeedbackMessage('Review submitted successfully.');
            await loadFeedbackData();
        } catch (err) {
            setFeedbackMessage(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const submitComplaint = async (e) => {
        e.preventDefault();
        if (!counterpartUserId) {
            setFeedbackMessage('Unable to identify who the complaint should be against for this booking.');
            return;
        }

        setComplaintSubmitting(true);
        setFeedbackMessage('');
        try {
            await complaintAPI.submit({
                complaintCategory: complaintForm.complaintCategory,
                complaintTitle: complaintForm.complaintTitle,
                complaintDescription: complaintForm.complaintDescription,
                bookingId: booking.bookingId,
                complainedAgainstUserId: counterpartUserId,
                reviewId: myReviewForBooking?.reviewId || null,
            });
            setComplaintForm({
                complaintCategory: 'other',
                complaintTitle: '',
                complaintDescription: '',
            });
            setFeedbackMessage('Complaint submitted successfully.');
            await loadFeedbackData();
        } catch (err) {
            setFeedbackMessage(err.response?.data?.message || 'Failed to submit complaint.');
        } finally {
            setComplaintSubmitting(false);
        }
    };

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
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>
                                    {booking.customer?.user?.email || booking.customer?.email || 'N/A'}
                                </div>
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

                    {canLeaveFeedback && (
                        <div className="hm-card" style={{ padding: 20, marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 6 }}>Post-Completion Feedback</h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                                Add your rating, review, or complaint directly for this booking.
                            </p>

                            {feedbackMessage && (
                                <div className={feedbackMessage.toLowerCase().includes('success') ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                                    {feedbackMessage}
                                </div>
                            )}

                            {feedbackLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0891b2', fontSize: 13 }}>
                                    <span className="spinner" /> Loading feedback details...
                                </div>
                            ) : (
                                <>
                                    <div style={{ marginBottom: 18, padding: 14, border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>Rating & Review</h4>
                                            {myReviewForBooking && <span className="badge badge-green">Submitted</span>}
                                        </div>

                                        {myReviewForBooking ? (
                                            <div>
                                                <div style={{ fontSize: 20, marginBottom: 6 }}>
                                                    {STARS.map(s => (
                                                        <span key={s} style={{ color: s <= myReviewForBooking.overallRating ? '#f59e0b' : '#cbd5e1' }}>★</span>
                                                    ))}
                                                </div>
                                                <div style={{ fontSize: 13, color: '#475569' }}>
                                                    {myReviewForBooking.reviewText || 'No written review provided.'}
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <div>
                                                    <label className="hm-label">Rating</label>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        {STARS.map(s => (
                                                            <button
                                                                key={s}
                                                                type="button"
                                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: 28,
                                                                    color: s <= reviewForm.rating ? '#f59e0b' : '#cbd5e1',
                                                                    lineHeight: 1,
                                                                }}
                                                            >
                                                                ★
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="hm-label">Review (optional)</label>
                                                    <textarea
                                                        className="hm-input"
                                                        rows={3}
                                                        style={{ resize: 'vertical' }}
                                                        placeholder="Share your experience..."
                                                        value={reviewForm.reviewText}
                                                        onChange={e => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                                                    />
                                                </div>
                                                <button type="submit" className="btn-primary" disabled={reviewSubmitting} style={{ alignSelf: 'flex-start' }}>
                                                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                                </button>
                                            </form>
                                        )}
                                    </div>

                                    <div style={{ padding: 14, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff7ed' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#9a3412', margin: 0 }}>Complaint</h4>
                                            {myComplaintsForBooking.length > 0 && (
                                                <span className="badge badge-orange">{myComplaintsForBooking.length} submitted</span>
                                            )}
                                        </div>

                                        {myComplaintsForBooking.length > 0 && (
                                            <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {myComplaintsForBooking.map(c => (
                                                    <div key={c.complaintId} style={{ padding: 10, borderRadius: 10, border: '1px solid #fed7aa', background: '#fff' }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>{c.complaintTitle}</div>
                                                        <div style={{ fontSize: 12, color: '#7c2d12', textTransform: 'capitalize' }}>
                                                            {c.complaintCategory?.replace(/_/g, ' ')} · {c.complaintStatus}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <form onSubmit={submitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div>
                                                <label className="hm-label">Category</label>
                                                <select
                                                    className="hm-input"
                                                    value={complaintForm.complaintCategory}
                                                    onChange={e => setComplaintForm(prev => ({ ...prev, complaintCategory: e.target.value }))}
                                                >
                                                    {COMPLAINT_CATEGORIES.map(c => (
                                                        <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="hm-label">Title</label>
                                                <input
                                                    className="hm-input"
                                                    required
                                                    value={complaintForm.complaintTitle}
                                                    onChange={e => setComplaintForm(prev => ({ ...prev, complaintTitle: e.target.value }))}
                                                    placeholder="Short summary of the issue"
                                                />
                                            </div>
                                            <div>
                                                <label className="hm-label">Description</label>
                                                <textarea
                                                    className="hm-input"
                                                    rows={3}
                                                    required
                                                    style={{ resize: 'vertical' }}
                                                    value={complaintForm.complaintDescription}
                                                    onChange={e => setComplaintForm(prev => ({ ...prev, complaintDescription: e.target.value }))}
                                                    placeholder="Provide details to help investigation"
                                                />
                                            </div>
                                            <button type="submit" className="btn-secondary" disabled={complaintSubmitting} style={{ alignSelf: 'flex-start' }}>
                                                {complaintSubmitting ? 'Submitting...' : 'Submit Complaint'}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
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
