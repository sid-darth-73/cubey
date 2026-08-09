import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Copy, ExternalLink, LogOut, LayoutDashboard, Calculator, BookOpen, TrendingUp, Timer } from 'lucide-react';

export function DashboardLayout() {
  const user = localStorage.getItem('user');
  const shareLink = localStorage.getItem('shareLink');
  const publicUrl = `https://speedsolversocial.in/${shareLink}`;

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('shareLink');
    window.dispatchEvent(new Event('user:loggedout'));
    navigate('/signin');
  };

  const navItems = [
    { path: '/dashboard/solves', label: 'Solves', icon: LayoutDashboard },
    { path: '/dashboard/timer', label: 'Timer', icon: Timer },
    { path: '/dashboard/averages', label: 'Averages', icon: Calculator },
    { path: '/dashboard/learn', label: 'Learn', icon: BookOpen },
    { path: '/dashboard/improve', label: 'Improve', icon: TrendingUp },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#121212', color: '#ffffff' }}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-30 top-0 left-0 h-full w-64
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: '#121212', borderRight: '1px solid #282828' }}
      >
        {/* Sidebar Header — Brand */}
        <div className="p-6" style={{ borderBottom: '1px solid #282828' }}>
          <div className="flex items-center justify-between mb-6">
            <span
              className="text-[18px] font-bold tracking-wide"
              style={{ color: '#1ed760' }}
            >
              Speed Solver Social
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-full transition-colors"
              style={{ color: '#b3b3b3' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
            >
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#1f1f1f' }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: '#1ed760', color: '#000000' }}
            >
              {user?.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user}</p>
              <p className="text-xs truncate" style={{ color: '#b3b3b3' }}>Speedcuber</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard/timer' && location.pathname === '/dashboard');

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-[14px] font-bold transition-all duration-150"
                style={
                  isActive
                    ? { backgroundColor: '#1f1f1f', color: '#ffffff' }
                    : { color: '#b3b3b3', backgroundColor: 'transparent' }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#1f1f1f';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#b3b3b3';
                  }
                }}
              >
                <Icon size={18} />
                {item.label}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#1ed760' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 space-y-3" style={{ borderTop: '1px solid #282828' }}>
          {/* Public profile link */}
          <div
            className="p-3 rounded-lg space-y-2"
            style={{ backgroundColor: '#1f1f1f' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest" style={{ color: '#b3b3b3' }}>
                Public Profile
              </span>
              {copied && (
                <span className="text-[11px] font-bold" style={{ color: '#1ed760' }}>Copied!</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-xs p-1.5 rounded truncate"
                style={{ backgroundColor: '#121212', color: '#b3b3b3' }}
              >
                {shareLink}
              </code>
              <button
                onClick={handleCopy}
                className="p-1 rounded transition-colors"
                style={{ color: '#b3b3b3' }}
                onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => window.open(publicUrl, '_blank')}
                className="p-1 rounded transition-colors"
                style={{ color: '#b3b3b3' }}
                onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-[14px] font-bold transition-all duration-150"
            style={{ color: '#f3727f', backgroundColor: 'transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(243,114,127,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: '#181818', borderBottom: '1px solid #282828' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full transition-colors"
            style={{ color: '#b3b3b3' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#b3b3b3';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Menu size={22} />
          </button>
          <span className="text-[16px] font-bold" style={{ color: '#1ed760' }}>
            Speed Solver Social
          </span>
          {/* Spacer to center the title */}
          <div className="w-9" />
        </div>

        {/* Content Area */}
        <div
          className={`flex-1 flex flex-col min-h-0 ${
            location.pathname === '/dashboard/timer' ? 'overflow-hidden' : 'overflow-auto p-4 md:p-8'
          }`}
          style={{ backgroundColor: '#121212' }}
        >
          {location.pathname === '/dashboard/timer' ? (
            <Outlet />
          ) : (
            <div className="max-w-6xl mx-auto space-y-6 w-full">
              <Outlet />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
