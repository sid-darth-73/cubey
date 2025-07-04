export function Improve() {
  return (
    <div className="p-4 text-white min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-lg max-w-xl w-full flex flex-col gap-6 items-center">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-2">Get Help from a Speedcubing Pro!</h2>
        <p className="text-lg text-slate-200 text-center max-w-lg">
          Want to break your PB or push your averages lower? Connect with a cuber who averages <span className="font-semibold text-blue-300">8 seconds</span> on 3x3! Get personalized tips, feedback on your solves, and guidance on advanced techniques.
        </p>
        <div className="bg-slate-700 rounded-lg p-4 w-full text-center mt-2">
          <span className="text-slate-300">Contact:</span>
          <div className="text-blue-300 font-mono text-lg mt-2">[contact]</div>
        </div>
        <p className="text-slate-400 text-sm mt-4 text-center">(email, discord, etc)</p>
      </div>
    </div>
  );
} 