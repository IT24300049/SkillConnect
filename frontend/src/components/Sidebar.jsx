import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NAV_CONFIG = {
  customer: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/workers', icon: 'engineering', label: 'Browse Workers' },
    { to: '/jobs', icon: 'work', label: 'My Jobs' },
    { to: '/bookings', icon: 'calendar_today', label: 'My Bookings' },
    { to: '/equipment', icon: 'handyman', label: 'Equipment' },
    { to: '/messages', icon: 'chat', label: 'Messages' },
    { to: '/reviews', icon: 'star', label: 'Reviews' },
  ],
  worker: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/jobs', icon: 'work', label: 'Available Jobs' },
    { to: '/bookings', icon: 'task_alt', label: 'My Jobs' },
    { to: '/messages', icon: 'chat', label: 'Messages' },
    { to: '/reviews', icon: 'star', label: 'Reviews' },
    { to: '/equipment', icon: 'handyman', label: 'Equipment' },
  ],
  supplier: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/equipment', icon: 'inventory_2', label: 'My Inventory' },
    { to: '/bookings', icon: 'calendar_today', label: 'Rental Bookings' },
    { to: '/messages', icon: 'chat', label: 'Messages' },
    { to: '/reviews', icon: 'star', label: 'Reviews' },
  ],
  admin: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/users', icon: 'group', label: 'Users' },
    { to: '/workers', icon: 'engineering', label: 'Workers' },
    { to: '/jobs', icon: 'work', label: 'Jobs' },
    { to: '/bookings', icon: 'calendar_today', label: 'Bookings' },
    { to: '/equipment', icon: 'handyman', label: 'Equipment' },
    { to: '/reviews', icon: 'star', label: 'Reviews' },
    { to: '/messages', icon: 'chat', label: 'Messages' },
  ],
};

function getInitials(email = '') {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_CONFIG[user?.role] || NAV_CONFIG.customer;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 flex-shrink-0 border-r border-slate-200 bg-white
          flex flex-col transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 bg-[#13ecec] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-900 text-xl">construction</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">SkilledWorker</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#13ecec]/10 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#13ecec] to-[#0ea5a5] flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
