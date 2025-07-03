import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../utils/api";
import { algId } from "../../utils/algId";
import { Badge } from "../../components/ui/Badge";

export default function Learn() {
  const [category, setCategory] = useState("3x3");
  const [subcategory, setSubcategory] = useState("oll");
  const [algoKey, setAlgoKey] = useState("1");
  const [selectedAlgo, setSelectedAlgo] = useState("oll1");

  const [bestTime, setBestTime] = useState(null);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const timeRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const algoObj = algId?.[category]?.[subcategory]?.[algoKey] || algId?.[category]?.[algoKey];
    if (algoObj) {
      setSelectedAlgo(algoObj[1]); // the algoId like 'oll1'
    }
  }, [category, subcategory, algoKey]);

  const fetchBestTime = useCallback(async () => {
    try {
      const res = await axios.get(`/learn/${selectedAlgo}`);
      setBestTime(Number(res.data.bestTimeInSeconds));
    } catch {
      setBestTime(null);
    }
  }, [selectedAlgo]);

  useEffect(() => {
    fetchBestTime();
  }, [fetchBestTime]);

  const handleTimerFinish = useCallback(async (finalTime) => {
    if (!selectedAlgo || finalTime <= 0) return;

    try {
      if (bestTime === null || finalTime < bestTime) {
        await axios.post("/learn/update", {
          algoId: selectedAlgo,
          bestTimeInSeconds: Number(finalTime.toFixed(2))
        });
        setBestTime(Number(finalTime.toFixed(2)));
      }
    } catch (err) {
      console.error("Failed to update best time:", err);
    }
  }, [selectedAlgo, bestTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
          handleTimerFinish(timeRef.current);
        } else {
          timeRef.current = 0;
          setTime(0);
          setRunning(true);

          intervalRef.current = setInterval(() => {
            timeRef.current += 0.01;
            setTime(parseFloat(timeRef.current.toFixed(2)));
          }, 10);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleTimerFinish]);

  const algoData = algId?.[category]?.[subcategory]?.[algoKey] || algId?.[category]?.[algoKey];
  const [algoName, , algoNotation] = algoData || [];

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6">Learn & Train Algorithms</h2>

      <div className="bg-slate-800 p-4 rounded mb-6">
        <div className="mb-3">
          <label>Category</label>
          <select value={category} onChange={e => {
            setCategory(e.target.value);
            setSubcategory("");
            setAlgoKey("1");
          }} className="bg-slate-700 p-2 rounded text-white ml-2">
            {Object.keys(algId).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {category === "3x3" && (
          <div className="mb-3">
            <label>Subcategory</label>
            <select value={subcategory} onChange={e => {
              setSubcategory(e.target.value);
              setAlgoKey("1");
            }} className="bg-slate-700 p-2 rounded text-white ml-2">
              {Object.keys(algId["3x3"]).map(sub => <option key={sub} value={sub}>{sub.toUpperCase()}</option>)}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label>Algorithm</label>
          <select value={algoKey} onChange={e => setAlgoKey(e.target.value)} className="bg-slate-700 p-2 rounded text-white ml-2">
            {Object.keys(category === "3x3" ? algId[category][subcategory] : algId[category]).map(key => {
              const [name] = (category === "3x3" ? algId[category][subcategory][key] : algId[category][key]) || [];
              return <option key={key} value={key}>{name}</option>;
            })}
          </select>
          
        </div>

        <div className="mb-3">
          <div className="text-lg font-semibold">{algoName}</div>
          <div className="text-sm text-gray-400">{algoNotation}</div>
        </div>

        <div className="text-lg mb-2">
          Your Best Time: {bestTime !== null ? (
            <Badge variant="default">{bestTime.toFixed(2)}s</Badge>
          ) : <span className="text-gray-400">Not yet recorded</span>}
        </div>
        
      </div>
        <div className="flex flex-col items-center mb-6">
  <h3 className="text-xl font-semibold mb-2">Algorithm Visual</h3>
  {console.log(selectedAlgo)}
  {selectedAlgo.startsWith("oll") && (
    <img
      src={`/public/oll/svg/${selectedAlgo[3]}.svg`}
      alt="OLL visual"
      className="w-40 h-40"
    />
  )}
  {selectedAlgo.startsWith("pll_") && (
    <img
      src={`/assets/pll-arrows/svg/${selectedAlgo}.svg`}
      alt="PLL visual"
      className="w-40 h-40"
    />
  )}
  {selectedAlgo.startsWith("pllpar") || selectedAlgo.startsWith("ollpar") ? (
    <img
      src={`/assets/parity/${selectedAlgo}.png`}
      alt="4x4 parity"
      className="w-40 h-40"
    />
  ) : null}
  {selectedAlgo.startsWith("l2e") && (
    <img
      src={`/assets/l2e/${selectedAlgo}.png`}
      alt="5x5 L2E case"
      className="w-40 h-40"
    />
  )}
</div>
      
      <div className="bg-slate-900 p-8 rounded-lg text-center">
        
        <h3 className="text-xl mb-4">⏱️ Timer</h3>
        <div className="text-5xl font-bold font-mono">{time.toFixed(2)}s</div>
        <div className="mt-2 text-gray-400 text-sm">
          Press <span className="bg-slate-700 px-2 py-0.5 rounded">Space</span> to {running ? "stop" : "start"}
        </div>
      </div>
      {/* <img src={`../../../public/oll/svg/1.svg`} alt="Logo" /> */}
    </div>
  );
}
