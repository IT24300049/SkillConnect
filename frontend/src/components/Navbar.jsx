import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Home', icon: '⌂' },
    { path: '/workers', label: 'Workers', icon: '👷' },
    { path: '/jobs', label: 'Jobs', icon: '📋' },
    { path: '/bookings', label: 'Bookings', icon: '📅' },
    { path: '/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/equipment', label: 'Equipment', icon: '🔧' },
    { path: '/complaints', label: 'Complaints', icon: '⚠' },
    { path: '/messages', label: 'Messages', icon: '💬' },
];

const ROLE_STYLES = {
    customer: { bg: '#dcfce7', color: '#15803d', label: 'Customer' },
    worker: { bg: '#dbeafe', color: '#1d4ed8', label: 'Worker' },
    supplier: { bg: '#ede9fe', color: '#6d28d9', label: 'Supplier' },
    admin: { bg: '#fee2e2', color: '#b91c1c', label: 'Admin' },
};

function getNavItems(role) {
    switch (role) {
        case 'worker': return NAV_ITEMS.filter(i => i.path !== '/workers');
        case 'supplier': return NAV_ITEMS.filter(i => ['/dashboard', '/equipment', '/messages'].includes(i.path));
        case 'admin': return [
            ...NAV_ITEMS,
            { path: '/admin/users', label: 'Users', icon: '👥' },
            { path: '/admin/reports', label: 'Reports', icon: '📊' },
            { path: '/admin/verifications', label: 'Verifications', icon: '✅' },
        ];
        default: return NAV_ITEMS;
    }
}

function initials(email = '') {
    return email.split('@')[0].slice(0, 2).toUpperCase();
}

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [hovered, setHovered] = useState(null);
    const items = getNavItems(user?.role);
    const roleStyle = ROLE_STYLES[user?.role] || { bg: '#f1f5f9', color: '#475569', label: user?.role };

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <header style={{
            background: 'rgba(15,23,42,0.94)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            borderBottom: '1px solid rgba(249,115,22,0.45)',
            position: 'sticky',
            top: 0,
            zIndex: 200,
            boxShadow: '0 14px 30px rgba(15,23,42,0.55)',
        }}>
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                padding: '8px 24px',
                minHeight: 62,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>

                {/* ── Logo ── */}
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'none', border: 'none', cursor: 'pointer',
                        flexShrink: 0, padding: '4px 12px 4px 0',
                        marginRight: 8,
                    }}
                >
                    <div style={{
                        width: 34, height: 34,
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 16, fontWeight: 900,
                        boxShadow: '0 4px 16px rgba(249,115,22,0.55)',
                        flexShrink: 0,
                    }}>S</div>
                    <span style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800, fontSize: 17,
                        background: 'linear-gradient(135deg, #fef9c3, #fed7aa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                    }}>
                        SkillConnect
                    </span>
                </button>

                {/* ── Nav links ── */}
                <nav style={{
                    display: 'flex',
                    flex: 1,
                    gap: 4,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}>
                    {items.map(item => {
                        const active = location.pathname === item.path
                            || (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
                        const isHovered = hovered === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                onMouseEnter={() => setHovered(item.path)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    padding: '6px 13px',
                                    borderRadius: 10,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 13.5,
                                    fontFamily: "'Outfit', sans-serif",
                                    fontWeight: active ? 700 : 500,
                                    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                                    background: active
                                        ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                        : isHovered ? 'rgba(249,115,22,0.1)' : 'transparent',
                                    color: active ? '#fff' : isHovered ? '#f97316' : '#e5e7eb',
                                    boxShadow: active ? '0 4px 16px rgba(0,0,0,0.35)' : 'none',
                                    whiteSpace: 'nowrap',
                                    position: 'relative',
                                }}
                            >
                                {item.label}
                                {active && (
                                    <span style={{
                                        position: 'absolute', bottom: -1, left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 4, height: 4, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.7)',
                                    }} />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Right side ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>

                    {/* Role badge */}
                    <span style={{
                        background: roleStyle.bg,
                        color: roleStyle.color,
                        fontSize: 11, fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 99,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        fontFamily: "'Outfit', sans-serif",
                    }}>
                        {roleStyle.label}
                    </span>

                    {/* Avatar */}
                    <button
                        onClick={() => navigate('/profile')}
                        title={user?.email}
                        style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 900, fontSize: 12.5,
                            fontFamily: "'Outfit', sans-serif",
                            boxShadow: '0 3px 12px rgba(0,0,0,0.65)',
                            flexShrink: 0, border: '2px solid rgba(255,255,255,0.9)',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.8)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.65)'; }}
                    >
                        {initials(user?.email)}
                    </button>

                    {/* Sign out */}
                    <button
                        onClick={handleLogout}
                        style={{
                            background: '#fef2f2',
                            color: '#ef4444',
                            border: '1.5px solid #fecaca',
                            borderRadius: 10,
                            padding: '6px 14px',
                            fontSize: 12.5, fontWeight: 700,
                            fontFamily: "'Outfit', sans-serif",
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </header>
    );
}
