import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Trophy, Timer, User } from 'lucide-react';

export function PublicProfile() {
  const { shareLink } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/pb/${shareLink}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Profile not found"));
  }, [shareLink]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white px-4">
        <Card className="w-full max-w-md border-red-500/20 bg-surface/50">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
              <User size={24} />
            </div>
            <h1 className="text-xl font-bold text-red-400">{error}</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white px-4">
        <Card className="w-full max-w-md border-white/10 bg-surface/50 animate-pulse">
          <CardContent className="p-8 text-center">
             <h1 className="text-xl font-mont text-slate-300">Loading profile...</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 animate-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-3xl font-bold font-mont text-white">{data.username.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-mont tracking-tight">
            {data.username}<span className="text-blue-400">'s</span> PBs
          </h1>
          <p className="text-slate-400">Personal Best Times & Averages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Singles */}
          <Card className="border-blue-500/20 bg-surface/40 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Trophy size={20} />
                <span>Single Best</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.pbSolves.length === 0 ? (
                   <p className="text-slate-500 italic text-sm py-4 text-center">No PB solves recorded yet.</p>
                ) : (
                  data.pbSolves.map((solve, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-blue-500/30 transition-colors group">
                      <span className="font-bold text-slate-200">{solve.type}</span>
                      <Badge variant="secondary" className="font-mono text-lg bg-blue-500/10 text-blue-300 border-blue-500/20 group-hover:bg-blue-500/20">
                        {solve.timeInSeconds.toFixed(2)}s
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Averages */}
          <Card className="border-emerald-500/20 bg-surface/40 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <Timer size={20} />
                <span>Best Averages</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.averages.length === 0 ? (
                  <p className="text-slate-500 italic text-sm py-4 text-center">No PB averages recorded yet.</p>
                ) : (
                  data.averages.map((avg, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                      <span className="font-bold text-slate-200">{avg.type}</span>
                       <Badge variant="secondary" className="font-mono text-lg bg-emerald-500/10 text-emerald-300 border-emerald-500/20 group-hover:bg-emerald-500/20">
                        {avg.timeInSeconds.toFixed(2)}s
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
