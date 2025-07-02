import { Outlet, useNavigate } from 'react-router-dom';

export function DashboardLayout() {
  const user = localStorage.getItem('user');
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <div className="w-64 bg-slate-800 p-4 space-y-6">
        <div className="font-bold text-lg mb-4">👤 {user}</div>
        <button onClick={() => navigate('/dashboard/solves')} className="block w-full text-left hover:text-blue-400">Solves</button>
        <button onClick={() => navigate('/dashboard/averages')} className="block w-full text-left hover:text-blue-400">Averages</button>
        <button onClick={() => navigate('/dashboard/learn')} className="block w-full text-left hover:text-blue-400">Learn</button>
        <button onClick={() => navigate('/dashboard/improve')} className="block w-full text-left hover:text-blue-400">Improve</button>
      </div>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
