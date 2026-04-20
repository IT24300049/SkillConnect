import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, equipmentAPI } from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
    requested: { bg: 'bg-yellow-100', color: 'text-yellow-800', label: '⏳ Requested' },
    accepted: { bg: 'bg-blue-100', color: 'text-blue-800', label: '✓ Accepted' },
    in_progress: { bg: 'bg-purple-100', color: 'text-purple-800', label: '🔨 In Progress' },
    completed: { bg: 'bg-green-100', color: 'text-green-800', label: '✅ Completed' },
    cancelled: { bg: 'bg-red-100', color: 'text-red-800', label: '❌ Cancelled' },
    rejected: { bg: 'bg-gray-100', color: 'text-gray-800', label: '🚫 Rejected' },
};

const EQUIPMENT_STATUS_STYLE = {
    reserved: { bg: 'bg-yellow-100', color: 'text-yellow-800', label: 'Reserved' },
    rented_out: { bg: 'bg-blue-100', color: 'text-blue-800', label: 'Rented Out' },
    returned: { bg: 'bg-green-100', color: 'text-green-800', label: 'Returned' },
    cancelled: { bg: 'bg-red-100', color: 'text-red-800', label: 'Cancelled' },
    damaged: { bg: 'bg-red-100', color: 'text-red-800', label: 'Damaged' },
};

