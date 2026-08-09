import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../utils/api";
import { algId } from "../../utils/algId";
import { Badge } from "../../components/ui/Badge";
import { Trash2, Shuffle, Square } from 'lucide-react';
import SEO from '../../components/SEO';

export default function Learn() {
  const [category, setCategory] = useState("3x3");
  const [subcategory, setSubcategory] = useState("oll");
  const [algoKey, setAlgoKey] = useState("1");
  const [selectedAlgo, setSelectedAlgo] = useState(null);

  const [bestTime, setBestTime] = useState(null);
  const [time, setTime] = useState(0);

  const [timerState, setTimerState] = useState('idle'); // 'idle', 'ready', 'running'

  const timerStateRef = useRef(timerState);
  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  const timeRef = useRef(0);
  const intervalRef = useRef(null);
  const [randomMode, setRandomMode] = useState(false);

  // random alg selection logic
  const setRandomAlgorithm = useCallback(() => {
    const categories = Object.keys(algId);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setCategory(randomCategory);
    if(randomCategory === "3x3") {
      const subcategories = Object.keys(algId["3x3"]);
      const randomSub = subcategories[Math.floor(Math.random() * subcategories.length)];
      setSubcategory(randomSub);
      const algorithms = Object.keys(algId["3x3"][randomSub]);
      const randomKey = algorithms[Math.floor(Math.random() * algorithms.length)];
      setAlgoKey(randomKey);
    } else {
      setSubcategory("");
      const algorithms = Object.keys(algId[randomCategory]);
      const randomKey = algorithms[Math.floor(Math.random() * algorithms.length)];
      setAlgoKey(randomKey);
    }
  }, []);

  useEffect(() => {
    const algoObj = category === "3x3" ? algId?.[category]?.[subcategory]?.[algoKey] : algId?.[category]?.[algoKey];
    if(algoObj) setSelectedAlgo(algoObj);
  }, [category, subcategory, algoKey]);

  const fetchBestTime = useCallback(async () => {
    if(!selectedAlgo) return;
    try {
      const res = await axios.get(`/learn/${selectedAlgo[1]}`);
      setBestTime(Number(res.data.bestTimeInSeconds));
    } catch {
      setBestTime(null);
    }
  }, [selectedAlgo]);

  useEffect(() => { fetchBestTime(); }, [fetchBestTime]);

  const handleTimerFinish = useCallback(
    async (finalTime) => {
      if(!selectedAlgo || finalTime <= 0) return;
      try {
        if(bestTime === null || finalTime < bestTime) {
          await axios.post("/learn/update", {
            algoId: selectedAlgo[1],
            bestTimeInSeconds: Number(finalTime.toFixed(2)),
          });
          setBestTime(Number(finalTime.toFixed(2)));
        }
      } catch (err) {
        console.error("Failed to update best time:", err);
      } finally {
        if(randomMode) setRandomAlgorithm();
      }
    },
    [selectedAlgo, bestTime, randomMode, setRandomAlgorithm]
  );

  const readyTimer = useCallback(() => {
    setTimerState('ready');
    setTime(0);
    timeRef.current = 0;
  }, []);

  const startTimer = useCallback(() => {
    setTimerState('running');
    intervalRef.current = setInterval(() => {
      timeRef.current += 0.01;
      setTime(parseFloat(timeRef.current.toFixed(2)));
    }, 10);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('idle');
    handleTimerFinish(timeRef.current);
  }, [handleTimerFinish]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.code === "Space") {
        e.preventDefault();
        if(timerStateRef.current === 'running') stopTimer();
        else if (timerStateRef.current === 'idle') readyTimer();
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (timerStateRef.current === 'ready') startTimer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [readyTimer, startTimer, stopTimer]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (timerStateRef.current === 'running') stopTimer();
    else if (timerStateRef.current === 'idle') readyTimer();
  }, [readyTimer, stopTimer]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (timerStateRef.current === 'ready') startTimer();
  }, [startTimer]);

  const timerColor = timerState === 'ready' ? '#1ed760' : '#ffffff';

  const helperText = timerState === 'ready'
    ? 'Release to start'
    : timerState === 'running'
    ? <span className="flex items-center gap-2"><Square size={14} fill="currentColor" /> Stop</span>
    : <span className="flex items-center gap-2">
        Hold <kbd
          className="px-2 py-0.5 rounded text-xs font-mono font-bold"
          style={{ backgroundColor: '#252525', border: '1px solid #4d4d4d' }}
        >Space</kbd> to Start
      </span>;

  // Select styling
  const selectStyle = {
    width: '100%',
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
  };

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 6rem)' }}>
      <SEO title="Learn Algorithms" description="Master new algorithms by training and transition from 2-Look to full CFOP and beyond." />

      {/* Control Panel */}
      <div
        className="flex-shrink-0 rounded-lg p-5"
        style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
      >
        {/* Selects row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest" style={{ color: '#b3b3b3' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setCategory(newCategory);
                if(newCategory === "3x3") {
                  const defaultSub = Object.keys(algId["3x3"])[0];
                  const defaultKey = Object.keys(algId["3x3"][defaultSub])[0];
                  setSubcategory(defaultSub);
                  setAlgoKey(defaultKey);
                } else {
                  const defaultKey = Object.keys(algId[newCategory])[0];
                  setSubcategory("");
                  setAlgoKey(defaultKey);
                }
              }}
              style={selectStyle}
            >
              {Object.keys(algId).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {category === "3x3" && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-widest" style={{ color: '#b3b3b3' }}>
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => {
                  const newSub = e.target.value;
                  setSubcategory(newSub);
                  const defaultKey = Object.keys(algId["3x3"][newSub])[0];
                  setAlgoKey(defaultKey);
                }}
                style={selectStyle}
              >
                {Object.keys(algId["3x3"]).map((sub) => (
                  <option key={sub} value={sub}>{sub.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <div className={`space-y-1.5 ${category !== "3x3" ? 'md:col-span-2' : ''}`}>
            <label className="block text-[11px] font-bold uppercase tracking-widest" style={{ color: '#b3b3b3' }}>
              Algorithm
            </label>
            <select
              value={algoKey}
              onChange={(e) => setAlgoKey(e.target.value)}
              style={selectStyle}
            >
              {Object.keys(
                category === "3x3" ? algId[category]?.[subcategory] || {} : algId[category] || {}
              ).map((key) => {
                const [name] =
                  category === "3x3" ? algId[category]?.[subcategory]?.[key] || [] : algId[category]?.[key] || [];
                return <option key={key} value={key}>{name}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Algo info row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Algorithm image */}
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#1f1f1f' }}
            >
              {selectedAlgo?.[1]?.startsWith("oll") && selectedAlgo[1].length <= 5 && (
                <img
                  src={`/oll/svg/${selectedAlgo[1][3]}${selectedAlgo[1].length === 5 ? selectedAlgo[1][4] : ""}.svg`}
                  alt="OLL visual"
                  className="max-w-full max-h-full"
                />
              )}
              {selectedAlgo?.[1]?.startsWith("pll_") && (
                <img src={`/pll-arrows/svg/${selectedAlgo[1]}.svg`} alt="PLL visual" className="max-w-full max-h-full" />
              )}
              {(selectedAlgo?.[1]?.startsWith("pllpar") || selectedAlgo?.[1]?.startsWith("ollpar")) && (
                <img src={`/parity/${selectedAlgo[1]}.png`} alt="4x4 parity" className="max-w-full max-h-full" />
              )}
              {selectedAlgo?.[1]?.startsWith("l2e") && (
                <img src={`/l2e/${selectedAlgo[1]}.png`} alt="5x5 L2E case" className="max-w-full max-h-full" />
              )}
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-white mb-1 font-mono">{selectedAlgo?.[2]}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: '#b3b3b3' }}>Personal Best:</span>
                {bestTime !== null ? (
                  <div className="flex items-center gap-2">
                    <Badge>{bestTime.toFixed(2)}s</Badge>
                    <button
                      className="p-1 rounded-full transition-colors"
                      style={{ color: '#b3b3b3' }}
                      title="Reset Best Time"
                      onMouseEnter={e => e.currentTarget.style.color = '#f3727f'}
                      onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                      onClick={async () => {
                        if(confirm("Are you sure you want to reset your best time?")) {
                          try {
                            await axios.delete(`/learn/reset/${selectedAlgo[1]}`);
                            setBestTime(null);
                          } catch (err) {
                            console.error("Failed to reset best time:", err);
                          }
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <span className="italic text-sm" style={{ color: '#b3b3b3' }}>Not recorded</span>
                )}
              </div>
            </div>
          </div>

          {/* Randomizer button */}
          <button
            onClick={() => {
              setRandomMode(!randomMode);
              if(!randomMode) setRandomAlgorithm();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95 w-full md:w-auto justify-center"
            style={
              randomMode
                ? { backgroundColor: '#1ed760', color: '#000000' }
                : { backgroundColor: 'transparent', color: '#b3b3b3', border: '1px solid #4d4d4d' }
            }
            onMouseEnter={e => {
              if (randomMode) e.currentTarget.style.backgroundColor = '#1db954';
              else { e.currentTarget.style.backgroundColor = '#1f1f1f'; e.currentTarget.style.color = '#ffffff'; }
            }}
            onMouseLeave={e => {
              if (randomMode) e.currentTarget.style.backgroundColor = '#1ed760';
              else { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; }
            }}
          >
            <Shuffle size={16} />
            {randomMode ? "Stop Randomizer" : "Start Randomizer"}
          </button>
        </div>
      </div>

      {/* Timer Area */}
      <div
        className="flex-grow rounded-lg flex flex-col justify-center items-center relative overflow-hidden cursor-pointer select-none transition-colors"
        style={{ backgroundColor: '#181818' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#181818'}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Timer display */}
        <div
          className="text-[80px] md:text-[120px] font-bold font-mono transition-colors duration-100 leading-none"
          style={{ color: timerColor }}
        >
          {time.toFixed(2)}
        </div>

        <div
          className="mt-6 text-[15px] flex items-center gap-2 transition-opacity"
          style={{ color: '#b3b3b3' }}
        >
          {helperText}
        </div>
      </div>
    </div>
  );
}
