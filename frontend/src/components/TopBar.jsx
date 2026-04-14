import { useAuth } from '../AuthContext';

export default function TopBar({ title, subtitle, onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-600">notifications</span>
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-xs font-semibold text-slate-500 capitalize hidden sm:block">
              {user?.role}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13ecec] to-[#0ea5a5] flex items-center justify-center text-white text-xs font-bold">
              {(user?.email || '').split('@')[0].slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
