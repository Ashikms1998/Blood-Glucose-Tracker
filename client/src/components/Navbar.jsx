import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition ${
      isActive
        ? 'bg-teal-50 text-teal-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-teal-600">Sweety</span>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={linkClass}>
              Readings
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 hidden sm:inline">
            Hi, {user?.name}
          </span>
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}