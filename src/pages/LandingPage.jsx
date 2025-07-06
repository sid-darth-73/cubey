import { HeartIcon } from '../components/ui/HeartIcon';
import { GetStartedButton } from '../components/ui/GetStartedButton';
import { useNavigate } from 'react-router-dom';
import { TimerIcon } from '../components/ui/TimerIcon';
import { TrophyIcon } from '../components/ui/TrophyIcon';
import { LearnIcon } from '../components/ui/LearnIcon';
import { ImportIcon } from '../components/ui/ImportIcon';
import { ShareIcon } from '../components/ui/ShareIcon';

export const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white px-4">
      <div className="bg-slate-800 p-6 md:p-8 w-full max-w-xl rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="text-3xl font-quick md:text-4xl animate-pulse font-bold text-center mb-2">
            Welcome to <span className="text-blue-400">Cubey</span>
          </h1>

          <p className="text-lg font-mont text-slate-200 text-center max-w-lg">
            <b>Cubey</b> is your all-in-one platform for speedcubing improvement.
          </p>

          {/* features */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <TrophyIcon />
              <p className="text-base text-slate-100 font-medium font-quick">
                <span className="text-blue-400 font-quick">Track your PBs</span> — monitor your best singles and averages with ease.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <ImportIcon />
              <p className="text-base text-slate-100 font-medium font-quick">
                <span className="text-green-400 ">Import solves</span> — bring in your times from local files.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <LearnIcon />
              <p className="text-base text-slate-100 font-medium font-quick">
                <span className="text-yellow-400">Learn algorithms</span> — break the habit of 2-Look and go full CFOP.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <TimerIcon />
              <p className="text-base text-slate-100 font-medium font-quick">
                <span className="text-red-400">Train smarter</span> — use the built-in timer and grind those Algorithms.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <ShareIcon />
              <p className="text-base text-slate-100 font-medium font-quick">
                <span className="text-orange-400">Share Away</span> — use your unique sharelink to flaunt your PBs across events.
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full justify-center">
            <GetStartedButton onClick={() => navigate("/signup")} text="Get Started" />
          </div>

          <footer className="mt-4 text-slate-400 text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <span>Made with</span>
              <HeartIcon />
              <span>
                by{' '}
                <a href="https://github.com/sid-darth-73/cubey" target="_blank" rel="noopener noreferrer"className="underline hover:text-blue-300">
                  unbit
                </a>
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
