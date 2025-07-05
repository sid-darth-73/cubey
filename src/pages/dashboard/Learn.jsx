import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../utils/api";
import { algId } from "../../utils/algId";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export default function Learn() {
  const [category, setCategory] = useState("3x3");
  const [subcategory, setSubcategory] = useState("oll");
  const [algoKey, setAlgoKey] = useState("1");
  const [selectedAlgo, setSelectedAlgo] = useState(null);

  const [bestTime, setBestTime] = useState(null);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const timeRef = useRef(0);
  const intervalRef = useRef(null);
  const [randomMode, setRandomMode] = useState(false);

  const setRandomAlgorithm = useCallback(() => {
    const categories = Object.keys(algId);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setCategory(randomCategory);
    if (randomCategory === "3x3") {
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
    const algoObj =
      category === "3x3"
        ? algId?.[category]?.[subcategory]?.[algoKey]
        : algId?.[category]?.[algoKey];
    if (algoObj) {
      setSelectedAlgo(algoObj); // set full [name, id, notation]
    }
  }, [category, subcategory, algoKey]);

  const fetchBestTime = useCallback(async () => {
    if (!selectedAlgo) return;
    try {
      const res = await axios.get(`/learn/${selectedAlgo[1]}`); // use ID
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
      if (!selectedAlgo || finalTime <= 0) return;

      try {
        if (bestTime === null || finalTime < bestTime) {
          await axios.post("/learn/update", {
            algoId: selectedAlgo[1], // use ID
            bestTimeInSeconds: Number(finalTime.toFixed(2)),
          });
          setBestTime(Number(finalTime.toFixed(2)));
        }
      } catch (err) {
        console.error("Failed to update best time:", err);
      } finally {
        if (randomMode) {
          setRandomAlgorithm();
        }
      }
    },
    [selectedAlgo, bestTime, randomMode, setRandomAlgorithm]
  );

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

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6">Learn & Train Algorithms</h2>

      <div className="bg-slate-800 p-4 rounded mb-6">
        {/* Dropdowns */}
        <div className="flex flex-wrap gap-4 mb-3 items-center">
          <div className="flex-1 min-w-[150px]">
            <label className="block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setCategory(newCategory);

                if (newCategory === "3x3") {
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
              className="bg-slate-700 p-2 rounded text-white w-full"
            >
              {Object.keys(algId).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {category === "3x3" && (
            <div className="flex-1 min-w-[150px]">
              <label className="block mb-1">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => {
                  const newSub = e.target.value;
                  setSubcategory(newSub);
                  const defaultKey = Object.keys(algId["3x3"][newSub])[0];
                  setAlgoKey(defaultKey);
                }}
                className="bg-slate-700 p-2 rounded text-white w-full"
              >
                {Object.keys(algId["3x3"]).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 min-w-[150px]">
            <label className="block mb-1">Algorithm</label>
            <select
              value={algoKey}
              onChange={(e) => setAlgoKey(e.target.value)}
              className="bg-slate-700 p-2 rounded text-white w-full"
            >
              {Object.keys(
                category === "3x3"
                  ? algId[category]?.[subcategory] || {}
                  : algId[category] || {}
              ).map((key) => {
                const [name] =
                  category === "3x3"
                    ? algId[category]?.[subcategory]?.[key] || []
                    : algId[category]?.[key] || [];
                return (
                  <option key={key} value={key}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        {/* image and alg */}
        <div className="flex items-center gap-6 mb-4">
          <div className="w-24 h-24 flex-shrink-0">
            {selectedAlgo?.[1]?.startsWith("oll") && selectedAlgo[1].length <= 5 && (
              <img
                src={`/public/oll/svg/${selectedAlgo[1][3]}${selectedAlgo[1].length === 5 ? selectedAlgo[1][4] : ""}.svg`}
                alt="OLL visual"
                className="w-full h-full"
              />
            )}
            {selectedAlgo?.[1]?.startsWith("pll_") && (
              <img
                src={`/public/pll-arrows/svg/${selectedAlgo[1]}.svg`}
                alt="PLL visual"
                className="w-full h-full"
              />
            )}
            {(selectedAlgo?.[1]?.startsWith("pllpar") ||
              selectedAlgo?.[1]?.startsWith("ollpar")) && (
              <img
                src={`/public/parity/${selectedAlgo[1]}.png`}
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

          <div className="flex flex-col justify-center">
            {/* <div className="text-xl font-semibold">{selectedAlgo?.[0]}</div> */}
            <div className="text-2xl text-gray-400">{selectedAlgo?.[2]}</div>
            <div className="text-lg mt-1">
              Your Best Time:{" "}
              {bestTime !== null ? (
                <Badge variant="default">{bestTime.toFixed(2)}s</Badge>
              ) : (
                <span className="text-gray-400">Not yet recorded</span>
              )}
            </div>
          </div>
        </div>
        {/* button for random alg to train */}
        <Button
          onClick={() => {
            setRandomMode(!randomMode);
            if (!randomMode) {
              setRandomAlgorithm();
            }
          }}
          variant={randomMode ? "primary" : "secondary"}
          text={randomMode ? "Stop Randomizer" : "Start Randomizer"}
        />
      </div>
      {/* timer */}
      <div className="bg-slate-900 p-8 rounded-lg text-center">
        <h3 className="text-xl mb-4">Timer</h3>
        <div className="text-8xl font-bold font-mono">{time.toFixed(2)}s</div>
        <div className="mt-2 text-gray-400 text-sm">
          Press{" "}
          <span className="bg-slate-700 px-2 py-0.5 rounded">Space</span> to{" "}
          {running ? "stop" : "start"}
        </div>
      </div>
    </div>
  );
}
