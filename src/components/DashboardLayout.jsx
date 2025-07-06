import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { NavButton } from './ui/NavButton';
import { Menu, X, Copy, ExternalLink } from 'lucide-react';

export function DashboardLayout() {
  const user = localStorage.getItem('user');
  const shareLink = localStorage.getItem('shareLink');
  const publicUrl = `http://localhost:5173/${shareLink}`;

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white font-quick">

      {/* sidebar */}
      <div className={`fixed z-30 top-0 left-0 h-full bg-slate-800 p-4 space-y-6 w-64 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col md:h-screen`}>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between md:justify-center">
            <div className="font-bold text-lg font-mont truncate max-w-[160px]">{user}</div>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-slate-300 hover:text-white" />
            </button>
          </div>

          {/* public link */}
          <div className="text-sm text-slate-300 bg-slate-700 bg-opacity-30 p-2 rounded-md flex items-center justify-between hover:bg-slate-600 transition">
            <span className="truncate max-w-[140px]">{publicUrl}</span>
            <button onClick={handleCopy} className="ml-2 text-slate-400 hover:text-blue-400 transition">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <span className="text-green-400 text-xs animate-pulse ml-1">Copied!</span>}

          {/* public page link */}
          <button onClick={() => window.open(publicUrl, '_blank')} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition hover:underline">
            <ExternalLink className="w-4 h-4 text-center" />
            View Public Page
          </button>
        </div>

        {/* nav buttons */}
        <NavButton text="Solves" onClick={() => { navigate('/dashboard/solves'); setSidebarOpen(false); }} />
        <NavButton text="Averages" onClick={() => { navigate('/dashboard/averages'); setSidebarOpen(false); }} />
        <NavButton text="Learn" onClick={() => { navigate('/dashboard/learn'); setSidebarOpen(false); }} />
        <NavButton text="Improve" onClick={() => { navigate('/dashboard/improve'); setSidebarOpen(false); }} />
      </div>

      {/* main content */}
      <div className="flex-1 p-4 md:p-6">
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
