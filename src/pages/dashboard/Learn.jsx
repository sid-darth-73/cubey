import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../utils/api";
import { Badge } from "../../components/ui/Badge";

const algorithmOptions = [
  { id: "OLL21", label: "OLL 21" },
  { id: "PLL_Ua", label: "PLL Ua" },
  { id: "4x4Parity", label: "4x4 Parity" },
  { id: "5x5L3E", label: "5x5 Last 3 Edges" },
];

export default function Learn() {
  const [selectedAlgo, setSelectedAlgo] = useState("OLL21");
  const [bestTime, setBestTime] = useState(null);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  //const [type, setType] = useState("3x3");

  const timeRef = useRef(0);
  const intervalRef = useRef(null); 

  const fetchBestTime = useCallback(async () => {
    try {
      const res = await axios.get(`/learn/${selectedAlgo}`);
      // Ensure the best time is stored as a number
      setBestTime(Number(res.data.bestTimeInSeconds));
      //setType(res.data.type); // optional
    } catch (err) {
      console.error("Error fetching best time:", err);
      setBestTime(null);
    }
  }, [selectedAlgo]);

  useEffect(() => {
    fetchBestTime();
  }, [fetchBestTime]);

  const handleTimerFinish = useCallback(async (finalTime) => {
    if (!selectedAlgo || finalTime <= 0) {
      console.log("Timer stopped too quickly or no algorithm selected.");
      return;
    }

    try {

      if(bestTime === null || finalTime < bestTime) {
        console.log(`Sending update for ${selectedAlgo}: ${finalTime}s`);
        await axios.post("/learn/update", {
          algoId: selectedAlgo,
          bestTimeInSeconds: Number(finalTime.toFixed(2))
        });
        setBestTime(Number(finalTime.toFixed(2))); 
      } else {
        console.log(`New time ${finalTime.toFixed(2)}s is not better than best time ${bestTime.toFixed(2)}s.`); // cool debug lol
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
          setRunning(false);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
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


  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6"> Learn & Train Algorithms</h2>

      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <div className="mb-4">
          <label className="block mb-1">Select Algorithm</label>
          <select
            className="bg-slate-700 p-2 rounded text-white"
            value={selectedAlgo}
            onChange={(e) => {
              setSelectedAlgo(e.target.value);
              if(intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setRunning(false);
              }
              setTime(0);
              timeRef.current = 0;
            }}
          >
            {algorithmOptions.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-lg mb-2">
          Your Best Time:{" "}
          {bestTime !== null ? (
            <Badge variant="default">{bestTime.toFixed(2)}s</Badge>
          ) : (
            <span className="text-gray-400">Not yet recorded</span>
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-lg text-center">
        <h3 className="text-xl mb-4"> Timer</h3>
        <div className="text-5xl font-bold font-mono">{time.toFixed(2)}s</div>
        <div className="mt-2 text-gray-400 text-sm">
          Press <span className="bg-slate-700 px-2 py-0.5 rounded">Space</span> to{" "}
          {running ? "stop" : "start"}
        </div>
      </div>
    </div>
  );
}