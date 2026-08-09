import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { applyScramble } from 'react-rubiks-cube-utils';
import { Cube2D } from "../../utils/Cube2D";
import { Timer, Trash2, Plus, Upload, ChevronDown } from 'lucide-react';
import { scrambleCheck } from "../../utils/scrambleCheck";
import Papa from 'papaparse';

const eventOptions = ['2x2', '3x3', '4x4', '5x5', '6x6','7x7','OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'];

// Reusable pill dropdown button style
const pillBtn = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '9999px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid #4d4d4d',
  backgroundColor: active ? '#1f1f1f' : 'transparent',
  color: active ? '#ffffff' : '#b3b3b3',
  transition: 'all 0.15s',
});

export default function Solves() {
  const [solves, setSolves] = useState([]);
  const [scramble, setScramble] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('3x3');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterMaxTime, setFilterMaxTime] = useState('');
  const [filterComment, setFilterComment] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef();

  const fetchSolves = async () => {
    try {
      let url = '/solves?';
      if (filterType !== 'All') url += `type=${filterType}&`;
      if (filterMaxTime) url += `maxTime=${filterMaxTime}&`;

      const trimmedComment = filterComment.trim();
      if (trimmedComment) url += `comment=${encodeURIComponent(trimmedComment)}&`;

      const res = await axios.get(url);
      setSolves(res.data.reverse());
    } catch (err) {
      console.error("Failed to fetch solves:", err);
    }
  };

  useEffect(() => { fetchSolves(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) setFilterDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { fetchSolves(); }, [filterType, filterMaxTime, filterComment]);

  const handleDeleteSolve = async (id) => {
    try {
      await axios.delete(`/solves/${id}`);
      setSolves((prev) => prev.filter((solve) => solve._id !== id));
    } catch (err) {
      console.error("Failed to delete solve:", err);
    }
  };

  const handleAddSolve = async () => {
    const isVisualCube = ['2x2', '3x3', '4x4', '5x5', '6x6', '7x7'].includes(type);
    if(isVisualCube && !scrambleCheck(scramble, type)) {
      alert(`Invalid scramble for ${type}. Please check your input.`);
      return;
    }
    try {
      setLoading(true);
      await axios.post('/solves', { scramble, timeInSeconds: Number(time), type });
      setScramble('');
      setTime('');
      fetchSolves();
    } catch (err) {
      console.error("Add solve failed:", err);
    } finally {
      setLoading(false);
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
            hasError = true; break;
          }
          try {
            await axios.post('/solves', { timeInSeconds: Number(time), type, scramble });
          } catch (err) {
            setImportError("Failed to import some solves. Please check your CSV.");
            hasError = true; break;
          }
        }
        if(!hasError) fetchSolves();
      },
      error: () => setImportError("Failed to parse CSV file."),
    });
  };

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    width: '130px',
    zIndex: 50,
    backgroundColor: '#1f1f1f',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px',
    border: '1px solid #282828',
  };

  return (
    <div className="space-y-6">

      {/* Add Solve Card */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
      >
        <h2 className="text-[18px] font-semibold text-white mb-5">Add New Solve</h2>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-grow w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={scramble}
                onChange={(e) => setScramble(e.target.value)}
                placeholder="Scramble sequence"
                label="Scramble"
              />
              <Input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="0.00"
                label="Time (seconds)"
              />
            </div>

            <div className="flex gap-3">
              {/* Event dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  style={pillBtn(false)}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {type}
                  <ChevronDown size={13} />
                </button>
                {dropdownOpen && (
                  <div style={dropdownStyle}>
                    {eventOptions.map((ev) => (
                      <button
                        key={ev}
                        onClick={() => { setType(ev); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: '#ffffff' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {ev}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Solve button */}
              <button
                onClick={handleAddSolve}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-[13px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: '#1ed760', color: '#000000' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1db954'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1ed760'; }}
              >
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  : <Plus size={16} />
                }
                Add Solve
              </button>
            </div>
          </div>

          {/* CSV Import */}
          <div
            className="w-full lg:w-auto p-4 rounded-lg flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: '#1f1f1f' }}
          >
            <label className="cursor-pointer group flex flex-col items-center gap-2">
              <div
                className="p-3 rounded-full transition-colors"
                style={{ backgroundColor: '#252525', color: '#b3b3b3' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1ed760'; e.currentTarget.style.color = '#000000'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#252525'; e.currentTarget.style.color = '#b3b3b3'; }}
              >
                <Upload size={18} />
              </div>
              <span className="text-sm font-bold" style={{ color: '#b3b3b3' }}>Import CSV</span>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
            </label>
            {importError && <div className="text-xs mt-2 max-w-[150px]" style={{ color: '#f3727f' }}>{importError}</div>}
            <p className="text-[10px] mt-2" style={{ color: '#b3b3b3' }}>Format: time,type,scramble</p>
          </div>
        </div>
      </div>

      {/* Solves List */}
      <div className="space-y-3">
        {/* List Header + Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
          <h3 className="text-[18px] font-bold text-white">Recent Solves</h3>

          <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {/* Filter event dropdown */}
            <div className="relative shrink-0" ref={filterDropdownRef}>
              <button
                style={pillBtn(false)}
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              >
                {filterType}
                <ChevronDown size={13} />
              </button>
              {filterDropdownOpen && (
                <div style={dropdownStyle}>
                  {['All', ...eventOptions].map((ev) => (
                    <button
                      key={ev}
                      onClick={() => { setFilterType(ev); setFilterDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: '#ffffff' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {ev}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="number"
              placeholder="Max Time (s)"
              value={filterMaxTime}
              onChange={(e) => setFilterMaxTime(e.target.value)}
              className="w-32 px-3 py-1.5 text-sm rounded-full shrink-0 outline-none transition-colors"
              style={{
                backgroundColor: '#1f1f1f',
                color: '#ffffff',
                boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
              }}
            />

            <input
              type="text"
              placeholder="Search comment..."
              value={filterComment}
              onChange={(e) => setFilterComment(e.target.value)}
              className="w-48 px-3 py-1.5 text-sm rounded-full shrink-0 outline-none transition-colors"
              style={{
                backgroundColor: '#1f1f1f',
                color: '#ffffff',
                boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
              }}
            />
          </div>
        </div>

        {solves.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg"
            style={{ color: '#b3b3b3', border: '1px dashed #282828', backgroundColor: '#181818' }}
          >
            <Timer size={40} className="mx-auto mb-4 opacity-20" />
            <p>No solves recorded yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {solves.map((solve) => {
              const isVisualCube = ['2x2','3x3', '4x4', '5x5','6x6','7x7'].includes(solve.type);
              let cube = null;
              if(isVisualCube && solve.scramble && solve.scramble.length < 100) {
                try { cube = applyScramble({ type: solve.type, scramble: solve.scramble }); } catch(err) {}
              }

              return (
                <div
                  key={solve._id}
                  className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 rounded-lg transition-all duration-200 group"
                  style={{ backgroundColor: '#181818' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#181818'}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[14px]" style={{ color: '#1ed760' }}>{solve.type}</span>
                      {solve.isPB && <Badge>PB</Badge>}
                    </div>
                    <p className="text-sm font-mono break-all" style={{ color: '#b3b3b3' }}>{solve.scramble}</p>
                  </div>

                  <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
                    {solve.comment && (
                      <div className="text-sm italic max-w-xs truncate" style={{ color: '#b3b3b3' }}>
                        "{solve.comment}"
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xl font-bold font-mono text-white shrink-0">
                      <Timer size={16} style={{ color: '#b3b3b3' }} />
                      {solve.timeInSeconds.toFixed(2)}s
                    </div>

                    <div className="flex items-center gap-3">
                      {isVisualCube && cube && (
                        <div className="hidden sm:block opacity-60 hover:opacity-100 transition-opacity">
                          <Cube2D cube={cube} size={15} />
                        </div>
                      )}
                      <button
                        onClick={() => { if (confirm("Delete this solve?")) handleDeleteSolve(solve._id); }}
                        className="p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        style={{ color: '#b3b3b3' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f3727f'; e.currentTarget.style.backgroundColor = 'rgba(243,114,127,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#b3b3b3'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
