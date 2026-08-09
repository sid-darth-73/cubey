import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { generateScramble, applyScramble } from 'react-rubiks-cube-utils';
import { Cube2D } from '../../utils/Cube2D';
import { RefreshCw, UploadCloud } from 'lucide-react';
import api from '../../utils/api';
import SEO from '../../components/SEO';

// --- Configuration ---
const BATCH_SIZES = [5, 12, 25, 50, 100, 200, 500, 1000];

// --- Helper: Format ms to mm:ss.cc ---
const formatTime = (ms, penalty = '') => {
    if (penalty === 'DNF') return 'DNF';
    if (ms === Infinity || ms === 0) return '-';

    const finalTime = penalty === '+2' ? ms + 2000 : ms;

    const s = Math.floor(finalTime / 1000);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    const remMs = Math.floor((finalTime % 1000) / 10);

    const strS = remS < 10 ? `0${remS}` : remS;
    const strMs = remMs < 10 ? `0${remMs}` : remMs;

    const timeString = m > 0 ? `${m}:${strS}.${strMs}` : `${s}.${strMs}`;
    return penalty === '+2' ? `${timeString}+` : timeString;
};

// --- Helper: Calculate Average (Trimmed Mean) ---
const calculateBatchAverage = (batch, size) => {
    if (batch.length < size) return 0;

    let dnfCount = 0;
    const times = batch.map(s => {
        if (s.penalty === 'DNF') {
            dnfCount++;
            return Infinity;
        }
        return s.penalty === '+2' ? s.time + 2000 : s.time;
    });

    const trimCount = Math.ceil(size * 0.05);

    if (dnfCount > trimCount) return -1;

    times.sort((a, b) => a - b);

    const trimmed = times.slice(trimCount, times.length - trimCount);

    if (trimmed.some(t => t === Infinity)) return -1;

    const sum = trimmed.reduce((a, b) => a + b, 0);
    return sum / trimmed.length;
};

