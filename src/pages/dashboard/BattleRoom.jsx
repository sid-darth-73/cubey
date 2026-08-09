import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swords, Clock, Flag, CheckCircle2, Loader2, Home } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(ms) {
  if (ms === null || ms === undefined) return '—';
  if (!isFinite(ms)) return 'DNF';
  const totalCs = Math.floor(ms / 10);
  const centiseconds = totalCs % 100;
  const totalSecs = Math.floor(totalCs / 100);
  const seconds = totalSecs % 60;
  const minutes = Math.floor(totalSecs / 60);
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  }
  return `${seconds}.${String(centiseconds).padStart(2, '0')}`;
}

// ── Battle phases ─────────────────────────────────────────────────────────────
const PHASE = {
  LOADING: 'loading',
  WAITING_READY: 'waiting_ready',
  COUNTDOWN: 'countdown',
  SOLVING: 'solving',
  WAITING_OPPONENT: 'waiting_opponent',
  RESULT: 'result',
};

export default function BattleRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [phase, setPhase] = useState(PHASE.LOADING);
  const [room, setRoom] = useState(null);
  const [scramble, setScramble] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [opponentReady, setOpponentReady] = useState(false);
  const [selfReady, setSelfReady] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [penalty, setPenalty] = useState('');

  // Timer state
  const [timerMs, setTimerMs] = useState(0);
  const timerIntervalRef = useRef(null);
  const startTimestampRef = useRef(null);
  const solveTimeRef = useRef(null);

  const myUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      return JSON.parse(atob(token.split('.')[1])).userId;
    } catch {
      return null;
    }
  })();

  // ── Load room on mount & join socket room ─────────────────────────────────
  useEffect(() => {
    const sock = socket?.current;
    if (!sock || !roomId) return;

    sock.emit('battle:join_room', roomId);

    api.get(`/battles/room/${roomId}`)
      .then(({ data }) => {
        setRoom(data);
        setScramble(data.scramble);

        if (data.status === 'in_progress') {
          setPhase(PHASE.SOLVING);
          startTimestampRef.current = new Date(data.startedAt).getTime();
        } else if (data.status === 'completed' || data.status === 'abandoned') {
          setPhase(PHASE.RESULT);
          setResult(buildResult(data));
        } else {
          setPhase(PHASE.WAITING_READY);
          setScramble(data.scramble);
        }
      })
      .catch(() => navigate('/dashboard'));
  }, [roomId]);

  // ── Socket event listeners ────────────────────────────────────────────────
  useEffect(() => {
    const sock = socket?.current;
    if (!sock) return;

    const onOpponentReady = ({ userId }) => {
      if (userId !== myUserId) setOpponentReady(true);
    };

    const onStart = ({ startedAt }) => {
      startTimestampRef.current = new Date(startedAt).getTime();
      setPhase(PHASE.COUNTDOWN);
      let count = 3;
      setCountdown(count);
      const cd = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(cd);
          setPhase(PHASE.SOLVING);
          startTimerInterval();
        }
      }, 1000);
    };

    const onOpponentSubmitted = () => setOpponentSubmitted(true);

    const onResult = (data) => {
      stopTimerInterval();
      setResult(data);
      setPhase(PHASE.RESULT);
    };

    sock.on('battle:opponent_ready', onOpponentReady);
    sock.on('battle:start', onStart);
    sock.on('battle:opponent_submitted', onOpponentSubmitted);
    sock.on('battle:result', onResult);

    return () => {
      sock.off('battle:opponent_ready', onOpponentReady);
      sock.off('battle:start', onStart);
      sock.off('battle:opponent_submitted', onOpponentSubmitted);
      sock.off('battle:result', onResult);
    };
  }, [socket]);

  // ── Timer helpers ─────────────────────────────────────────────────────────
  const startTimerInterval = useCallback(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimerMs(Date.now() - startTimestampRef.current);
    }, 10);
  }, []);

  const stopTimerInterval = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleReady = async () => {
    setSelfReady(true);
    await api.post(`/battles/${roomId}/ready`);
  };

  const handleStopTimer = () => {
    stopTimerInterval();
    const elapsed = Date.now() - startTimestampRef.current;
    solveTimeRef.current = elapsed;
    setTimerMs(elapsed);
    setPhase(PHASE.WAITING_OPPONENT);
  };

  const handleSubmit = async (chosenPenalty = '') => {
    try {
      await api.post(`/battles/${roomId}/submit`, {
        timeMs: solveTimeRef.current,
        penalty: chosenPenalty,
      });
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const handleForfeit = () => {
    socket?.current?.emit('battle:forfeit', { roomId });
    navigate('/dashboard');
  };

  // ── Result helpers ────────────────────────────────────────────────────────
  function buildResult(data) {
    return {
      winnerId: data.winnerId,
      isDraw: data.isDraw,
      forfeitedBy: data.forfeitedBy,
      results: data.results,
    };
  }

  const myResult = result?.results?.find((r) => r.userId === myUserId);
  const oppResult = result?.results?.find((r) => r.userId !== myUserId);
  const iWon = result?.winnerId === myUserId;

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => stopTimerInterval(), []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: '#121212', color: '#ffffff' }}
    >
      {/* Header bar */}
      <div className="w-full max-w-lg mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Swords size={16} style={{ color: '#1ed760' }} />
          <span
            className="font-mono text-[11px] font-bold uppercase tracking-widest"
            style={{ color: '#b3b3b3' }}
          >
            Battle
          </span>
        </div>
        <div className="h-px flex-1" style={{ backgroundColor: '#282828' }} />
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-full transition-colors"
          style={{ color: '#b3b3b3' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = '#1f1f1f'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#b3b3b3'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Home size={16} />
        </button>
      </div>

      <div className="w-full max-w-lg space-y-4">

        {/* ── LOADING ─────────────────────────────────────────────── */}
        {phase === PHASE.LOADING && (
          <div
            className="rounded-lg p-10 flex flex-col items-center gap-4"
            style={{ backgroundColor: '#181818' }}
          >
            <Loader2 size={32} className="animate-spin" style={{ color: '#1ed760' }} />
            <p style={{ color: '#b3b3b3' }}>Loading battle room…</p>
          </div>
        )}

        {/* ── SCRAMBLE (always visible once loaded) ──────────────── */}
        {phase !== PHASE.LOADING && phase !== PHASE.RESULT && (
          <div
            className="rounded-lg p-5 space-y-2"
            style={{ backgroundColor: '#181818' }}
          >
            <p
              className="text-[11px] uppercase tracking-widest font-bold"
              style={{ color: '#b3b3b3' }}
            >
              Scramble
            </p>
            <p className="font-mono text-[17px] text-white leading-snug tracking-wide">
              {scramble}
            </p>
            <p className="text-[12px]" style={{ color: '#b3b3b3' }}>
              Puzzle:{' '}
              <span className="font-bold" style={{ color: '#1ed760' }}>
                {room?.puzzleType || '3x3'}
              </span>
            </p>
          </div>
        )}

        {/* ── WAITING READY ──────────────────────────────────────── */}
        {phase === PHASE.WAITING_READY && (
          <div
            className="rounded-lg p-6 space-y-5"
            style={{ backgroundColor: '#181818' }}
          >
            <h2 className="text-center font-bold text-[18px] text-white">Get set…</h2>

            <div className="flex justify-center gap-10">
              <StatusPip label="You" ready={selfReady} />
              <div className="flex items-center font-bold text-[16px]" style={{ color: '#b3b3b3' }}>VS</div>
              <StatusPip label="Opponent" ready={opponentReady} />
            </div>

            {!selfReady ? (
              <button
                onClick={handleReady}
                className="w-full h-12 rounded-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95"
                style={{ backgroundColor: '#1ed760', color: '#000000' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1db954'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1ed760'}
              >
                I'm Ready
              </button>
            ) : (
              <div className="text-center text-sm animate-pulse" style={{ color: '#b3b3b3' }}>
                Waiting for opponent…
              </div>
            )}
          </div>
        )}

        {/* ── COUNTDOWN ──────────────────────────────────────────── */}
        {phase === PHASE.COUNTDOWN && (
          <div
            className="rounded-lg p-10 flex flex-col items-center gap-4"
            style={{ backgroundColor: '#181818' }}
          >
            <p className="text-[11px] uppercase tracking-widest" style={{ color: '#b3b3b3' }}>
              Starting in
            </p>
            <span
              className="text-[120px] font-bold leading-none animate-pulse"
              style={{ color: '#1ed760' }}
            >
              {countdown}
            </span>
          </div>
        )}

        {/* ── SOLVING — big timer ─────────────────────────────────── */}
        {phase === PHASE.SOLVING && (
          <div
            className="rounded-lg p-8 flex flex-col items-center gap-6 cursor-pointer select-none transition-colors active:scale-[0.99]"
            style={{ backgroundColor: '#181818' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#181818'}
            onClick={handleStopTimer}
          >
            <p className="text-[11px] uppercase tracking-widest" style={{ color: '#b3b3b3' }}>
              Tap to stop
            </p>
            <div className="font-mono text-[80px] md:text-[100px] font-bold tabular-nums text-white leading-none">
              {formatTime(timerMs)}
            </div>
            <div className="flex items-center gap-2 text-[12px]" style={{ color: '#b3b3b3' }}>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: opponentSubmitted ? '#1ed760' : '#4d4d4d' }}
              />
              {opponentSubmitted ? 'Opponent finished!' : 'Opponent solving…'}
            </div>
          </div>
        )}

        {/* ── WAITING OPPONENT — show your time + penalty selection ─ */}
        {phase === PHASE.WAITING_OPPONENT && (
          <div
            className="rounded-lg p-6 space-y-5"
            style={{ backgroundColor: '#181818' }}
          >
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: '#b3b3b3' }}>
                Your Time
              </p>
              <div className="font-mono text-[56px] font-bold tabular-nums text-white leading-none">
                {formatTime(solveTimeRef.current)}
              </div>
            </div>

            {/* Penalty picker */}
            <div className="space-y-2">
              <p className="text-[12px] text-center" style={{ color: '#b3b3b3' }}>Any penalty?</p>
              <div className="flex gap-2">
                {['', '+2', 'DNF'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPenalty(p)}
                    className="flex-1 h-10 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-150"
                    style={
                      penalty === p
                        ? { backgroundColor: '#1ed760', color: '#000000', border: 'none' }
                        : { backgroundColor: 'transparent', color: '#b3b3b3', border: '1px solid #4d4d4d' }
                    }
                  >
                    {p === '' ? 'OK' : p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubmit(penalty)}
              className="w-full h-12 rounded-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95"
              style={{ backgroundColor: '#1ed760', color: '#000000' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1db954'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1ed760'}
            >
              Submit Solve
            </button>

            <div className="flex items-center justify-center gap-2 text-[12px] animate-pulse" style={{ color: '#b3b3b3' }}>
              <Loader2 size={12} className="animate-spin" />
              Waiting for opponent…
            </div>
          </div>
        )}

        {/* ── RESULT ──────────────────────────────────────────────── */}
        {phase === PHASE.RESULT && result && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }}
          >
            {/* Winner banner */}
            <div
              className="px-6 py-6 text-center"
              style={{
                backgroundColor: result.isDraw
                  ? 'rgba(255,164,43,0.08)'
                  : iWon
                  ? 'rgba(30,215,96,0.08)'
                  : 'rgba(243,114,127,0.08)',
              }}
            >
              <div className="text-5xl mb-2">
                {result.isDraw ? '🤝' : iWon ? '🏆' : '😤'}
              </div>
              <h2
                className="text-[24px] font-bold"
                style={{
                  color: result.isDraw ? '#ffa42b' : iWon ? '#1ed760' : '#f3727f',
                }}
              >
                {result.isDraw ? "It's a Draw!" : iWon ? 'You Won!' : 'You Lost'}
              </h2>
              {result.forfeitedBy && (
                <p className="text-xs mt-1" style={{ color: '#b3b3b3' }}>Opponent forfeited</p>
              )}
            </div>

            {/* Times comparison */}
            <div className="p-5 space-y-3">
              <div className="flex gap-3">
                <ResultCard label="You" result={myResult} highlight={iWon} />
                <ResultCard label="Opponent" result={oppResult} highlight={!iWon && !result.isDraw} />
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full h-11 rounded-full text-[13px] font-bold uppercase tracking-[1.4px] transition-all flex items-center justify-center gap-2"
                style={{ border: '1px solid #4d4d4d', color: '#b3b3b3', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1f1f1f'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; }}
              >
                <Home size={15} />
                Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Forfeit — only during active solve phases */}
        {(phase === PHASE.SOLVING || phase === PHASE.WAITING_READY || phase === PHASE.WAITING_OPPONENT) && (
          <button
            onClick={handleForfeit}
            className="w-full flex items-center justify-center gap-2 text-xs py-2 transition-colors"
            style={{ color: 'rgba(243,114,127,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f3727f'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(243,114,127,0.5)'}
          >
            <Flag size={12} />
            Forfeit battle
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function StatusPip({ label, ready }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          border: ready ? '2px solid #1ed760' : '2px solid #4d4d4d',
          backgroundColor: ready ? 'rgba(30,215,96,0.1)' : '#1f1f1f',
        }}
      >
        {ready
          ? <CheckCircle2 size={18} style={{ color: '#1ed760' }} />
          : <Clock size={18} style={{ color: '#b3b3b3' }} />
        }
      </div>
      <span
        className="text-xs font-bold"
        style={{ color: ready ? '#1ed760' : '#b3b3b3' }}
      >
        {label}
      </span>
    </div>
  );
}

function ResultCard({ label, result, highlight }) {
  const time = result
    ? result.penalty === 'DNF'
      ? 'DNF'
      : `${(((result.penalty === '+2' ? result.timeMs + 2000 : result.timeMs)) / 1000).toFixed(2)}s`
    : '—';

  return (
    <div
      className="flex-1 rounded-lg p-4 transition-all"
      style={{
        border: highlight ? '1px solid rgba(30,215,96,0.3)' : '1px solid #282828',
        backgroundColor: highlight ? 'rgba(30,215,96,0.05)' : '#1f1f1f',
      }}
    >
      <p className="text-xs mb-1" style={{ color: '#b3b3b3' }}>{label}</p>
      <p
        className="font-mono text-[24px] font-bold"
        style={{ color: highlight ? '#1ed760' : '#ffffff' }}
      >
        {time}
      </p>
      {result?.penalty && result.penalty !== '' && (
        <span className="text-xs font-semibold" style={{ color: '#ffa42b' }}>{result.penalty}</span>
      )}
    </div>
  );
}
