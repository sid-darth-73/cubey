import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Trophy, Timer, BookOpen, Share2, Upload } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Trophy,
      title: "Track PBs",
      description: "Monitor your best singles and averages with detailed statistics.",
      color: "text-yellow-400"
    },
    {
      icon: Timer,
      title: "Smart Timer",
      description: "Train smarter with our built-in timer and scramble generator.",
      color: "text-red-400"
    },
    {
      icon: BookOpen,
      title: "Learn Algs",
      description: "Master new algorithms and transition from 2-Look to full CFOP and beyond",
      color: "text-blue-400"
    },
    {
      icon: Share2,
      title: "Social Profile",
      description: "Share your achievements with a unique public profile link.",
      color: "text-purple-400"
    },
    {
      icon: Upload,
      title: "Import Data",
      description: "Seamlessly import your solve history from other timers.",
      color: "text-green-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-main overflow-hidden relative transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-2xl font-bold font-mont tracking-wide flex items-center gap-2 text-text-main">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg"></div>
          Cubey
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => navigate("/signin")}>Sign In</Button>
          <Button variant="primary" onClick={() => navigate("/signup")}>Get Started</Button>
        </div>
      </nav>

      <main className="relative z-10 px-6 py-16 md:py-24 max-w-5xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold font-mont mb-6 leading-tight">
          Level Up Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Speedcubing</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed font-light">
          The all-in-one platform to time, track, learn, and share your speedcubing journey. 
          Analyze your solves and break your PBs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-20">
          <Button size="lg" className="w-full sm:w-auto px-8" onClick={() => navigate("/signup")}>
            Start Cubing Now
          </Button>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8" onClick={() => navigate("/signin")}>
            Login
          </Button>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="hover:-translate-y-1 transition-transform duration-300 border-border/50 hover:border-primary/20 bg-surface/50 backdrop-blur-sm">
                <div className={`p-3 rounded-lg bg-surface w-fit mb-4 ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 font-mont text-text-main">{feature.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-text-muted text-sm border-t border-border mt-12 bg-surface/30 backdrop-blur-sm">
        <p>Made with <span className="text-red-500">♥</span> by <a href="https://github.com/sid-darth-73/cubey" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">unbit</a></p>
      </footer>
    </div>
  );
};
