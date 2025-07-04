import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { AddButton } from "../../components/ui/AddButton";
import { applyScramble } from 'react-rubiks-cube-utils';
import { Cube2D } from "../../utils/Cube2D"; 

const eventOptions = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'];

export default function Solves() {
  const [solves, setSolves] = useState([]);
  const [scramble, setScramble] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('3x3');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const fetchSolves = async () => {
    try {
      const res = await axios.get('/solves');
      setSolves(res.data.reverse());
    } catch (err) {
      console.error("Failed to fetch solves:", err);
    }
  };

  useEffect(() => {
    fetchSolves();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddSolve = async () => {
    try {
      await axios.post('/solves', {
        scramble,
        timeInSeconds: Number(time),
        type,
      });
      setScramble('');
      setTime('');
      fetchSolves();
    } catch (err) {
      console.error("Add solve failed:", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Solves</h2>

      <div className="bg-slate-800 p-4 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-2">Add a new solve</h3>
        <div className="space-y-3">
          <Input
            value={scramble}
            onChange={(e) => setScramble(e.target.value)}
            placeholder="Scramble"
          />
          <Input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Time in seconds"
          />
          <div className="flex items-center gap-2" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {type}
              <svg
                className="w-2.5 h-2.5 ml-2"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute mt-12 z-20 bg-white dark:bg-slate-700 rounded-lg shadow w-36">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  {eventOptions.map((ev) => (
                    <li key={ev}>
                      <button
                        onClick={() => {
                          setType(ev);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 dark:hover:text-white"
                      >
                        {ev}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <AddButton onClick={handleAddSolve} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {solves.length === 0 ? (
          <p>No solves yet.</p>
        ) : (
          solves.map((solve) => {
            const isVisualCube = ['3x3', '4x4', '5x5'].includes(solve.type);
            let cube = null;

            if (isVisualCube && solve.scramble) {
              try {
                cube = applyScramble({ type: solve.type, scramble: solve.scramble });
              } catch (err) {
                console.error(`Invalid ${solve.type} scramble:`, solve.scramble, err);
              }
            }

            return (
              <div
                key={solve._id}
                className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold text-lg">{solve.type}</div>
                    <div className="text-sm text-gray-400 break-words">
                      Scramble: {solve.scramble}
                    </div>
                    <div className="text-sm">Time: {solve.timeInSeconds}s</div>
                    {solve.isPB && (
                      <Badge variant="default" className="mt-2 inline-block">PB</Badge>
                    )}
                  </div>

                  {/* visual cube state */}
                  {isVisualCube && cube && (
                    <div className="w-fit max-w-[100%] overflow-auto">
                      <Cube2D cube={cube} size={10} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
