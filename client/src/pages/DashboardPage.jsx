import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-teal-600">Sweety</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Hi, {user?.name}</span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Auth is working! Next step: Add, view, edit &amp; delete glucose readings.
          </p>
        </div>
      </main>
    </div>
  );
}