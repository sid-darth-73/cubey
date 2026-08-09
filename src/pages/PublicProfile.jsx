import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { Badge } from "../components/ui/Badge";
import { Trophy, Timer, User, Swords } from 'lucide-react';

export function PublicProfile() {
  const { shareLink } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [challengeStatus, setChallengeStatus] = useState('idle'); // idle | sending | sent | error

  const myToken = localStorage.getItem('token');
  const isLoggedIn = !!myToken;

  const handleChallenge = async () => {
    if (!data?.userId) return;
    setChallengeStatus('sending');
    try {
      await api.post('/battles/challenge', {
        challengeeId: data.userId,
        puzzleType: '3x3',
      });
      setChallengeStatus('sent');
      setTimeout(() => setChallengeStatus('idle'), 3000);
    } catch (err) {
      setChallengeStatus('error');
      setTimeout(() => setChallengeStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    api.get(`/pb/${shareLink}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Profile not found"));
  }, [shareLink]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen px-4"
        style={{ backgroundColor: '#121212', color: '#ffffff' }}
      >
        <div
          className="w-full max-w-md rounded-lg p-8 text-center"
          style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(243,114,127,0.1)' }}
          >
            <User size={24} style={{ color: '#f3727f' }} />
          </div>
          <h1 className="text-lg font-bold" style={{ color: '#f3727f' }}>{error}</h1>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="flex items-center justify-center min-h-screen px-4"
        style={{ backgroundColor: '#121212', color: '#ffffff' }}
      >
        <div
          className="w-full max-w-md rounded-lg p-8 text-center animate-pulse"
          style={{ backgroundColor: '#181818' }}
        >
          <h1 className="text-lg font-bold" style={{ color: '#b3b3b3' }}>Loading profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: '#121212', color: '#ffffff' }}
    >
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ backgroundColor: '#1ed760' }}
          >
            <span className="text-3xl font-bold text-black">
              {data.username.charAt(0).toUpperCase()}
            </span>
          </div>

          <h1 className="text-[32px] md:text-[48px] font-bold tracking-tight text-white">
            {data.username}<span style={{ color: '#1ed760' }}>'s</span> PBs
          </h1>
          <p style={{ color: '#b3b3b3' }}>Personal Best Times &amp; Averages</p>

          {/* Challenge button — only show if viewer is logged in */}
          {isLoggedIn && (
            <div className="pt-2">
              <button
                onClick={handleChallenge}
                disabled={challengeStatus === 'sending' || challengeStatus === 'sent'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-[13px] uppercase tracking-[1.4px] transition-all duration-200 active:scale-95 disabled:opacity-70"
                style={
                  challengeStatus === 'sent'
                    ? { backgroundColor: 'rgba(30,215,96,0.1)', color: '#1ed760', border: '1px solid rgba(30,215,96,0.3)' }
                    : challengeStatus === 'error'
                    ? { backgroundColor: 'rgba(243,114,127,0.1)', color: '#f3727f', border: '1px solid rgba(243,114,127,0.3)' }
                    : { backgroundColor: '#1ed760', color: '#000000' }
                }
                onMouseEnter={e => {
                  if (challengeStatus === 'idle') e.currentTarget.style.backgroundColor = '#1db954';
                }}
                onMouseLeave={e => {
                  if (challengeStatus === 'idle') e.currentTarget.style.backgroundColor = '#1ed760';
                }}
              >
                <Swords size={14} />
                {challengeStatus === 'sending' ? 'Sending…' :
                 challengeStatus === 'sent' ? 'Challenge Sent!' :
                 challengeStatus === 'error' ? 'Already Pending' :
                 `Challenge ${data.username}`}
              </button>
            </div>
          )}
        </div>

        {/* PB Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Singles */}
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} style={{ color: '#1ed760' }} />
              <h2 className="text-[16px] font-bold text-white">Single Best</h2>
            </div>
            <div className="space-y-2">
              {data.pbSolves.length === 0 ? (
                <p className="italic text-sm py-4 text-center" style={{ color: '#b3b3b3' }}>
                  No PB solves recorded yet.
                </p>
              ) : (
                data.pbSolves.map((solve, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: '#1f1f1f' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
                  >
                    <span className="font-bold text-white">{solve.type}</span>
                    <span className="font-mono text-[15px] font-bold" style={{ color: '#1ed760' }}>
                      {solve.timeInSeconds.toFixed(2)}s
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Averages */}
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Timer size={18} style={{ color: '#1ed760' }} />
              <h2 className="text-[16px] font-bold text-white">Best Averages</h2>
            </div>
            <div className="space-y-2">
              {data.averages.length === 0 ? (
                <p className="italic text-sm py-4 text-center" style={{ color: '#b3b3b3' }}>
                  No PB averages recorded yet.
                </p>
              ) : (
                data.averages.map((avg, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: '#1f1f1f' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
                  >
                    <span className="font-bold text-white">{avg.type}</span>
                    <span className="font-mono text-[15px] font-bold" style={{ color: '#1ed760' }}>
                      {avg.timeInSeconds.toFixed(2)}s
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
