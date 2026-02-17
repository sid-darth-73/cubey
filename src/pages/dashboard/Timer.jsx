import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { generateScramble, applyScramble } from 'react-rubiks-cube-utils';
import { Cube2D } from '../../utils/Cube2D';
import { Settings2, Keyboard, Timer as TimerIcon, Trash2, X } from 'lucide-react';

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
    const [solves, setSolves] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

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

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("cubetype", cubetype);
        localStorage.setItem("session", session);
        setScramble(generateScramble({ type: cubetype }));

        const sessionKey = `session_v2_${session}`; 
        const storedData = localStorage.getItem(sessionKey);
        if (storedData) {
            try { setSolves(JSON.parse(storedData)); } catch (e) { setSolves([]); }
        } else { setSolves([]); }
    }, [cubetype, session, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        const sessionKey = `session_v2_${session}`;
        localStorage.setItem(sessionKey, JSON.stringify(solves));
    }, [solves, session, isLoaded]);

    useEffect(() => {
        if (isTypingMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isTypingMode, solves]);

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
                    if (avg !== -1 && avg < bestAvg) {
                        bestAvg = avg;
                    }
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
        setSolves(prev => [...prev, newSolve]);
        setPrevscramble(()=>scramble);
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
                if (timerStateRef.current === 'idle' && solves.length > 0) {
                    if (confirm(`Delete last solve?`)) {
                        setSolves(prev => prev.slice(0, -1));
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
    const updateSolve = (id, updates) => {
        setSolves(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteSolve = (id) => {
        if(confirm("Delete this solve?")) {
            setSolves(prev => prev.filter(s => s.id !== id));
            setSelectedSolveId(null);
        }
    };

    const selectedSolve = solves.find(s => s.id === selectedSolveId);
    let cube = null;
    try {
        cube = applyScramble({ type: cubetype, scramble: scramble });
    } catch (e) {
        // console.error("Scramble invalid");
    }
    const dimUI = timerState === 'ready' || timerState === 'running' ? 'opacity-30 pointer-events-none' : '';

    return (
        <div className="bg-background h-screen md:h-full flex flex-col text-text-main font-sans relative overflow-hidden">
            
            {/* --- DETAILS MODAL --- */}
            {selectedSolveId && selectedSolve && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-border p-6 rounded-lg w-full max-w-md shadow-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                             <h2 className="text-4xl font-mono font-bold">
                                {formatTime(selectedSolve.time, selectedSolve.penalty)}
                            </h2>
                            <button onClick={() => setSelectedSolveId(null)} className="p-2 hover:bg-surface-hover rounded text-text-main">✕</button>
                        </div>
                        <div className="text-text-muted font-mono text-sm bg-background p-2 rounded wrap-break-word border border-border">
                            {selectedSolve.scramble}
                        </div>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => updateSolve(selectedSolve.id, { penalty: selectedSolve.penalty === '+2' ? '' : '+2' })}
                                className={`flex-1 py-3 rounded border text-lg font-bold transition-colors ${selectedSolve.penalty === '+2' ? 'bg-yellow-600 border-yellow-400 text-white' : 'border-border hover:bg-surface-hover text-text-muted'}`}
                            >+2</button>
                            <button 
                                onClick={() => updateSolve(selectedSolve.id, { penalty: selectedSolve.penalty === 'DNF' ? '' : 'DNF' })}
                                className={`flex-1 py-3 rounded border text-lg font-bold transition-colors ${selectedSolve.penalty === 'DNF' ? 'bg-red-600 border-red-400 text-white' : 'border-border hover:bg-surface-hover text-text-muted'}`}
                            >DNF</button>
                            <button 
                                onClick={() => deleteSolve(selectedSolve.id)}
                                className="flex-1 py-3 rounded border border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >Del</button>
                        </div>
                        <textarea 
                            className="w-full bg-surface border border-border rounded p-2 text-sm font-mono h-20 focus:border-primary outline-none transition-colors text-text-main"
                            value={selectedSolve.comment}
                            onChange={(e) => updateSolve(selectedSolve.id, { comment: e.target.value })}
                            placeholder="Comment..."
                        />
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className={`shrink-0 border-b border-border py-1 flex items-center justify-between bg-surface transition-opacity duration-200 ${dimUI}`}>
                <div className="flex-1 px-2">
                    <select 
                        className="bg-surface border border-border px-3 py-1.5 rounded text-text-main outline-none text-sm font-bold" 
                        value={cubetype} 
                        onChange={(e) => setCubetype(e.target.value)}
                    >
                        {['3x3','2x2','4x4','5x5','6x6','7x7'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex-1 px-2 flex justify-end gap-2">
                    <button 
                        onClick={() => setIsTypingMode(!isTypingMode)}
                        className={`px-3 py-1.5 rounded border text-sm font-bold transition-colors ${isTypingMode ? 'bg-green-600 border-green-400 text-white' : 'bg-surface border-border text-text-main hover:bg-surface-hover'}`}
                    >
                        {isTypingMode ? "⌨️ Input" : "⏱ Timer"}
                    </button>
                    <select 
                        className="bg-surface border border-border px-3 py-1.5 rounded text-text-main outline-none text-sm font-bold" 
                        value={session} 
                        onChange={(e) => setSession(e.target.value)}
                    >
                        {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Session {i + 1}</option>)}
                    </select>
                </div>
            </div>

            {/* --- SCRAMBLE --- */}
            <div className={`shrink-0 py-2 text-center px-4 leading-relaxed flex flex-col items-center justify-center transition-opacity duration-200 ${dimUI}`}>
                <div className='flex flex-col items-center w-full'> 
                    <div className='font-mono mx-2 text-xl md:text-3xl min-h-12 text-center w-full'>
                        {isLoaded ? scramble : "Loading..."} 
                    </div>
                    <div className="flex gap-4 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                        <button className='text-xs uppercase tracking-widest hover:text-primary hover:underline' onClick={()=>{
                            if (prevscramble.length > 0){
                                setScramble(() => prevscramble)
                                setPrevscramble(() => "")
                            }
                        }}>Prev</button>
                        <button className='text-xs uppercase tracking-widest hover:text-primary hover:underline' onClick={()=>{
                            setPrevscramble(() => scramble)
                            setScramble(generateScramble({ type: cubetype }))
                        }}>Next</button>
                    </div>
                </div>
            </div>

            {/* --- MAIN AREA --- */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 border-t border-border relative">
                
                {/* LIST */}
                <div className={`
                    bg-surface/50 md:bg-surface md:basis-1/6 md:border-r border-border flex flex-col
                    ${mobileView === 'solves' ? 'flex h-full absolute inset-0 z-20 md:static' : 'hidden md:flex'}
                    ${dimUI}
                `}>
                    <div className="p-3 text-center font-bold bg-surface sticky top-0 z-10 shadow-md border-b border-border">
                        Solves ({solves.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                         <div className="flex flex-col-reverse gap-1">
                            {solves.map((s, i) => (
                                <div 
                                    key={s.id} 
                                    onClick={() => setSelectedSolveId(s.id)}
                                    className={`flex justify-between px-4 py-3 md:py-1.5 rounded cursor-pointer transition-colors ${s.penalty === 'DNF' ? 'text-red-400 border-l-2 border-red-500 bg-red-500/10' : 'hover:bg-surface-hover text-text-main bg-background/40'}`}
                                >
                                    <span className="text-text-muted w-8 text-sm">{i + 1}.</span>
                                    <span className="font-mono font-bold text-lg md:text-sm">{formatTime(s.time, s.penalty)}</span>
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
                    style={{ touchAction: 'none' }}
                >
                    {isTypingMode ? (
                        <div className="flex flex-col items-center w-full max-w-2xl px-8">
                            <input
                                ref={inputRef}
                                type="number"
                                pattern="[0-9]*"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                onKeyDown={handleManualSubmit}
                                className="bg-transparent text-center text-7xl md:text-9xl font-mono text-text-main outline-none w-full"
                            />
                        </div>
                    ) : (
                        <>
                            <div className={`
                                font-mono font-bold tabular-nums transition-colors duration-100
                                text-[22vw] md:text-[120px] 
                                ${timerState === 'ready' ? 'text-green-500' : 'text-text-main'}
                                ${timerState === 'running' ? '' : 'drop-shadow-lg'}
                            `}>
                                {formatTime(timeDisplay)}
                            </div>
                            <div className="text-text-muted font-mono text-lg flex gap-6 mt-4">
                                <span>Ao5: {formatTime(stats.averages[5].current)}</span>
                                <span>Ao12: {formatTime(stats.averages[12].current)}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* STATS */}
                <div className={`
                    bg-surface/50 md:bg-surface md:basis-1/6 md:border-l border-border 
                    overflow-y-auto p-4 text-sm font-mono
                    ${mobileView === 'stats' ? 'block h-full absolute inset-0 z-20 md:static' : 'hidden md:block'}
                    ${dimUI}
                `}>
                    <h3 className="text-center font-bold mb-4 border-b border-border pb-2">Session Stats</h3>
                    
                    {/* General Stats */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4">
                        <span className="text-text-muted">Solves</span>
                        <span className="font-bold text-right">{solves.length}</span>
                        {showMeanMedian && (
                            <>
                                <span className="text-text-muted">Mean</span>
                                <span className="font-bold text-right">{formatTime(stats.mean)}</span>
                                <span className="text-text-muted">Median</span>
                                <span className="font-bold text-right">{formatTime(stats.median)}</span>
                            </>
                        )}
                        <span className="text-text-muted">Best</span>
                        <span className="font-bold text-right">{formatTime(stats.best)}</span>
                        <span className="text-text-muted">Std Dev</span>
                        <span className="font-bold text-right">{formatTime(stats.stdDev)}</span>
                    </div>

                    <div className="flex justify-center mb-4">
                        <button 
                            onClick={() => setShowMeanMedian(!showMeanMedian)}
                            className="text-xs uppercase tracking-widest text-text-muted hover:text-primary hover:underline transition-colors"
                        >
                            {showMeanMedian ? 'Hide' : 'Show'} Mean/Median
                        </button>
                    </div>

                    <div className="border-t border-border my-4"></div>

                    {/* Averages Grid */}
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-y-2 gap-x-2 items-center text-xs md:text-xs">
                        <div className="text-text-muted uppercase tracking-wider font-bold">Type</div>
                        <div className="text-text-muted uppercase tracking-wider font-bold text-right">Cur</div>
                        <div className="text-yellow-600 uppercase tracking-wider font-bold text-right">Best</div>

                        {BATCH_SIZES.map(size => {
                            const data = stats.averages[size];
                            if (!data) return null;

                            return (
                                <Fragment key={size}>
                                    <div className="font-bold text-text-main/80">Ao{size}</div>
                                    <div className="text-right font-mono">{formatTime(data.current)}</div>
                                    <div className="text-right font-mono text-yellow-500">{formatTime(data.best)}</div>
                                </Fragment>
                            )
                        })}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => { if(confirm("Clear this session?")) setSolves([]); }}
                            className="w-full bg-red-500/20 hover:bg-red-600 border border-red-500/50 text-red-200 px-4 py-2 rounded text-xs uppercase tracking-widest transition"
                        >Reset Session</button>
                    </div>

                    <div className='my-8 bg-surface border border-border rounded p-2'>
                        <button 
                            className='text-text-muted hover:text-text-main text-center w-full text-xs cursor-pointer md:block hidden' 
                            onClick={()=>{ setCheckState((prev)=> !prev) }}
                        >{checkState ? "Hide Cube" : "Show Cube"}</button>
                        <div className={`mt-2 flex justify-center ${!checkState ? 'md:hidden block' : ''}`}>
                            {cube && <Cube2D cube={cube} size={15} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE NAV */}
            <div className={`md:hidden flex shrink-0 bg-surface border-t border-border pb-safe ${timerState === 'running' ? 'hidden' : ''}`}>
                <NavButton active={mobileView === 'solves'} onClick={() => setMobileView('solves')} label="Solves" count={solves.length} />
                <NavButton active={mobileView === 'timer'} onClick={() => setMobileView('timer')} label={isTypingMode ? "Input" : "Timer"} icon={true} />
                <NavButton active={mobileView === 'stats'} onClick={() => setMobileView('stats')} label="Stats" />
            </div>
        </div>
    )
}

function NavButton({ active, onClick, label, icon, count }) {
    return (
        <button 
            onClick={onClick}
            className={`flex-1 py-4 flex flex-col items-center justify-center relative transition-colors ${active ? 'bg-surface-hover text-text-main' : 'text-text-muted hover:bg-surface-hover'}`}
        >
            {icon ? (
                <div className="mb-1 text-2xl">{label === 'Input' ? '⌨️' : '⏱'}</div>
            ) : (
                <span className="text-lg font-bold mb-0.5">{label}</span>
            )}
            {count !== undefined && <span className="text-[10px] bg-background px-1.5 rounded-full absolute top-2 right-8 md:right-auto">{count}</span>}
            <div className={`h-1 w-1 rounded-full ${active ? 'bg-primary' : 'bg-transparent'}`} />
        </button>
    )
}
