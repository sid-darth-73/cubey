import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swords, Trophy, Clock, Flag, CheckCircle2, Loader2, RotateCcw, Home } from 'lucide-react';
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
  WAITING_READY: 'waiting_ready',     // in room, waiting for both ready
  COUNTDOWN: 'countdown',             // 3-2-1 visual before timer starts
  SOLVING: 'solving',                 // timer running
  WAITING_OPPONENT: 'waiting_opponent', // submitted, waiting for opponent
  RESULT: 'result',                   // both submitted, show winner
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
  const solveTimeRef = useRef(null); // final recorded time

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
    // Submit immediately with no penalty — user can add +2/DNF before confirming
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
    <div className="min-h-screen bg-background text-text-main font-quick flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-lg mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Swords size={16} className="text-blue-400" />
          <span className="font-mono text-xs opacity-60">BATTLE</span>
        </div>
        <div className="h-px flex-1 bg-border/50" />
        <button
          onClick={() => navigate('/dashboard')}
          className="text-text-muted hover:text-text-main transition-colors"
        >
          <Home size={16} />
        </button>
      </div>

      <div className="w-full max-w-lg space-y-4">

        {/* ── LOADING ───────────────────────────────────────────── */}
        {phase === PHASE.LOADING && (
          <div className="glass-panel rounded-2xl p-10 flex flex-col items-center gap-4">
            <Loader2 size={32} className="text-blue-400 animate-spin" />
            <p className="text-text-muted text-sm">Loading battle room…</p>
          </div>
        )}

        {/* ── SCRAMBLE (always visible once loaded) ─────────────── */}
        {phase !== PHASE.LOADING && phase !== PHASE.RESULT && (
          <div className="glass-panel rounded-2xl p-5 space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">Scramble</p>
            <p className="font-mono text-lg text-text-main leading-snug tracking-wide">
              {scramble}
            </p>
            <p className="text-xs text-text-muted">Puzzle: <span className="text-blue-400 font-semibold">{room?.puzzleType || '3x3'}</span></p>
          </div>
        )}

        {/* ── WAITING READY ─────────────────────────────────────── */}
        {phase === PHASE.WAITING_READY && (
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-center font-bold text-lg font-mont text-text-main">
              Get set…
            </h2>

            <div className="flex justify-center gap-8">
              <StatusPip label="You" ready={selfReady} />
              <div className="flex items-center text-text-muted text-lg font-bold">VS</div>
              <StatusPip label="Opponent" ready={opponentReady} />
            </div>

            {!selfReady ? (
              <button
                onClick={handleReady}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold tracking-wide transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95"
              >
                I'm Ready
              </button>
            ) : (
              <div className="text-center text-sm text-text-muted animate-pulse">
                Waiting for opponent…
              </div>
            )}
          </div>
        )}

        {/* ── COUNTDOWN ─────────────────────────────────────────── */}
        {phase === PHASE.COUNTDOWN && (
          <div className="glass-panel rounded-2xl p-10 flex flex-col items-center gap-4">
            <p className="text-xs text-text-muted uppercase tracking-widest">Starting in</p>
            <span className="text-9xl font-bold font-mont text-gradient animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        {/* ── SOLVING — big timer ────────────────────────────────── */}
        {phase === PHASE.SOLVING && (
          <div
            className="glass-panel rounded-2xl p-8 flex flex-col items-center gap-6 cursor-pointer select-none active:scale-[0.99] transition-transform"
            onClick={handleStopTimer}
          >
            <p className="text-xs text-text-muted uppercase tracking-widest">Tap to stop</p>
            <div className="font-mono text-7xl md:text-8xl font-bold text-gradient tabular-nums">
              {formatTime(timerMs)}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <div className={`w-2 h-2 rounded-full ${opponentSubmitted ? 'bg-green-400' : 'bg-text-muted/30'}`} />
              {opponentSubmitted ? 'Opponent finished!' : 'Opponent solving…'}
            </div>
          </div>
        )}

        {/* ── WAITING OPPONENT — show your time + penalty selection ─ */}
        {phase === PHASE.WAITING_OPPONENT && (
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Your Time</p>
              <div className="font-mono text-5xl font-bold text-gradient tabular-nums">
                {formatTime(solveTimeRef.current)}
              </div>
            </div>

            {/* Penalty picker */}
            <div className="space-y-2">
              <p className="text-xs text-text-muted text-center">Any penalty?</p>
              <div className="flex gap-2">
                {['', '+2', 'DNF'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPenalty(p)}
                    className={`flex-1 h-10 rounded-lg text-sm font-bold border transition-all duration-150 ${
                      penalty === p
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'border-border text-text-muted hover:border-border hover:bg-surface-hover'
                    }`}
                  >
                    {p === '' ? 'OK' : p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubmit(penalty)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Submit Solve
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              Waiting for opponent…
            </div>
          </div>
        )}

        {/* ── RESULT ────────────────────────────────────────────── */}
        {phase === PHASE.RESULT && result && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            {/* Winner banner */}
            <div className={`px-6 py-5 text-center ${result.isDraw ? 'bg-yellow-500/10' : iWon ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="text-4xl mb-1">
                {result.isDraw ? '🤝' : iWon ? '🏆' : '😤'}
              </div>
              <h2 className={`text-2xl font-bold font-mont ${result.isDraw ? 'text-yellow-400' : iWon ? 'text-green-400' : 'text-red-400'}`}>
                {result.isDraw ? "It's a Draw!" : iWon ? 'You Won!' : 'You Lost'}
              </h2>
              {result.forfeitedBy && (
                <p className="text-xs text-text-muted mt-1">Opponent forfeited</p>
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
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 h-11 rounded-xl border border-border text-text-muted font-semibold text-sm hover:bg-surface-hover hover:text-text-main transition-all flex items-center justify-center gap-2"
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
            className="w-full flex items-center justify-center gap-2 text-xs text-red-400/60 hover:text-red-400 transition-colors py-2"
          >
            <Flag size={12} />
            Forfeit battle
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusPip({ label, ready }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        ready ? 'border-green-500 bg-green-500/10' : 'border-border bg-surface'
      }`}>
        {ready ? <CheckCircle2 size={18} className="text-green-400" /> : <Clock size={18} className="text-text-muted" />}
      </div>
      <span className={`text-xs font-semibold ${ready ? 'text-green-400' : 'text-text-muted'}`}>{label}</span>
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
    <div className={`flex-1 rounded-xl p-4 border transition-all ${
      highlight ? 'border-green-500/40 bg-green-500/5' : 'border-border bg-background/30'
    }`}>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`font-mono text-2xl font-bold ${highlight ? 'text-green-400' : 'text-text-main'}`}>
        {time}
      </p>
      {result?.penalty && result.penalty !== '' && (
        <span className="text-xs text-orange-400 font-semibold">{result.penalty}</span>
      )}
    </div>
  );
}
