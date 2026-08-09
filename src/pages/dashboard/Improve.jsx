import { Card, CardContent } from "../../components/ui/Card";
import { Trophy, Timer, TrendingUp, Mail, Instagram, MessageCircle } from 'lucide-react';
import SEO from '../../components/SEO';

export function Improve() {
  const socialLinks = [
    {
      name: "Discord",
      icon: MessageCircle,
      url: "https://discord.com/users/771914664836726795",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com",
    },
    {
      name: "Email",
      icon: Mail,
      url: "https://mail.google.com/mail/?view=cm&fs=1&to=siddharthraj532@gmail.com",
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <SEO title="Improve" description="Get personalized feedback, solve critiques, and practice routines from an experienced speedcuber." />

      <div
        className="w-full max-w-2xl rounded-lg p-8 md:p-12"
        style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: '#1ed760' }}
          >
            <TrendingUp size={28} style={{ color: '#000000' }} />
          </div>

          <h2 className="text-[28px] md:text-[36px] font-bold text-white mb-4 leading-tight">
            Accelerate Your{' '}
            <span style={{ color: '#1ed760' }}>Progress</span>
          </h2>

          <p className="text-[16px] mb-8 max-w-lg leading-relaxed" style={{ color: '#b3b3b3' }}>
            Hit a plateau? Get personalized feedback, solve critiques, and practice routines from an experienced speedcuber.
          </p>

          {/* Feature mini cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-8">
            <div
              className="p-4 rounded-lg flex items-start gap-4 text-left"
              style={{ backgroundColor: '#1f1f1f' }}
            >
              <div
                className="p-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,164,43,0.1)' }}
              >
                <Trophy size={18} style={{ color: '#ffa42b' }} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Proven Results</h4>
                <p className="text-[13px]" style={{ color: '#b3b3b3' }}>
                  Consistent podium finisher with 10+ years of competition experience.
                </p>
              </div>
            </div>

            <div
              className="p-4 rounded-lg flex items-start gap-4 text-left"
              style={{ backgroundColor: '#1f1f1f' }}
            >
              <div
                className="p-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'rgba(30,215,96,0.1)' }}
              >
                <Timer size={18} style={{ color: '#1ed760' }} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Event Mastery</h4>
                <p className="text-[13px]" style={{ color: '#b3b3b3' }}>
                  Deep knowledge across all WCA events, from 2x2 to 7x7 and side events.
                </p>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="w-full pt-6" style={{ borderTop: '1px solid #282828' }}>
            <h3
              className="text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#b3b3b3' }}
            >
              Get in Touch
            </h3>
            <div className="flex justify-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: '#1f1f1f',
                      color: '#b3b3b3',
                      border: '1px solid #4d4d4d',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#1ed760';
                      e.currentTarget.style.color = '#000000';
                      e.currentTarget.style.borderColor = '#1ed760';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#1f1f1f';
                      e.currentTarget.style.color = '#b3b3b3';
                      e.currentTarget.style.borderColor = '#4d4d4d';
                    }}
                    title={link.name}
                  >
                    <Icon size={22} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
