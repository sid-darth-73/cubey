import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { AddButton } from "../../components/ui/AddButton";
import { applyScramble } from 'react-rubiks-cube-utils';
import { Cube2D } from "../../utils/Cube2D"; 
import { TimerIcon } from "../../components/ui/TimerIcon";
import { TrashIcon } from "../../components/ui/TrashIcon";
import Papa from 'papaparse';

const eventOptions = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'];

export default function Solves() {
  const [solves, setSolves] = useState([]);
  const [scramble, setScramble] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('3x3');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef();

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

  const handleDeleteSolve = async (id)=>{
    try {
      await axios.delete(`/solves/${id}`);
      setSolves((prev) => prev.filter((solve) => solve._id !== id));
    } catch (err) {
      console.error("Failed to delete solve:", err);
    }
  };

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

  const handleImportCSV = (e) => {
    setImportError("");
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        let hasError = false;
        for(const row of rows) {
          const { time, type, scramble } = row;
          if (!time || !type || !scramble) {
            setImportError("CSV must have time, type, and scramble columns.");
            hasError = true;
            break;
          }
          try {
            await axios.post('/solves', {
              timeInSeconds: Number(time),
              type,
              scramble,
            });
          } catch (err) {
            setImportError("Failed to import some solves. Please check your CSV.");
            hasError = true;
            break;
          }
        }
        if(!hasError) {
          fetchSolves();
        }
      },
      error: () => setImportError("Failed to parse CSV file."),
    });
  };

  return (
    <div>
      <div className="bg-slate-800 p-4 rounded-lg mb-8 relative">
        <h3 className="text-2xl font-mont text-center font-semibold mb-2">Add a new solve</h3>
        <div className="space-y-3">
          <Input value={scramble} onChange={(e) => setScramble(e.target.value)} placeholder="Scramble"/>

          <Input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time in seconds"/>

          <div className="flex items-center gap-2" ref={dropdownRef}>
            <button type="button" onClick={() => setDropdownOpen((prev) => !prev)} className="inline-flex items-center px-5 py-2.5 text-sm font-quick font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400">
              {type}
              <svg className="w-2.5 h-2.5 ml-2"
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
            {/* csv import */}
        <div className="absolute bottom-4 right-4 px-4 py-1 flex flex-col items-end bg-slate-900 bg-opacity-80 rounded-lg shadow-lg">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="block text-sm font-quick text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-500 hover:file:bg-blue-700"
            style={{ maxWidth: 180 }}
          />
          {importError && <div className="text-red-400 text-xs mt-1">{importError}</div>}
          <p className="text-xs font-mont text-slate-400">import csv: time,type,scramble</p>
        </div>
      </div>

      <div className="space-y-4">
        {solves.length === 0 ? (
          <p className="font-mont">No solves yet.</p>
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
                    <div className="font-semibold text-2xl">{solve.type}</div>
                    <div className="text-md font-mont text-gray-400 break-words">
                      {solve.scramble}
                    </div>
                    <div className="text-md gap-1 text-amber-300 flex"> <div><TimerIcon/></div> <div>{solve.timeInSeconds}s</div></div>
                    {solve.isPB && (
                      <Badge variant="default" className="mt-2 inline-block">PB</Badge>
                    )}
                  </div>

                  {/* delete part */}
                  <div onClick={() => {
                      if (confirm("Are you sure you want to delete this solve?")) {
                        handleDeleteSolve(solve._id);
                      }
                    }} className="cursor-pointer"><TrashIcon/></div>
                    
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
