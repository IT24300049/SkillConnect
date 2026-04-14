import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { workerAPI, bookingAPI, jobAPI, reviewAPI, equipmentAPI } from '../api';

const PIE_COLORS_STATUS = {
    pending: '#f59e0b', accepted: '#3b82f6', in_progress: '#8b5cf6',
    completed: '#10b981', cancelled: '#ef4444',
};
const PIE_COLORS_ROLE = {
    customer: '#3b82f6', worker: '#10b981', supplier: '#8b5cf6', admin: '#ef4444',
};

function countBy(arr, key) {
    const map = {};
    arr.forEach(item => {
        const val = typeof key === 'function' ? key(item) : item[key];
        if (val) map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default function AdminReportsPage() {
    const [stats, setStats] = useState({ users: 0, bookings: 0, jobs: 0, equipment: 0, reviews: 0 });
    const [bookingsByStatus, setBookingsByStatus] = useState([]);
    const [usersByRole, setUsersByRole] = useState([]);
    const [topWorkers, setTopWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const results = await Promise.allSettled([
                workerAPI.getAllUsers(),
                bookingAPI.getAll(),
                jobAPI.getAll({}),
                equipmentAPI.getAvailable(),
                reviewAPI.getAll(),
            ]);

            const get = (i) => results[i]?.status === 'fulfilled' ? (results[i].value?.data?.data || []) : [];

            const users = get(0);
            const bookings = get(1);
            const jobs = get(2);
            const equipment = get(3);
            const reviews = get(4);

            setStats({
                users: users.length,
                bookings: bookings.length,
                jobs: jobs.length,
                equipment: equipment.length,
                reviews: reviews.length,
            });

            setBookingsByStatus(countBy(bookings, 'bookingStatus'));
            setUsersByRole(countBy(users, 'role'));

            const workers = users.filter(u => u.role === 'worker').slice(0, 5);
            setTopWorkers(workers);

            setLoading(false);
        };
        load();
    }, []);

    if (loading) return (
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#0891b2' }}>
            <span className="spinner" /> Loading reports...
        </div>
    );

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Admin Reports</h1>
                    <p className="page-subtitle">Platform analytics and insights</p>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
                {[
                    { label: 'Total Users', value: stats.users, icon: '👥', color: '#e0f2fe' },
                    { label: 'Bookings', value: stats.bookings, icon: '📅', color: '#d1fae5' },
                    { label: 'Jobs Posted', value: stats.jobs, icon: '📋', color: '#ffedd5' },
                    { label: 'Equipment', value: stats.equipment, icon: '🔧', color: '#ede9fe' },
                    { label: 'Reviews', value: stats.reviews, icon: '⭐', color: '#fef3c7' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#0c4a6e' }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 20, marginBottom: 28 }}>
                {/* Bookings by Status */}
                <div className="hm-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Bookings by Status</h3>
                    {bookingsByStatus.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: 13 }}>No booking data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={bookingsByStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                                    {bookingsByStatus.map((entry) => (
                                        <Cell key={entry.name} fill={PIE_COLORS_STATUS[entry.name] || '#94a3b8'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Users by Role */}
                <div className="hm-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Users by Role</h3>
                    {usersByRole.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: 13 }}>No user data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={usersByRole} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                                    {usersByRole.map((entry) => (
                                        <Cell key={entry.name} fill={PIE_COLORS_ROLE[entry.name] || '#94a3b8'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Bookings Bar Chart */}
            {bookingsByStatus.length > 0 && (
                <div className="hm-card" style={{ padding: 24, marginBottom: 28 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Booking Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bookingsByStatus}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Top Workers */}
            <div className="hm-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Recent Workers</h3>
                {topWorkers.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: 13 }}>No worker data available.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f0f9ff', textAlign: 'left' }}>
                                    {['#', 'Email', 'Role', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', fontWeight: 700, color: '#0c4a6e', fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topWorkers.map((w, i) => (
                                    <tr key={w.userId} style={{ borderTop: '1px solid #e0f2fe' }}>
                                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{i + 1}</td>
                                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0c4a6e' }}>{w.email}</td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{w.role}</span>
                                        </td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <span className={`badge ${w.isActive ? 'badge-green' : 'badge-red'}`}>
                                                {w.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