const TRANSITIONS = {
    requested: ['accepted', 'rejected', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: [],
};

const TABS = ['Pending', 'Upcoming', 'Completed', 'Cancelled'];
const SECTION_TABS = [
    { key: 'services', label: 'Service Bookings' },
    { key: 'equipment', label: 'Equipment Rentals' },
];

function matchesServiceTab(status, tab) {
    if (tab === 'Pending') return status === 'requested';
    if (tab === 'Upcoming') return ['accepted', 'in_progress'].includes(status);
    if (tab === 'Completed') return status === 'completed';
    if (tab === 'Cancelled') return ['cancelled', 'rejected'].includes(status);
    return true;
}

export default function BookingsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeSection, setActiveSection] = useState('services');
    const [bookings, setBookings] = useState([]);
    const [equipmentBookings, setEquipmentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [equipmentLoading, setEquipmentLoading] = useState(false);
    const [viewAs, setViewAs] = useState(user?.role === 'worker' ? 'worker' : 'customer');
    const [activeTab, setActiveTab] = useState('Pending');
    const [error, setError] = useState('');

    const loadServiceBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await bookingAPI.getMine(viewAs);
            setBookings(res.data.data || []);
        } catch (err) {
            if (err.response?.status === 404 && viewAs === 'worker') {
                setError('You do not have a worker profile yet.');
                setBookings([]);
            } else {
                setError('Failed to load bookings.');
            }
        } finally {
            setLoading(false);
        }
    }, [viewAs]);

    const loadEquipmentBookings = useCallback(async () => {
        setEquipmentLoading(true);
        try {
            const res = await equipmentAPI.getMyBookings();
            setEquipmentBookings(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load equipment rentals');
            setEquipmentBookings([]);
        } finally {
            setEquipmentLoading(false);
        }
    }, []);

    useEffect(() => {
        loadServiceBookings();
    }, [loadServiceBookings]);

    useEffect(() => {
        if (activeSection === 'equipment') {
            loadEquipmentBookings();
        }
    }, [activeSection, loadEquipmentBookings]);

    const handleStatusChange = async (bookingId, status) => {
        const reason = (status === 'cancelled' || status === 'rejected')
            ? prompt('Enter a reason (optional):') || ''
            : '';
        try {
            await bookingAPI.updateStatus(bookingId, status, reason);
            toast.success(`Status updated to ${status.replace('_', ' ')}`);
            loadServiceBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleEquipmentReturn = async (equipmentBookingId) => {
        try {
            await equipmentAPI.returnEquipment(equipmentBookingId);
            toast.success('Equipment marked as returned');
            loadEquipmentBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to return equipment');
        }
    };

    const filterBookings = () => bookings.filter((b) => matchesServiceTab(b.bookingStatus, activeTab));
    const countByTab = (tab) => bookings.filter((b) => matchesServiceTab(b.bookingStatus, tab)).length;

    const filteredBookings = filterBookings();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span>📅</span> My Bookings
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Viewing as a <strong className="text-cyan-700 capitalize">{viewAs}</strong>
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewAs('customer')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewAs === 'customer' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        As Customer
                    </button>
                    {user?.role === 'worker' && (
                        <button
                            onClick={() => setViewAs('worker')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewAs === 'worker' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            As Worker
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mb-5">
                {SECTION_TABS.map((section) => (
                    <button
                        key={section.key}
                        onClick={() => setActiveSection(section.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeSection === section.key ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {section.label}
                    </button>
                ))}
            </div>

            {activeSection === 'services' && (
                <>
                    <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            >
                                {tab} ({countByTab(tab)})
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-between mb-6 border border-red-100">
                            <span className="flex items-center gap-2">❌ {error}</span>
                            <button onClick={loadServiceBookings} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors">Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-48 text-cyan-600 font-medium text-lg">
                            <span className="spinner mr-3" /> Loading bookings...
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
                            <span className="text-6xl mb-4">📭</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No {activeTab} Bookings</h3>
                            <p className="text-slate-500 max-w-md">You don't have any {activeTab.toLowerCase()} bookings at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBookings.map((b) => {
                                const s = STATUS_STYLE[b.bookingStatus] || { bg: 'bg-slate-100', color: 'text-slate-800', label: b.bookingStatus };
                                const isWorkerSide = viewAs === 'worker';
                                return (
                                    <div key={b.bookingId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-bold text-slate-800">Booking #{b.bookingId}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.color}`}>{s.label}</span>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                {isWorkerSide && b.customer && (
                                                    <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Customer</span>
                                                        <span className="text-sm font-semibold text-slate-700">{b.customer.firstName} {b.customer.lastName}</span>
                                                    </div>
                                                )}
                                                {!isWorkerSide && b.worker && (
                                                    <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Worker</span>
                                                        <span className="text-sm font-semibold text-slate-700">{b.worker.firstName} {b.worker.lastName}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                                    <div className="bg-cyan-50 p-2 rounded-lg text-cyan-600">📅</div>
                                                    <div className="font-medium">{b.scheduledDate} {b.scheduledTime && `• ${b.scheduledTime}`}</div>
                                                </div>

                                                {b.notes && (
                                                    <div className="text-sm text-slate-500 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic line-clamp-2">
                                                        "{b.notes}"
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm" onClick={() => navigate(`/bookings/${b.bookingId}`)}>
                                                    View Details
                                                </button>

                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {TRANSITIONS[b.bookingStatus]?.map((status) => {
                                                        const isCancellation = status === 'cancelled';
                                                        const canWorkerChange = isWorkerSide;
                                                        const canCustomerCancel = !isWorkerSide && isCancellation;
                                                        if (!canWorkerChange && !canCustomerCancel) return null;

                                                        const btnClass = ['accepted', 'in_progress', 'completed'].includes(status)
                                                            ? 'bg-green-100 hover:bg-green-200 text-green-700 font-semibold'
                                                            : 'bg-red-100 hover:bg-red-200 text-red-700 font-semibold';

                                                        return (
                                                            <button key={status} onClick={() => handleStatusChange(b.bookingId, status)} className={`col-span-1 py-2 px-3 rounded-lg text-xs transition-colors ${btnClass}`}>
                                                                {status.replace(/_/g, ' ')}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeSection === 'equipment' && (
                <>
                    {equipmentLoading ? (
                        <div className="flex justify-center items-center h-48 text-cyan-600 font-medium text-lg">
                            <span className="spinner mr-3" /> Loading equipment rentals...
                        </div>
                    ) : equipmentBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
                            <span className="text-6xl mb-4">🔧</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Equipment Rentals</h3>
                            <p className="text-slate-500 max-w-md">Your equipment rental bookings will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {equipmentBookings.map((b) => {
                                const statusMeta = EQUIPMENT_STATUS_STYLE[b.bookingStatus] || { bg: 'bg-slate-100', color: 'text-slate-700', label: b.bookingStatus || 'Unknown' };
                                const isActive = b.bookingStatus === 'reserved' || b.bookingStatus === 'rented_out';
                                const hasLateFee = Number(b.lateFee || 0) > 0;
                                return (
                                    <div key={b.equipmentBookingId || b.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-slate-800">{b.equipmentName || b.equipment?.equipmentName || 'Equipment'}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusMeta.bg} ${statusMeta.color}`}>
                                                {statusMeta.label}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-slate-600 mb-5">
                                            <div>📅 {b.rentalStartDate} → {b.rentalEndDate}</div>
                                            <div>💰 Daily Rate: Rs.{b.dailyRate || b.equipment?.dailyRate || 0}</div>
                                            <div>🧾 Total Cost: Rs.{b.totalCost || 0}</div>
                                            {hasLateFee && (
                                                <div className="text-red-600 font-semibold">⚠️ Late fee: Rs.{b.lateFee}</div>
                                            )}
                                        </div>

                                        {isActive && (
                                            <button
                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl transition"
                                                onClick={() => handleEquipmentReturn(b.equipmentBookingId || b.id)}
                                            >
                                                Return Now
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
