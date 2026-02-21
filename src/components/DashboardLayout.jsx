import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { Menu, X, Copy, ExternalLink, LogOut, LayoutDashboard, Calculator, BookOpen, TrendingUp, Timer } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function DashboardLayout() {
  const user = localStorage.getItem('user');
  const shareLink = localStorage.getItem('shareLink');
  const publicUrl = `https://cubey-nine.vercel.app/${shareLink}`;

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
    <div className="flex min-h-screen bg-background text-text-main font-quick">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {/* Sidebar */}
      <aside className={`
        fixed z-30 top-0 left-0 h-full w-72 
        bg-surface/95 backdrop-blur-xl border-r border-border
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        flex flex-col shadow-2xl
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-mont text-primary tracking-wide">Cubey</h1>
            <button className="text-text-muted hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 bg-background/50 rounded-lg border border-border/50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold">
              {user?.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user}</p>
              <p className="text-xs text-text-muted truncate">Speedcuber</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/50 space-y-4">
          <div className="p-3 bg-background/50 rounded-lg border border-border/50 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Public Profile</span>
              {copied && <span className="text-green-400 animate-pulse">Copied!</span>}
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-black/20 p-1.5 rounded truncate text-text-muted">
                {shareLink}
              </code>
              <button onClick={handleCopy} className="text-text-muted hover:text-primary transition">
                <Copy size={14} />
              </button>
              <button onClick={() => window.open(publicUrl, '_blank')} className="text-text-muted hover:text-primary transition">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
             <ThemeToggle className="w-full justify-center bg-surface hover:bg-surface-hover border border-border" />
          </div>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(true)} className="text-text-main p-2 hover:bg-surface-hover rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold font-mont text-primary">Cubey</h1>
        </div>

        {/* Content Area - full bleed for Timer, contained for other pages */}
        <div className={`flex-1 flex flex-col min-h-0 ${location.pathname === '/dashboard/timer' ? 'overflow-hidden' : 'overflow-auto p-4 md:p-8 bg-gradient-to-br from-background via-background to-surface/20'}`}>
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
