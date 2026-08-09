import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, X, Clock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

export function ChallengePopup() {
  const { incomingChallenge, dismissChallenge, pendingBattleRoom, clearPendingBattleRoom } = useSocket();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [responding, setResponding] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!incomingChallenge) return;

    const msLeft = new Date(incomingChallenge.expiresAt) - Date.now();
    setSecondsLeft(Math.max(0, Math.round(msLeft / 1000)));

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          dismissChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingChallenge]);

  // Navigate BOTH players when battle:room_created fires (handled in SocketContext)
  useEffect(() => {
    if (!pendingBattleRoom) return;
    clearPendingBattleRoom();
    navigate(`/battle/${pendingBattleRoom}`);
  }, [pendingBattleRoom]);

  if (!incomingChallenge) return null;

  const handleAccept = async () => {
    setResponding(true);
    try {
      await api.post(`/battles/${incomingChallenge.challengeId}/respond`, { accept: true });
      // navigation happens via 'battle:room_created' socket event above
    } catch (err) {
      console.error('Accept failed:', err);
      dismissChallenge();
    } finally {
      setResponding(false);
    }
  };

  const handleReject = async () => {
    setResponding(true);
    try {
      await api.post(`/battles/${incomingChallenge.challengeId}/respond`, { accept: false });
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      dismissChallenge();
      setResponding(false);
    }
  };

  const urgency = secondsLeft !== null && secondsLeft < 15;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleReject}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-border/50">

          {/* Glowing header strip */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="p-6 space-y-5">
            {/* Icon + title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                <Swords size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">Incoming Challenge</p>
                <h2 className="text-lg font-bold font-mont text-text-main leading-tight">Battle Request</h2>
              </div>

              {/* Dismiss */}
              <button
                onClick={handleReject}
                className="ml-auto text-text-muted hover:text-text-main transition-colors p-1 rounded-lg hover:bg-surface-hover"
              >
                <X size={18} />
              </button>
            </div>

            {/* Challenger info */}
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {incomingChallenge.challenger.email?.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-main truncate">
                  {incomingChallenge.challenger.email}
                </p>
                <p className="text-xs text-text-muted">wants to battle you</p>
              </div>
            </div>

            {/* Puzzle type badge */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Puzzle</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                  {incomingChallenge.puzzleType}
                </span>
              </div>

              {/* Countdown */}
              <div className={`flex items-center gap-1.5 text-sm font-mono font-bold transition-colors ${urgency ? 'text-red-400 animate-pulse' : 'text-text-muted'}`}>
                <Clock size={14} />
                <span>{secondsLeft}s</span>
              </div>
            </div>

            {/* Timer bar */}
            <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${urgency ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${(secondsLeft / 60) * 100}%` }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleReject}
                disabled={responding}
                className="flex-1 h-11 rounded-xl border border-border text-text-muted font-semibold text-sm hover:bg-surface-hover hover:text-text-main transition-all duration-200 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={responding}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {responding ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Swords size={16} />
                    Accept
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
