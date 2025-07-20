import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { AddButton } from "../../components/ui/AddButton";
import { TrashIcon } from "../../components/ui/TrashIcon";
import Papa from 'papaparse';

const eventOptions = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'];

export default function Averages() {
  const [averages, setAverages] = useState([]);
  const [time, setTime] = useState('');
  const [type, setType] = useState('3x3');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef();

  const fetchAverages = async () => {
    try {
      const res = await axios.get('/averages');
      setAverages(res.data.reverse());
    } catch (error) {
      console.error('Failed to fetch Averages', error);
    }
  };

  useEffect(() => {
    fetchAverages();
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

  const handleAddAverage = async () => {
    try {
      await axios.post('/averages', {
        timeInSeconds: Number(time),
        type
      });
      setTime('');
      setType('3x3');
      fetchAverages();
    } catch(error) {
      console.error('Failure in adding the averages', error);
    }
  };
  const handleDeleteAverage = async (id)=>{
    try {
      await axios.delete(`/averages/${id}`);
      setAverages((prev) => prev.filter((average) => average._id !== id));
    } catch (err) {
      console.error("Failed to delete average:", err);
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
        for (const row of rows) {
          const { time, type } = row;
          if (!time || !type) {
            setImportError("CSV must have 'time' and 'type' columns.");
            hasError = true;
            break;
          }
          try {
            await axios.post('/averages', {
              timeInSeconds: Number(time),
              type,
            });
          } catch (err) {
            setImportError("Failed to import some averages. Please check your CSV.");
            hasError = true;
            break;
          }
        }
        if(!hasError) {
          fetchAverages();
        }
      },
      error: () => setImportError("Failed to parse CSV file."),
    });
  };

    return (
    <div>
      <div className="bg-slate-800 p-4 rounded-lg mb-8">
        <h3 className="text-2xl font-mont text-center font-semibold mb-4">Add a new ao5</h3>
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* --- inputs--- */}
          <div className="space-y-3 flex-grow w-full">
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
                className="inline-flex items-center px-5 py-2.5 text-sm font-quick font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {type}
                <svg className="w-2.5 h-2.5 ml-2" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              <AddButton text="Add ao5" onClick={handleAddAverage} />
            </div>
          </div>

          {/* --- csv import --- */}
          <div className="w-full md:w-auto p-3 flex flex-col items-center md:items-end bg-slate-900/80 rounded-lg shadow-lg flex-shrink-0">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportCSV}
              className="block w-full max-w-xs md:max-w-[180px] text-sm font-quick text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200"
            />
            {importError && <div className="text-red-400 text-xs mt-1">{importError}</div>}
            <p className="text-xs font-mont text-slate-400 mt-1">import csv: time,type</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {averages.length === 0 ? (
          <p className="font-mont">No averages yet.</p>
        ) : (
          averages.map((average) => (
            <div
              key={average._id}
              className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-2xl">{average.type}</div>
                  <div className="text-md font-mont text-gray-400 break-words">
                    {average.timeInSeconds}s
                  </div>
                  {average.isPB && (
                    <Badge variant="default" className="mt-2 inline-block">PB</Badge>
                  )}
                </div>
                <div className="cursor-pointer" onClick={() => {
                      if(confirm("Are you sure you want to delete this average?")) {
                        handleDeleteAverage(average._id);
                      }
                  }}><TrashIcon/></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );


}
