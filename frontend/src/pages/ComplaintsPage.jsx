import { useState, useEffect, useRef } from 'react';
import { complaintAPI, workerAPI } from '../api';
import { useAuth } from '../AuthContext';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = ['service_quality', 'inappropriate_behavior', 'fraud', 'payment_issue', 'other'];

const MODAL = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 550, padding: 106, paddingTop: 199
};
const CARD_MODAL = {
    background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    padding: 32, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto'
};
const FILE_BASE_URL = 'http://localhost:8083';

const MAX_IMAGE_COUNT = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ComplaintsPage() {
    const { user } = useAuth();
    const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
    const [complaints, setComplaints] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ complaintCategory: 'other', complaintTitle: '', complaintDescription: '', bookingId: '', complainedAgainstUserId: '' });
    const [selectedImages, setSelectedImages] = useState([]);
    const [imageError, setImageError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const fileInputRef = useRef(null);

    const load = async () => {
        setLoading(true); setError('');
        try {
            const res = isAdmin ? await complaintAPI.getAll() : await complaintAPI.getMine();
            setComplaints(res.data.data || []);
        } catch { setError('Failed to load complaints.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        const loadWorkers = async () => {
            if (isAdmin) return;
            try {
                const res = await workerAPI.getAll();
                setWorkers(res.data.data || []);
            } catch {
                setWorkers([]);
            }
        };
        loadWorkers();
    }, [isAdmin]);

    useEffect(() => {
        return () => {
            selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [selectedImages]);

    const closeForm = () => {
        selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setSelectedImages([]);
        setImageError('');
        setShowForm(false);
        setForm({ complaintCategory: 'other', complaintTitle: '', complaintDescription: '', bookingId: '', complainedAgainstUserId: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageSelection = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) {
            return;
        }

        setImageError('');

        const nextImages = [...selectedImages];
        for (const file of files) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setImageError('Only JPEG, PNG, and WebP images are allowed.');
                continue;
            }
            if (file.size > MAX_IMAGE_BYTES) {
                setImageError('Each image must be 5MB or less.');
                continue;
            }
            if (nextImages.length >= MAX_IMAGE_COUNT) {
                setImageError('You can upload up to 3 images only.');
                break;
            }
            nextImages.push({
                file,
                previewUrl: URL.createObjectURL(file),
            });
        }

        setSelectedImages(nextImages);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeSelectedImage = (index) => {
        const target = selectedImages[index];
        if (target) {
            URL.revokeObjectURL(target.previewUrl);
        }
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
        setImageError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.complainedAgainstUserId) {
            alert('Please select a worker to submit this complaint.');
            return;
        }

        if (selectedImages.length < 1) {
            setImageError('Please upload at least 1 image.');
            return;
        }
        if (selectedImages.length > MAX_IMAGE_COUNT) {
            setImageError('You can upload up to 3 images only.');
            return;
        }

        try {
            await complaintAPI.submitWithImages({
                ...form,
                bookingId: form.bookingId ? parseInt(form.bookingId, 10) : null,
                complainedAgainstUserId: form.complainedAgainstUserId ? parseInt(form.complainedAgainstUserId, 10) : null,
            }, selectedImages.map((item) => item.file));
            closeForm();
            await load();
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const handleStatusUpdate = async (id, status) => {
        try { await complaintAPI.updateStatus(id, status); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this complaint?')) return;
        try { await complaintAPI.delete(id); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const filtered = complaints.filter(c => {
        const matchStatus = !statusFilter || c.complaintStatus === statusFilter;
        const matchSearch = !search || c.complaintTitle?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    const resolveImageUrl = (url) => {
        if (!url) {
            return '';
        }
        const clean = String(url).trim();
        if (/^https?:\/\//i.test(clean)) {
            return clean;
        }
        if (clean.startsWith('/')) {
            return `${FILE_BASE_URL}${clean}`;
        }
        return `${FILE_BASE_URL}/${clean}`;
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📢 Complaints</h1>
                    <p className="page-subtitle">{isAdmin ? 'Manage all platform complaints' : 'Submit and track your complaints'}</p>
                </div>
                {!isAdmin && (
                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#f97316,#9a3412)' }}
                        onClick={() => setShowForm(true)}>+ Submit Complaint</button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input className="hm-input" style={{ flex: 1, minWidth: 200 }} placeholder="Search by title..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select className="hm-input" style={{ minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#0891b2' }}>
                    <span className="spinner" /> Loading complaints...
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📢</span>
                    <p>No complaints found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filtered.map(c => (
                        <div key={c.complaintId} className="hm-card" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                        <h3 style={{ fontWeight: 800, fontSize: 14, color: '#0c4a6e' }}>{c.complaintTitle}</h3>
                                        <StatusBadge status={c.complaintStatus} />
                                        <span className="badge badge-orange" style={{ textTransform: 'capitalize' }}>{c.complaintCategory?.replace(/_/g, ' ')}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 6 }}>{c.complaintDescription}</p>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                        {c.complainant?.email || 'Unknown'} · {formatDate(c.createdAt)}
                                        {c.booking && <> · Booking #{c.booking.bookingId}</>}
                                        {c.complainedAgainst && <> · Against {c.complainedAgainst.email}</>}
                                    </div>
                                    {Array.isArray(c.complaintImages) && c.complaintImages.length > 0 && (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                            {c.complaintImages.map((img) => (
                                                <a key={img.complaintImageId || img.imageUrl} href={resolveImageUrl(img.imageUrl)} target="_blank" rel="noreferrer"
                                                    style={{ display: 'inline-flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                                                    <img
                                                        src={resolveImageUrl(img.imageUrl)}
                                                        alt="Complaint evidence"
                                                        style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }}
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                        {c.complaintStatus === 'pending' && (
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                                                onClick={() => handleStatusUpdate(c.complaintId, 'investigating')}>Investigate</button>
                                        )}
                                        {['pending', 'investigating'].includes(c.complaintStatus) && (
                                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 11, justifyContent: 'center' }}
                                                onClick={() => handleStatusUpdate(c.complaintId, 'resolved')}>Resolve</button>
                                        )}
                                        {c.complaintStatus !== 'rejected' && (
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                                                onClick={() => handleStatusUpdate(c.complaintId, 'rejected')}>Reject</button>
                                        )}
                                        <button className="btn-danger" style={{ padding: '6px 12px', fontSize: 11 }}
                                            onClick={() => handleDelete(c.complaintId)}>🗑</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Modal */}
            {showForm && (
                <div style={MODAL} onClick={closeForm}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>📢 Submit Complaint</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="hm-label">Category</label>
                                <select className="hm-input" value={form.complaintCategory} onChange={e => setForm({ ...form, complaintCategory: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="hm-label">Worker</label>
                                <select className="hm-input" required value={form.complainedAgainstUserId} onChange={e => setForm({ ...form, complainedAgainstUserId: e.target.value })}>
                                    <option value="">Select worker</option>
                                    {workers.map(w => (
                                        <option key={w.workerId} value={w.user?.userId || ''}>
                                            {w.firstName} {w.lastName}{w.district ? ` - ${w.district}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="hm-label">Title</label>
                                <input className="hm-input" required value={form.complaintTitle} onChange={e => setForm({ ...form, complaintTitle: e.target.value })} />
                            </div>
                            <div>
                                <label className="hm-label">Description</label>
                                <textarea className="hm-input" required rows={3} style={{ resize: 'vertical' }}
                                    value={form.complaintDescription} onChange={e => setForm({ ...form, complaintDescription: e.target.value })} />
                            </div>
                            <div>
                                <label className="hm-label">Related Booking ID (optional)</label>
                                <input className="hm-input" type="number" value={form.bookingId} onChange={e => setForm({ ...form, bookingId: e.target.value })} />
                            </div>
                            <div>
                                <label className="hm-label">Issue Images (1-3)</label>
                                <input
                                    ref={fileInputRef}
                                    className="hm-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleImageSelection}
                                />
                                <div style={{ marginTop: 6, fontSize: 11, color: '#64748b' }}>
                                    JPEG, PNG, or WebP. Max 5MB each.
                                </div>
                                {imageError && (
                                    <div style={{ marginTop: 6, color: '#dc2626', fontSize: 12 }}>{imageError}</div>
                                )}
                                {selectedImages.length > 0 && (
                                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {selectedImages.map((item, index) => (
                                            <div key={`${item.file.name}-${index}`} style={{ position: 'relative' }}>
                                                <img
                                                    src={item.previewUrl}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedImage(index)}
                                                    style={{
                                                        position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                                                        borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
                                                        fontSize: 12, cursor: 'pointer', lineHeight: 1
                                                    }}
                                                    aria-label="Remove image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#f97316,#9a3412)' }}>Submit</button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={closeForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
