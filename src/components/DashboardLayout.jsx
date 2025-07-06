import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { NavButton } from './ui/NavButton';
import { Menu, X } from 'lucide-react';

export function DashboardLayout() {
  const user = localStorage.getItem('user');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <div className={`fixed z-30 top-0 left-0 h-full bg-slate-800 p-4 space-y-6 w-64 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col md:h-screen`}>
        <div className="flex items-center justify-between md:justify-center">
          <div className="font-bold text-lg mb-4">{user}</div>
          {/* close button for mobile */}
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <NavButton text="Solves" onClick={() => { navigate('/dashboard/solves'); setSidebarOpen(false); }} />
        <NavButton text="Averages" onClick={() => { navigate('/dashboard/averages'); setSidebarOpen(false); }} />
        <NavButton text="Learn" onClick={() => { navigate('/dashboard/learn'); setSidebarOpen(false); }} />
        <NavButton text="Improve" onClick={() => { navigate('/dashboard/improve'); setSidebarOpen(false); }} />
      </div>
      {/* main content */}
      <div className="flex-1 p-4 md:p-6">
        {/* hamburger button */}
        <div className="md:hidden mb-4">
          <button onClick={() => setSidebarOpen(true)} className="text-white focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
