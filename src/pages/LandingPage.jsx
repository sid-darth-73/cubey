import { useNavigate } from 'react-router-dom';
import { Trophy, Timer, BookOpen, Share2, Upload } from 'lucide-react';
import SEO from '../components/SEO';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Trophy,
      title: 'Track PBs',
      description: 'Monitor your best singles and averages with detailed statistics.',
    },
    {
      icon: Timer,
      title: 'Smart Timer',
      description: 'Train smarter with our built-in timer and scramble generator.',
    },
    {
      icon: BookOpen,
      title: 'Learn Algs',
      description: 'Master new algorithms and transition from 2-Look to full CFOP and beyond',
    },
    {
      icon: Share2,
      title: 'Social Profile',
      description: 'Share your achievements with a unique public profile link.',
    },
    {
      icon: Upload,
      title: 'Import Data',
      description: 'Seamlessly import your solve history from other timers.',
    },
  ];

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{ backgroundColor: '#121212', color: '#ffffff' }}
    >
      <SEO
        title="Home"
        description="Level up your speedcubing with Speed Solver Social's timer, algorithm trainer, and statistics dashboard."
      />

      {/* Nav */}
      <nav
        className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto"
        style={{ borderBottom: '1px solid #282828' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-black text-xs font-black"
            style={{ backgroundColor: '#1ed760' }}
          >
            S
          </div>
          <span className="text-[16px] font-bold text-white">Speed Solver Social</span>
        </div>

        {/* Nav Actions */}
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate('/signin')}
            className="px-5 py-2 rounded-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all duration-200"
            style={{ color: '#b3b3b3', backgroundColor: 'transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#b3b3b3';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2 rounded-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95"
            style={{ backgroundColor: '#1ed760', color: '#000000' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1db954'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1ed760'}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 px-6 pt-20 pb-16 max-w-5xl mx-auto flex flex-col items-center text-center">
        <p
          className="text-[12px] font-bold uppercase tracking-[2px] mb-4"
          style={{ color: '#1ed760' }}
        >
          The Speedcubing Platform
        </p>

        <h1 className="text-[48px] md:text-[72px] font-bold leading-[1.05] mb-6 tracking-tight">
          Level Up Your
          <br />
          <span style={{ color: '#1ed760' }}>Speedcubing</span>
        </h1>

        <p
          className="text-[16px] md:text-[18px] max-w-2xl mb-10 leading-relaxed font-normal"
          style={{ color: '#b3b3b3' }}
        >
          The all-in-one platform to time, track, learn, and share your speedcubing journey.
          Analyze your solves and break your PBs.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-24">
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-3.5 rounded-full text-[14px] font-bold uppercase tracking-[2px] transition-all duration-200 active:scale-95"
            style={{ backgroundColor: '#1ed760', color: '#000000' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1db954'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1ed760'}
          >
            Start Cubing Now
          </button>
          <button
            onClick={() => navigate('/signin')}
            className="px-10 py-3.5 rounded-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #7c7c7c',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Login
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full text-left">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#181818'}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#1ed760' }}
                >
                  <Icon size={18} style={{ color: '#000000' }} />
                </div>
                <h3 className="text-[16px] font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: '#b3b3b3' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-6 text-center text-[12px]"
        style={{ color: '#b3b3b3', borderTop: '1px solid #282828' }}
      >
        <p>
          Made with <span style={{ color: '#f3727f' }}>♥</span> by{' '}
          <a
            href="https://github.com/sid-darth-73/Speed Solver Social"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-colors"
            style={{ color: '#b3b3b3' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
          >
            unbit
          </a>
        </p>
      </footer>
    </div>
  );
};
