import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export function PublicProfile() {
  const { shareLink } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3002/pb/${shareLink}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Profile not found"));
  }, [shareLink]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white">
        <div className="bg-slate-800 p-6 md:p-8 w-full max-w-xl rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm text-center">
          <h1 className="text-2xl font-mont text-red-400 mb-2">{error}</h1>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white">
        <div className="bg-slate-800 p-6 md:p-8 w-full max-w-xl rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm text-center">
          <h1 className="text-2xl font-mont text-slate-300">Cooking up your PBs...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white px-4">
      <div className="bg-slate-800 p-6 md:p-8 w-full max-w-xl rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm">
        <div className="flex flex-col gap-6 items-center">

          <h1 className="text-3xl md:text-4xl font-mont font-bold text-center mb-2">
            {data.username}'s <span className="text-blue-400">PBs</span>
          </h1>

          <div className="w-full flex flex-col gap-4">
            {/* Singles */}
            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-4 rounded-lg">
              <div className="text-blue-400 font-semibold font-mont min-w-[90px]">Singles</div>
              <ul className="space-y-2 w-full">
                {data.pbSolves.length === 0 ? (
                  <li className="text-slate-400 font-quick">No PB solves yet.</li>
                ) : (
                  data.pbSolves.map((solve, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-md text-sm font-quick border border-slate-700 hover:bg-slate-800 transition"
                    >
                      <span className="text-slate-100">{solve.type}</span>
                      <span className="text-amber-300 font-semibold">{solve.timeInSeconds.toFixed(2)}s</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Averages */}
            <div className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-4 rounded-lg">
              <div className="text-green-400 font-semibold font-mont min-w-[90px]">Averages</div>
              <ul className="space-y-2 w-full">
                {data.averages.length === 0 ? (
                  <li className="text-slate-400 font-quick">No PB averages yet.</li>
                ) : (
                  data.averages.map((avg, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-md text-sm font-quick border border-slate-700 hover:bg-slate-800 transition"
                    >
                      <span className="text-slate-100">{avg.type}</span>
                      <span className="text-emerald-300 font-semibold">{avg.timeInSeconds.toFixed(2)}s</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
