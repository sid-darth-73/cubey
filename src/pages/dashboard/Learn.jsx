import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../utils/api";
import { algId } from "../../utils/algId";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { TrashIcon } from "../../components/ui/TrashIcon";

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
        return 'text-green-400';
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
        return <><span className="bg-slate-700 px-2 py-1 rounded">Stop</span></>;
      default:
        return <>Hold to <span className="bg-slate-700 px-2 py-1 rounded">Start</span></>;
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col p-2 sm:p-4">
      <div className="bg-slate-800 p-3 sm:p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 font-quick text-sm">
          <div>
            <label className="block mb-1 text-slate-300">Category</label>
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
              className="bg-slate-700 p-2 rounded-lg text-white w-full"
            >
              {Object.keys(algId).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {category === "3x3" && (
            <div>
              <label className="block mb-1 text-slate-300">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => {
                  const newSub = e.target.value;
                  setSubcategory(newSub);
                  const defaultKey = Object.keys(algId["3x3"][newSub])[0];
                  setAlgoKey(defaultKey);
                }}
                className="bg-slate-700 p-2 rounded-lg text-white w-full"
              >
                {Object.keys(algId["3x3"]).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sm:col-start-3">
            <label className="block mb-1 text-slate-300">Algorithm</label>
            <select
              value={algoKey}
              onChange={(e) => setAlgoKey(e.target.value)}
              className="bg-slate-700 p-2 rounded-lg text-white w-full"
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

        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 mb-4">
          <div className="w-24 h-24 flex-shrink-0">
            {selectedAlgo?.[1]?.startsWith("oll") && selectedAlgo[1].length <= 5 && (
              <img
                src={`/oll/svg/${selectedAlgo[1][3]}${selectedAlgo[1].length === 5 ? selectedAlgo[1][4] : ""}.svg`}
                alt="OLL visual"
                className="w-full h-full"
              />
            )}
            {selectedAlgo?.[1]?.startsWith("pll_") && (
              <img
                src={`/pll-arrows/svg/${selectedAlgo[1]}.svg`}
                alt="PLL visual"
                className="w-full h-full"
              />
            )}
            {(selectedAlgo?.[1]?.startsWith("pllpar") || selectedAlgo?.[1]?.startsWith("ollpar")) && (
              <img
                src={`/parity/${selectedAlgo[1]}.png`}
                alt="4x4 parity"
                className="w-full h-full"
              />
            )}
            {selectedAlgo?.[1]?.startsWith("l2e") && (
              <img
                src={`/public/l2e/${selectedAlgo[1]}.png`}
                alt="5x5 L2E case"
                className="w-full h-full"
              />
            )}
          </div>

          <div className="flex flex-col justify-center font-quick">
            <div className="text-xl sm:text-2xl text-gray-400">{selectedAlgo?.[2]}</div>
            <div className="text-base sm:text-lg mt-2">
              Your Best Time:{" "}
              {bestTime !== null ? (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Badge variant="default">{bestTime.toFixed(2)}s</Badge>
                  <div className="cursor-pointer" onClick={async () => {
                      if(confirm("Are you sure you want to reset your best time?")) {
                        try{
                          await axios.delete(`/learn/reset/${selectedAlgo[1]}`);
                          setBestTime(null);
                        } catch (err) {
                          console.error("Failed to reset best time:", err);
                        }
                      }
                    }}><TrashIcon/></div>
                </div>
              ) : (
                <span className="text-gray-400">Not yet recorded</span>
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
          text={randomMode ? "Stop Randomizer" : "Start Randomizer"}
          className="font-quick w-full sm:w-auto"
        />
      </div>

      {/* --- timer --- */}
      <div 
        className="bg-gradient-to-br from-slate-700 to-slate-900 flex-grow rounded-lg flex flex-col justify-center items-center text-center select-none cursor-pointer p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`text-7xl sm:text-8xl font-bold font-mono transition-colors duration-200 ${getTimerColor()}`}>
          {time.toFixed(2)}
        </div>
        <div className="mt-4 text-gray-400 text-lg font-quick h-8">
          {getHelperText()}
        </div>
      </div>
    </div>
  );
}
