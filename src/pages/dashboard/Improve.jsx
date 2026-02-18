import { Card, CardContent } from "../../components/ui/Card";
import { Trophy, Timer, TrendingUp, Mail, Instagram, MessageCircle } from 'lucide-react';

export function Improve() {
  const socialLinks = [
    {
      name: "Discord",
      icon: MessageCircle,
      url: "https://discord.com/users/771914664836726795",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      borderColor: "border-pink-500/20"
    },
    {
      name: "Email",
      icon: Mail,
      url: "https://mail.google.com/mail/?view=cm&fs=1&to=siddharthraj532@gmail.com",
      color: "text-red-400",
      bg: "bg-red-500/10",
      borderColor: "border-red-500/20"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in duration-500 px-4">
      <Card className="w-full max-w-2xl bg-surface/50 border-border">
        <CardContent className="flex flex-col items-center text-center p-8 md:p-12">
          
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
            <TrendingUp size={32} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold font-mont text-text-main mb-4">
            Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Progress</span>
          </h2>

          <p className="text-lg text-text-muted mb-8 max-w-lg leading-relaxed">
            Hit a plateau? Get personalized feedback, solve critiques, and practice routines from an experienced speedcuber.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-surface p-4 rounded-xl border border-border flex items-start gap-4 text-left">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Trophy size={20} />
              </div>
              <div>
                <h4 className="font-bold text-text-main mb-1">Proven Results</h4>
                <p className="text-sm text-text-muted">Consistent podium finisher with 10+ years of competition experience.</p>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-border flex items-start gap-4 text-left">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <Timer size={20} />
              </div>
              <div>
                <h4 className="font-bold text-text-main mb-1">Event Mastery</h4>
                <p className="text-sm text-text-muted">Deep knowledge across all WCA events, from 2x2 to 7x7 and side events.</p>
              </div>
            </div>
          </div>

          <div className="w-full pt-8 border-t border-border">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Get in Touch</h3>
            <div className="flex justify-center gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a 
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      p-3 rounded-xl border transition-all duration-200
                      hover:scale-105 hover:shadow-lg
                      ${link.bg} ${link.color} ${link.borderColor}
                    `}
                    title={link.name}
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
