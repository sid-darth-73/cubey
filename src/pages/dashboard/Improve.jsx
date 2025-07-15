import { TrophyIcon } from "../../components/ui/TrophyIcon";
import { TimerIcon } from "../../components/ui/TimerIcon";
import { ChartIcon } from "../../components/ui/ChartIcon";

export function Improve() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white px-4">
      <div className="bg-slate-800 p-6 md:p-8 w-full max-w-xl rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm">
        <div className="flex flex-col gap-6 items-center">
          <h2 className="text-3xl font-quick md:text-4xl font-bold text-center text-blue-400 mb-2">
            Get a little Nudge towards your improvement!
          </h2>

          <p className="text-lg font-mont text-slate-200 text-center max-w-lg">
            Want to break your PBs or improve your averages? Connect with me for personalized feedback, tips, and detailed solve critiques
          </p>

          <div className="w-full flex flex-col gap-4">
            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <span className="text-blue-400 text-xl font-bold"><ChartIcon></ChartIcon></span>
              <p className="text-base text-slate-100 font-medium font-quick">
                I have been in speedcubing for over <span className="text-blue-300">10 years</span> — deep experience across all events
              </p>
            </div>

            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <span className="text-yellow-400 text-xl font-bold"><TrophyIcon></TrophyIcon></span>
              <p className="text-base text-slate-100 font-medium font-quick">
                Podiumed at <span className="text-yellow-300">every competition</span> I've attended
              </p>
            </div>
            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg">
              <span className="text-green-400 text-xl font-bold">
                <TimerIcon />
              </span>
              <div className="text-base text-slate-100 font-medium font-quick space-y-1">
                <div>
                  <a href="https://cubey-nine.vercel.app/VzTIe9SbsVx-" target="_blank" className="underline text-green-400">My Cubey profile</a>
                </div>
              </div>
            </div>
          </div>
          

          {/* contact  */ }
          <div className="bg-slate-700 rounded-lg p-4 w-full text-center mt-2">
            <span className="text-slate-300 text-sm uppercase tracking-wide font-bold">Get in Touch</span>
            <div className="text-blue-300 font-mono text-lg mt-2 flex justify-center gap-2">
              <a href="https://discord.com/users/771914664836726795" target="_blank" rel="noopener noreferrer">
                <img src={`/discord_icon.svg`} alt="mail" className="w-5 h-5 hover:scale-110 transition cursor-pointer" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <img src={`/insta_icon.svg`} alt="mail" className="w-5 h-5 hover:scale-110 transition cursor-pointer" />
              </a>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=siddharthraj532@gmail.com" target="_blank" rel="noopener noreferrer">
                <img src={`/gmail_icon.svg`} alt="mail" className="w-4.5 h-4 hover:scale-110 transition cursor-pointer" />
              </a>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
}
