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
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
        onClick={handleReject}
      />

      {/* Dialog Card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-lg overflow-hidden"
        style={{ backgroundColor: '#1f1f1f', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }}
      >
        {/* Top accent strip — accent green */}
        <div style={{ height: '3px', backgroundColor: '#1ed760', width: '100%' }} />

        <div className="p-6 space-y-5">
          {/* Icon + title row */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#1ed760' }}
            >
              <Swords size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex-1">
              <p
                className="text-[11px] uppercase tracking-widest font-semibold"
                style={{ color: '#b3b3b3' }}
              >
                Incoming Challenge
              </p>
              <h2 className="text-[16px] font-bold text-white leading-tight">Battle Request</h2>
            </div>
            {/* Dismiss */}
            <button
              onClick={handleReject}
              className="p-1.5 rounded-full transition-colors flex-shrink-0"
              style={{ color: '#b3b3b3' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Challenger info */}
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: '#121212' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: '#252525', color: '#b3b3b3' }}
            >
              {incomingChallenge.challenger.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {incomingChallenge.challenger.email}
              </p>
              <p className="text-xs" style={{ color: '#b3b3b3' }}>wants to battle you</p>
            </div>
          </div>

          {/* Puzzle type + countdown */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#b3b3b3' }}>Puzzle</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#1ed760', color: '#000000' }}
              >
                {incomingChallenge.puzzleType}
              </span>
            </div>

            {/* Countdown */}
            <div
              className={`flex items-center gap-1.5 text-sm font-mono font-bold transition-colors ${urgency ? 'animate-pulse' : ''}`}
              style={{ color: urgency ? '#f3727f' : '#b3b3b3' }}
            >
              <Clock size={14} />
              <span>{secondsLeft}s</span>
            </div>
          </div>

          {/* Timer progress bar */}
          <div
            className="h-0.5 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: '#252525' }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(secondsLeft / 60) * 100}%`,
                backgroundColor: urgency ? '#f3727f' : '#1ed760',
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleReject}
              disabled={responding}
              className="flex-1 h-11 rounded-full text-[13px] font-bold uppercase tracking-[1.4px] transition-all duration-200 disabled:opacity-50"
              style={{
                border: '1px solid #4d4d4d',
                color: '#b3b3b3',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#1f1f1f';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#b3b3b3';
              }}
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={responding}
              className="flex-1 h-11 rounded-full text-[13px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1ed760', color: '#000000' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1db954'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1ed760'}
            >
              {responding ? (
                <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <>
                  <Swords size={15} />
                  Accept
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
