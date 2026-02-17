import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../utils/api";
import { algId } from "../../utils/algId";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Trash2, Shuffle, Play, Square, Timer } from 'lucide-react';

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
    if(algoObj) {
      setSelectedAlgo(algoObj);
    }
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

  useEffect(() => {
    fetchBestTime();
  }, [fetchBestTime]);

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
        if(randomMode) {
          setRandomAlgorithm();
        }
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
        if(timerStateRef.current === 'running') {
          stopTimer();
        } else if (timerStateRef.current === 'idle') {
          readyTimer();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (timerStateRef.current === 'ready') {
          startTimer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [readyTimer, startTimer, stopTimer]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (timerStateRef.current === 'running') {
      stopTimer();
    } else if (timerStateRef.current === 'idle') {
      readyTimer();
    }
  }, [readyTimer, stopTimer]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (timerStateRef.current === 'ready') {
      startTimer();
    }
  }, [startTimer]);
  
  const getTimerColor = () => {
    switch (timerState) {
      case 'ready':
        return 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]';
      case 'running':
        return 'text-white';
      default:
        return 'text-white';
    }
  };
  
  const getHelperText = () => {
    switch (timerState) {
      case 'ready':
        return 'Release to start';
      case 'running':
        return <span className="flex items-center gap-2"><Square size={16} fill="white" /> Stop</span>;
      default:
        return <span className="flex items-center gap-2">Hold <span className="bg-surface px-2 py-0.5 rounded border border-border">Space</span> to Start</span>;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 animate-in fade-in duration-500">
      
      {/* Control Panel */}
      <Card className="flex-shrink-0">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-quick text-sm mb-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Category</label>
              <div className="relative">
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
                    }else {
                      const defaultKey = Object.keys(algId[newCategory])[0];
                      setSubcategory("");
                      setAlgoKey(defaultKey);
                    }
                  }}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-main focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                >
                  {Object.keys(algId).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {category === "3x3" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Subcategory</label>
                <div className="relative">
                  <select
                    value={subcategory}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setSubcategory(newSub);
                      const defaultKey = Object.keys(algId["3x3"][newSub])[0];
                      setAlgoKey(defaultKey);
                    }}
                   className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-main focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                  >
                    {Object.keys(algId["3x3"]).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className={`space-y-1.5 ${category !== "3x3" ? 'md:col-span-2' : ''}`}>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Algorithm</label>
              <div className="relative">
                <select
                  value={algoKey}
                  onChange={(e) => setAlgoKey(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-main focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                >
                  {Object.keys(
                    category === "3x3" ? algId[category]?.[subcategory] || {} : algId[category] || {}
                  ).map((key) => {
                    const [name] =
                      category === "3x3" ? algId[category]?.[subcategory]?.[key] || [] : algId[category]?.[key] || [];
                    return (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-white/5 rounded-lg border border-white/10 p-2 flex items-center justify-center">
                {selectedAlgo?.[1]?.startsWith("oll") && selectedAlgo[1].length <= 5 && (
                  <img
                    src={`/oll/svg/${selectedAlgo[1][3]}${selectedAlgo[1].length === 5 ? selectedAlgo[1][4] : ""}.svg`}
                    alt="OLL visual"
                    className="max-w-full max-h-full"
                  />
                )}
                {selectedAlgo?.[1]?.startsWith("pll_") && (
                  <img
                    src={`/pll-arrows/svg/${selectedAlgo[1]}.svg`}
                    alt="PLL visual"
                    className="max-w-full max-h-full"
                  />
                )}
                {(selectedAlgo?.[1]?.startsWith("pllpar") || selectedAlgo?.[1]?.startsWith("ollpar")) && (
                  <img
                    src={`/parity/${selectedAlgo[1]}.png`}
                    alt="4x4 parity"
                    className="max-w-full max-h-full"
                  />
                )}
                {selectedAlgo?.[1]?.startsWith("l2e") && (
                  <img
                    src={`/l2e/${selectedAlgo[1]}.png`}
                    alt="5x5 L2E case"
                    className="max-w-full max-h-full"
                  />
                )}
              </div>

              <div className="font-quick">
                <h3 className="text-2xl font-bold text-text-main mb-2 tracking-wide font-mono">{selectedAlgo?.[2]}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-text-muted">Personal Best:</span>
                  {bestTime !== null ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-base px-2 py-0.5">{bestTime.toFixed(2)}s</Badge>
                      <button 
                        className="text-text-muted hover:text-red-400 transition-colors p-1"
                        title="Reset Best Time"
                        onClick={async () => {
                          if(confirm("Are you sure you want to reset your best time?")) {
                            try{
                              await axios.delete(`/learn/reset/${selectedAlgo[1]}`);
                              setBestTime(null);
                            } catch (err) {
                              console.error("Failed to reset best time:", err);
                            }
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-muted italic">Not recorded</span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setRandomMode(!randomMode);
                if(!randomMode) {
                  setRandomAlgorithm();
                }
              }}
              variant={randomMode ? "primary" : "secondary"}
              className="w-full md:w-auto"
            >
              <Shuffle size={18} className="mr-2" />
              {randomMode ? "Stop Randomizer" : "Start Randomizer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timer Area */}
      <div 
        className="flex-grow bg-surface/30 border border-white/5 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden cursor-pointer select-none group hover:bg-surface/40 transition-colors"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        
        <div className={`relative z-10 text-8xl md:text-9xl font-bold font-mono transition-all duration-100 ${getTimerColor()}`}>
          {time.toFixed(2)}
        </div>
        
        <div className="relative z-10 mt-8 text-text-muted text-lg font-quick flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          {getHelperText()}
        </div>
      </div>
    </div>
  );
}