export default function Timer() {
    // --- Settings State ---
    const [cubetype, setCubetype] = useState("3x3");
    const [session, setSession] = useState("1");
    const [scramble, setScramble] = useState("");
    const [prevscramble, setPrevscramble] = useState("");

    // --- Timer Logic State ---
    const [timerState, setTimerState] = useState('idle');
    const [timeDisplay, setTimeDisplay] = useState(0);
    const [checkState, setCheckState] = useState(false);

    // --- Typing Mode State ---
    const [isTypingMode, setIsTypingMode] = useState(false);
    const [manualInput, setManualInput] = useState("");

    // --- Layout State ---
    const [mobileView, setMobileView] = useState('timer');

    // --- Data State ---
    const [localBuffer, setLocalBuffer] = useState([]);
    const [dbSolves, setDbSolves] = useState([]);
    const solves = useMemo(() => [...dbSolves, ...localBuffer], [dbSolves, localBuffer]);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // --- Modal State ---
    const [selectedSolveId, setSelectedSolveId] = useState(null);

    // --- Stats Display State ---
    const [showMeanMedian, setShowMeanMedian] = useState(true);

    // Refs
    const timerStateRef = useRef('idle');
    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);
    const solvesRef = useRef(solves);
    const inputRef = useRef(null);

    useEffect(() => { solvesRef.current = solves; }, [solves]);
    useEffect(() => { timerStateRef.current = timerState; }, [timerState]);

    // --- Load/Sync Data ---
    useEffect(() => {
        const savedType = localStorage.getItem("cubetype");
        const savedSession = localStorage.getItem("session");
        if (savedType) setCubetype(savedType);
        if (savedSession) setSession(savedSession);
        setIsLoaded(true);
    }, []);

    const fetchDbSolves = useCallback(async () => {
        try {
            let url = `/solves?sessionNumber=${session}&type=${cubetype}`;
            const { data } = await api.get(url);

            const mapped = data.map(d => ({
                id: d._id,
                time: Math.round(d.timeInSeconds * 1000),
                type: d.type,
                penalty: d.penalty || '',
                scramble: d.scramble,
                comment: d.comment || '',
                timestamp: new Date(d.createdAt).getTime(),
                session: d.sessionNumber?.toString() || session,
                isDb: true
            }));
            setDbSolves(mapped);
        } catch (error) {
            console.error('Failed to fetch solves', error);
        }
    }, [session, cubetype]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("cubetype", cubetype);
        localStorage.setItem("session", session);
        setScramble(generateScramble({ type: cubetype }));

        const sessionKey = `buffer_${session}_${cubetype}`;
        const storedData = localStorage.getItem(sessionKey);
        if (storedData) {
            try { setLocalBuffer(JSON.parse(storedData)); } catch (e) { setLocalBuffer([]); }
        } else { setLocalBuffer([]); }

        fetchDbSolves();
    }, [cubetype, session, isLoaded, fetchDbSolves]);

    useEffect(() => {
        if (!isLoaded) return;
        const sessionKey = `buffer_${session}_${cubetype}`;
        localStorage.setItem(sessionKey, JSON.stringify(localBuffer));
    }, [localBuffer, session, cubetype, isLoaded]);

    // --- Export Logic ---
    const exportSolves = useCallback(async (solvesToExport) => {
        if (solvesToExport.length === 0) return;
        setIsSyncing(true);
        try {
            const payload = solvesToExport.map(s => ({
                scramble: s.scramble,
                timeInSeconds: s.time / 1000,
                type: s.type,
                penalty: s.penalty,
                comment: s.comment,
                sessionNumber: Number(s.session)
            }));

            await api.post('/solves/batch', { solves: payload });
            setLocalBuffer([]);
            await fetchDbSolves();
        } catch (error) {
            console.error('Failed to export solves', error);
            alert('Failed to sync to server');
        } finally {
            setIsSyncing(false);
        }
    }, [fetchDbSolves]);

    // Auto-export on 25 solves
    useEffect(() => {
        if (localBuffer.length >= 25 && !isSyncing) {
            exportSolves(localBuffer);
        }
    }, [localBuffer, isSyncing, exportSolves]);

    useEffect(() => {
        if (isTypingMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isTypingMode, localBuffer, dbSolves]);

    // --- Stats Calculation Engine ---
    const stats = useMemo(() => {
        const validSolves = solves.map(s => {
            if (s.penalty === 'DNF') return Infinity;
            if (s.penalty === '+2') return s.time + 2000;
            return s.time;
        });
        const nonDnfSolves = validSolves.filter(t => t !== Infinity);
        const best = nonDnfSolves.length > 0 ? Math.min(...nonDnfSolves) : 0;
        const sum = nonDnfSolves.reduce((a, b) => a + b, 0);
        const mean = nonDnfSolves.length > 0 ? sum / nonDnfSolves.length : 0;
        const variance = nonDnfSolves.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nonDnfSolves.length;
        const stdDev = Math.sqrt(variance || 0);

        let median = 0;
        if (nonDnfSolves.length > 0) {
            const sorted = [...nonDnfSolves].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
        }

        const calculatedAverages = {};
        BATCH_SIZES.forEach(size => {
            const currentAvg = calculateBatchAverage(solves.slice(-size), size);

            let bestAvg = Infinity;
            if (solves.length >= size) {
                for (let i = 0; i <= solves.length - size; i++) {
                    const window = solves.slice(i, i + size);
                    const avg = calculateBatchAverage(window, size);
                    if (avg !== -1 && avg < bestAvg) bestAvg = avg;
                }
            }

            calculatedAverages[size] = {
                current: currentAvg === -1 ? 'DNF' : currentAvg,
                best: bestAvg === Infinity ? 0 : bestAvg
            };
        });

        return { best, mean, median, stdDev, averages: calculatedAverages };
    }, [solves]);

    // --- Actions ---
    const handleFinish = useCallback((finalTime) => {
        const newSolve = {
            id: Date.now().toString(),
            time: finalTime,
            type: cubetype,
            penalty: '',
            scramble: scramble,
            comment: '',
            timestamp: Date.now(),
            session: session
        };
        setLocalBuffer(prev => [...prev, newSolve]);
        setPrevscramble(() => scramble);
        setScramble(generateScramble({ type: cubetype }));
    }, [cubetype, scramble, session]);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        const finalTime = Date.now() - startTimeRef.current;
        setTimeDisplay(finalTime);
        setTimerState('idle');
        handleFinish(finalTime);
    }, [handleFinish]);

    const startTimer = useCallback(() => {
        setTimerState('running');
        setMobileView('timer');
        startTimeRef.current = Date.now();
        intervalRef.current = setInterval(() => {
            setTimeDisplay(Date.now() - startTimeRef.current);
        }, 10);
    }, []);

    const readyTimer = useCallback(() => {
        setTimerState('ready');
        setTimeDisplay(0);
        setMobileView('timer');
    }, []);

    const handleManualSubmit = (e) => {
        if (e.key === 'Enter') {
            const rawVal = manualInput.replace(/[^0-9]/g, '');
            if (!rawVal) return;
            const ms = parseInt(rawVal, 10) * 10;
            handleFinish(ms);
            setManualInput("");
        }
    };

    // --- Inputs Handling ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if(selectedSolveId || isTypingMode) return;

            if (e.code === "Space") {
                if(timerStateRef.current !== 'running') e.preventDefault();
                if (timerStateRef.current === 'running') stopTimer();
                else if (timerStateRef.current === 'idle') readyTimer();
            }

            const alpha = ['w','x','c','v','b','n','m','a','s','d','f','g','h','j','k','l'];
            if (alpha.includes(e.key.toLowerCase())) {
                if (timerStateRef.current === 'running') stopTimer();
            }

            if (e.altKey && (e.code === "KeyZ" || e.key === 'z')) {
                e.preventDefault();
                if (timerStateRef.current === 'idle' && localBuffer.length > 0) {
                    if (confirm(`Delete last solve?`)) {
                        setLocalBuffer(prev => prev.slice(0, -1));
                    }
                }
            }
        };

        const handleKeyUp = (e) => {
            if(selectedSolveId || isTypingMode) return;
            if (e.code === "Space") {
                if (timerStateRef.current === 'ready') startTimer();
                else if (timerStateRef.current === 'idle') setTimerState('idle');
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [readyTimer, startTimer, stopTimer, selectedSolveId, solves, isTypingMode]);

    const handlePointerDown = useCallback((e) => {
        if (selectedSolveId || isTypingMode) return;
        if (mobileView !== 'timer') return;
        if (e.pointerType !== 'touch') return;

        if (timerStateRef.current !== 'running') e.preventDefault();
        if (timerStateRef.current === 'running') stopTimer();
        else if (timerStateRef.current === 'idle') readyTimer();
    }, [selectedSolveId, readyTimer, stopTimer, mobileView, isTypingMode]);

    const handlePointerUp = useCallback((e) => {
        if (selectedSolveId || isTypingMode) return;
        if (mobileView !== 'timer') return;
        if (e.pointerType !== 'touch') return;

        if (timerStateRef.current === 'ready') startTimer();
        else if (timerStateRef.current === 'idle') setTimerState('idle');
    }, [selectedSolveId, startTimer, mobileView, isTypingMode]);

    // --- Sub-functions ---
    const updateSolveLocally = (id, updates) => {
        setLocalBuffer(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        setDbSolves(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleUpdatePenalty = async (id, newPenalty, isDb) => {
        updateSolveLocally(id, { penalty: newPenalty });
        if (isDb) {
            try {
                await api.patch(`/solves/${id}`, { penalty: newPenalty });
            } catch(e) { console.error('Failed to update DB penalty', e); }
        }
    };

    const deleteSolveUI = async (id, isDb) => {
        if(confirm("Delete this solve?")) {
            if (isDb) {
               try {
                   await api.delete(`/solves/${id}`);
                   setDbSolves(prev => prev.filter(s => s.id !== id));
               } catch(e) { console.error('Failed to delete DB solve', e); }
            } else {
               setLocalBuffer(prev => prev.filter(s => s.id !== id));
            }
            setSelectedSolveId(null);
        }
    };

    const selectedSolve = solves.find(s => s.id === selectedSolveId);
    let cube = null;
    try {
        cube = applyScramble({ type: cubetype, scramble: scramble });
    } catch (e) {}

    const dimUI = timerState === 'ready' || timerState === 'running' ? 'opacity-30 pointer-events-none' : '';

    // Shared select style
    const selectStyle = {
        backgroundColor: '#1f1f1f',
        color: '#ffffff',
        border: '1px solid #4d4d4d',
        borderRadius: '9999px',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: 700,
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <div
            className="flex-1 flex flex-col min-h-full relative overflow-hidden"
            style={{ backgroundColor: '#121212', color: '#ffffff' }}
        >
            <SEO title="Timer" description="Time your Rubik's Cube solves with millisecond precision, track Ao5 and Ao12, and analyze your stats." />

            {/* --- DETAILS MODAL --- */}
            {selectedSolveId && selectedSolve && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
                >
                    <div
                        className="w-full max-w-md rounded-lg p-6 flex flex-col gap-4"
                        style={{ backgroundColor: '#1f1f1f', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }}
                    >
                        <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #282828', paddingBottom: '12px' }}>
                            <h2 className="text-[36px] font-mono font-bold text-white">
                                {formatTime(selectedSolve.time, selectedSolve.penalty)}
                            </h2>
                            <button
                                onClick={() => setSelectedSolveId(null)}
                                className="p-2 rounded-full transition-colors text-[18px] leading-none"
                                style={{ color: '#b3b3b3' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = '#252525'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#b3b3b3'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                ✕
                            </button>
                        </div>
                        <div
                            className="font-mono text-sm p-3 rounded-lg break-words"
                            style={{ backgroundColor: '#121212', color: '#b3b3b3', border: '1px solid #282828' }}
                        >
                            {selectedSolve.scramble}
                        </div>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => handleUpdatePenalty(selectedSolve.id, selectedSolve.penalty === '+2' ? '' : '+2', selectedSolve.isDb)}
                                className="flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors"
                                style={
                                    selectedSolve.penalty === '+2'
                                        ? { backgroundColor: '#ffa42b', color: '#000000', border: 'none' }
                                        : { backgroundColor: 'transparent', color: '#b3b3b3', border: '1px solid #4d4d4d' }
                                }
                            >
                                +2
                            </button>
                            <button
                                onClick={() => handleUpdatePenalty(selectedSolve.id, selectedSolve.penalty === 'DNF' ? '' : 'DNF', selectedSolve.isDb)}
                                className="flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors"
                                style={
                                    selectedSolve.penalty === 'DNF'
                                        ? { backgroundColor: '#f3727f', color: '#ffffff', border: 'none' }
                                        : { backgroundColor: 'transparent', color: '#b3b3b3', border: '1px solid #4d4d4d' }
                                }
                            >
                                DNF
                            </button>
                            <button
                                onClick={() => deleteSolveUI(selectedSolve.id, selectedSolve.isDb)}
                                className="flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors"
                                style={{ backgroundColor: 'transparent', color: '#f3727f', border: '1px solid rgba(243,114,127,0.4)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(243,114,127,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Del
                            </button>
                        </div>
                        <textarea
                            className="w-full rounded-lg p-3 text-sm font-mono h-20 outline-none transition-colors resize-none"
                            style={{
                                backgroundColor: '#121212',
                                color: '#ffffff',
                                border: '1px solid #282828',
                                boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
                            }}
                            value={selectedSolve.comment || ""}
                            onChange={(e) => updateSolveLocally(selectedSolve.id, { comment: e.target.value })}
                            onBlur={(e) => {
                                if (selectedSolve.isDb) {
                                    api.patch(`/solves/${selectedSolve.id}`, { comment: e.target.value }).catch(err => console.error("failed to patch comment", err));
                                }
                            }}
                            placeholder="Comment..."
                        />
                    </div>
                </div>
            )}

            {/* --- HEADER: Timer feature toolbar --- */}
            <div
                className={`shrink-0 py-3 px-4 flex items-center justify-between transition-opacity duration-200 ${dimUI}`}
                style={{ borderBottom: '1px solid #282828', backgroundColor: '#181818' }}
            >
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-[12px] uppercase tracking-widest font-bold" style={{ color: '#b3b3b3' }}>
                        Event
                    </span>
                    <select style={selectStyle} value={cubetype} onChange={(e) => setCubetype(e.target.value)}>
                        {['3x3','2x2','4x4','5x5','6x6','7x7'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="hidden sm:inline text-[12px] uppercase tracking-widest font-bold" style={{ color: '#b3b3b3' }}>
                        Session
                    </span>
                    <select style={selectStyle} value={session} onChange={(e) => setSession(e.target.value)}>
                        {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Session {i + 1}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    {/* Export button */}
                    <button
                        onClick={() => exportSolves(localBuffer)}
                        disabled={localBuffer.length === 0 || isSyncing}
                        className="flex px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest transition-colors items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={
                            localBuffer.length > 0
                                ? { backgroundColor: 'rgba(30,215,96,0.1)', color: '#1ed760', border: '1px solid rgba(30,215,96,0.3)' }
                                : { backgroundColor: 'transparent', color: '#b3b3b3', border: '1px solid #4d4d4d' }
                        }
                    >
                        {isSyncing ? <RefreshCw className="animate-spin" size={14}/> : <UploadCloud size={14}/>}
                        <span className="hidden sm:inline">Export</span> ({localBuffer.length})
                    </button>

                    {/* Mode toggle */}
                    <button
                        onClick={() => setIsTypingMode(!isTypingMode)}
                        className="flex px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest transition-colors items-center gap-2"
                        style={
                            isTypingMode
                                ? { backgroundColor: '#1ed760', color: '#000000', border: 'none' }
                                : { backgroundColor: 'transparent', color: '#b3b3b3', border: '1px solid #4d4d4d' }
                        }
                        onMouseEnter={e => {
                            if (!isTypingMode) { e.currentTarget.style.backgroundColor = '#1f1f1f'; e.currentTarget.style.color = '#ffffff'; }
                            else e.currentTarget.style.backgroundColor = '#1db954';
                        }}
                        onMouseLeave={e => {
                            if (!isTypingMode) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; }
                            else e.currentTarget.style.backgroundColor = '#1ed760';
                        }}
                    >
                        {isTypingMode ? <><span>⌨️</span><span className="hidden sm:inline">Manual input</span></> : <><span>⏱</span><span className="hidden sm:inline">Timer</span></>}
                    </button>
                </div>
            </div>

            {/* --- SCRAMBLE --- */}
            <div
                className={`shrink-0 py-4 px-4 flex flex-col items-center justify-center transition-opacity duration-200 ${dimUI}`}
                style={{ borderBottom: '1px solid #282828', backgroundColor: '#181818' }}
            >
                <p className="text-[11px] uppercase tracking-widest mb-2 font-bold" style={{ color: '#b3b3b3' }}>Scramble</p>
                <div className="flex flex-col items-center w-full">
                    <div className="font-mono mx-2 text-lg sm:text-xl md:text-2xl lg:text-3xl min-h-14 text-center w-full text-white">
                        {isLoaded ? scramble : "Loading..."}
                    </div>
                    <div className="flex gap-6 mt-3 opacity-50 hover:opacity-100 transition-opacity">
                        <button
                            className="text-[11px] uppercase tracking-widest font-bold transition-colors"
                            style={{ color: '#b3b3b3' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                            onClick={() => {
                                if (prevscramble.length > 0) {
                                    setScramble(() => prevscramble);
                                    setPrevscramble(() => "");
                                }
                            }}
                        >
                            Prev
                        </button>
                        <button
                            className="text-[11px] uppercase tracking-widest font-bold transition-colors"
                            style={{ color: '#b3b3b3' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                            onClick={() => {
                                setPrevscramble(() => scramble);
                                setScramble(generateScramble({ type: cubetype }));
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MAIN AREA --- */}
            <div
                className="flex-1 flex flex-col md:flex-row min-h-0"
                style={{ borderTop: '1px solid #282828' }}
            >
                {/* SOLVES LIST */}
                <div
                    className={`
                        md:basis-1/6 flex flex-col
                        ${mobileView === 'solves' ? 'flex h-full absolute inset-0 z-20 md:static' : 'hidden md:flex'}
                        ${dimUI}
                    `}
                    style={{ backgroundColor: '#181818', borderRight: '1px solid #282828' }}
                >
                    <div className="py-4 px-3 text-center" style={{ borderBottom: '1px solid #282828' }}>
                        <h2 className="text-[11px] uppercase tracking-widest font-bold" style={{ color: '#b3b3b3' }}>Solves</h2>
                        <p className="text-[22px] font-mono font-bold text-white mt-0.5">{solves.length}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="flex flex-col-reverse gap-0.5">
                            {solves.map((s, i) => (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedSolveId(s.id)}
                                    className="flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-colors"
                                    style={
                                        s.penalty === 'DNF'
                                            ? { color: '#f3727f', borderLeft: '2px solid #f3727f', backgroundColor: 'rgba(243,114,127,0.05)' }
                                            : { color: '#ffffff', backgroundColor: 'transparent' }
                                    }
                                    onMouseEnter={e => { if (s.penalty !== 'DNF') e.currentTarget.style.backgroundColor = '#1f1f1f'; }}
                                    onMouseLeave={e => { if (s.penalty !== 'DNF') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <span className="text-sm font-medium" style={{ color: '#b3b3b3' }}>{i + 1}.</span>
                                    <span className="font-mono font-bold text-sm">{formatTime(s.time, s.penalty)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TIMER / INPUT */}
                <div
                    className={`
                        md:basis-4/6 flex flex-col justify-center items-center relative overflow-hidden select-none
                        ${mobileView === 'timer' ? 'flex h-full' : 'hidden md:flex'}
                    `}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{ touchAction: 'none', backgroundColor: '#121212' }}
                >
                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-8 md:py-12 px-6">
                        {isTypingMode ? (
                            <>
                                <p className="text-[11px] text-uppercase tracking-widest mb-4 font-bold uppercase" style={{ color: '#b3b3b3' }}>
                                    Manual time (centiseconds)
                                </p>
                                <input
                                    ref={inputRef}
                                    type="number"
                                    pattern="[0-9]*"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    onKeyDown={handleManualSubmit}
                                    placeholder="0"
                                    className="text-center text-[72px] md:text-[100px] font-mono font-bold text-white outline-none w-full py-4 rounded-lg transition-colors"
                                    style={{
                                        backgroundColor: '#1f1f1f',
                                        boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
                                    }}
                                />
                                <p className="text-[12px] mt-3" style={{ color: '#b3b3b3' }}>Enter time and press Enter</p>
                            </>
                        ) : (
                            <>
                                <p className="text-[11px] uppercase tracking-widest mb-2 font-bold" style={{ color: '#b3b3b3' }}>
                                    {timerState === 'idle' && 'Hold space or tap to start'}
                                    {timerState === 'ready' && 'Release to start'}
                                    {timerState === 'running' && 'Press space or tap to stop'}
                                </p>
                                <div
                                    className="font-mono font-bold tabular-nums transition-colors duration-100 leading-none"
                                    style={{
                                        fontSize: 'clamp(72px, 20vw, 160px)',
                                        color: timerState === 'ready' ? '#1ed760' : '#ffffff',
                                    }}
                                >
                                    {formatTime(timeDisplay)}
                                </div>
                                <div className="font-mono text-base md:text-lg flex gap-8 mt-6" style={{ color: '#b3b3b3' }}>
                                    <span><span style={{ color: '#b3b3b3', opacity: 0.7 }}>Ao5</span> {formatTime(stats.averages[5].current)}</span>
                                    <span><span style={{ color: '#b3b3b3', opacity: 0.7 }}>Ao12</span> {formatTime(stats.averages[12].current)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* STATS */}
                <div
                    className={`
                        md:basis-1/6 overflow-y-auto p-4 text-sm font-mono
                        ${mobileView === 'stats' ? 'block h-full absolute inset-0 z-20 md:static' : 'hidden md:block'}
                        ${dimUI}
                    `}
                    style={{ backgroundColor: '#181818', borderLeft: '1px solid #282828' }}
                >
                    <div className="text-center mb-4 pb-3" style={{ borderBottom: '1px solid #282828' }}>
                        <h2 className="text-[11px] uppercase tracking-widest font-bold" style={{ color: '#b3b3b3' }}>Session Stats</h2>
                    </div>

                    {/* General Stats */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4">
                        <span style={{ color: '#b3b3b3' }}>Solves</span>
                        <span className="font-bold text-right text-white">{solves.length}</span>
                        {showMeanMedian && (
                            <>
                                <span style={{ color: '#b3b3b3' }}>Mean</span>
                                <span className="font-bold text-right text-white">{formatTime(stats.mean)}</span>
                                <span style={{ color: '#b3b3b3' }}>Median</span>
                                <span className="font-bold text-right text-white">{formatTime(stats.median)}</span>
                            </>
                        )}
                        <span style={{ color: '#b3b3b3' }}>Best</span>
                        <span className="font-bold text-right text-white">{formatTime(stats.best)}</span>
                        <span style={{ color: '#b3b3b3' }}>Std Dev</span>
                        <span className="font-bold text-right text-white">{formatTime(stats.stdDev)}</span>
                    </div>

                    <div className="flex justify-center mb-4">
                        <button
                            onClick={() => setShowMeanMedian(!showMeanMedian)}
                            className="text-[11px] uppercase tracking-widest font-bold transition-colors"
                            style={{ color: '#b3b3b3' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                        >
                            {showMeanMedian ? 'Hide' : 'Show'} Mean/Median
                        </button>
                    </div>

                    <div className="my-4" style={{ borderTop: '1px solid #282828' }} />

                    {/* Averages Grid */}
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-y-2 gap-x-2 items-center text-xs">
                        <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#b3b3b3' }}>Type</div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-right" style={{ color: '#b3b3b3' }}>Cur</div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-right" style={{ color: '#ffa42b' }}>Best</div>

                        {BATCH_SIZES.map(size => {
                            const data = stats.averages[size];
                            if (!data) return null;
                            return (
                                <Fragment key={size}>
                                    <div className="font-bold" style={{ color: '#b3b3b3' }}>Ao{size}</div>
                                    <div className="text-right font-mono text-white">{formatTime(data.current)}</div>
                                    <div className="text-right font-mono" style={{ color: '#ffa42b' }}>{formatTime(data.best)}</div>
                                </Fragment>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center flex flex-col gap-2">
                        <button
                            onClick={async () => {
                                if(confirm("Clear this entire session including DB records?")) {
                                    try {
                                        setIsSyncing(true);
                                        await api.post('/solves/reset', { sessionNumber: Number(session) });
                                        setLocalBuffer([]);
                                        setDbSolves([]);
                                    } catch(e) { console.error('Failed to reset', e); alert('Failed to reset session'); }
                                    finally { setIsSyncing(false); }
                                }
                            }}
                            className="w-full px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-bold transition-colors"
                            style={{ backgroundColor: 'rgba(243,114,127,0.1)', color: '#f3727f', border: '1px solid rgba(243,114,127,0.3)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(243,114,127,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(243,114,127,0.1)'}
                        >
                            Reset Full Session
                        </button>

                        <button
                            onClick={() => { if(confirm("Clear un-exported local solves?")) setLocalBuffer([]); }}
                            className="w-full px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-bold transition-colors"
                            style={{ backgroundColor: 'transparent', color: '#b3b3b3', border: '1px solid #4d4d4d' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1f1f1f'; e.currentTarget.style.color = '#ffffff'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; }}
                        >
                            Clear Local Buffer
                        </button>
                    </div>

                    <div className="my-6 rounded-lg p-2" style={{ backgroundColor: '#1f1f1f', border: '1px solid #282828' }}>
                        <button
                            className="text-center w-full text-[11px] cursor-pointer md:block hidden uppercase tracking-widest font-bold transition-colors"
                            style={{ color: '#b3b3b3' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                            onClick={() => { setCheckState((prev) => !prev); }}
                        >
                            {checkState ? "Hide Cube" : "Show Cube"}
                        </button>
                        <div className={`mt-2 flex justify-center ${!checkState ? 'md:hidden block' : ''}`}>
                            {cube && <Cube2D cube={cube} size={15} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE NAV */}
            <div
                className={`md:hidden flex shrink-0 ${timerState === 'running' ? 'hidden' : ''}`}
                style={{ backgroundColor: '#181818', borderTop: '1px solid #282828' }}
            >
                <NavButton active={mobileView === 'solves'} onClick={() => setMobileView('solves')} label="Solves" count={solves.length} />
                <NavButton active={mobileView === 'timer'} onClick={() => setMobileView('timer')} label={isTypingMode ? "Input" : "Timer"} icon={true} />
                <NavButton active={mobileView === 'stats'} onClick={() => setMobileView('stats')} label="Stats" />
            </div>
        </div>
    );
}

function NavButton({ active, onClick, label, icon, count }) {
    return (
        <button
            onClick={onClick}
            className="flex-1 py-4 flex flex-col items-center justify-center relative transition-colors"
            style={{
                backgroundColor: active ? '#1f1f1f' : 'transparent',
                color: active ? '#ffffff' : '#b3b3b3',
            }}
        >
            {icon ? (
                <div className="mb-1 text-2xl">{label === 'Input' ? '⌨️' : '⏱'}</div>
            ) : (
                <span className="text-sm font-bold mb-0.5">{label}</span>
            )}
            {count !== undefined && (
                <span
                    className="text-[10px] px-1.5 rounded-full absolute top-2 right-8 md:right-auto"
                    style={{ backgroundColor: '#121212', color: '#b3b3b3' }}
                >
                    {count}
                </span>
            )}
            <div
                className="h-1 w-1 rounded-full mt-0.5"
                style={{ backgroundColor: active ? '#1ed760' : 'transparent' }}
            />
        </button>
    );
}
