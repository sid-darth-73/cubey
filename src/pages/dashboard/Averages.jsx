import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Trash2, Plus, Upload, ChevronDown, Calculator } from 'lucide-react';
import Papa from 'papaparse';

const eventOptions = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'];

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

export default function Averages() {
  const [averages, setAverages] = useState([]);
  const [time, setTime] = useState('');
  const [type, setType] = useState('3x3');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);

  const fetchAverages = async () => {
    try {
      const res = await axios.get('/averages');
      setAverages(res.data.reverse());
    } catch (error) {
      console.error('Failed to fetch Averages', error);
    }
  };

  useEffect(() => { fetchAverages(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddAverage = async () => {
    try {
      setLoading(true);
      await axios.post('/averages', { timeInSeconds: Number(time), type });
      setTime('');
      setType('3x3');
      fetchAverages();
    } catch(error) {
      console.error('Failure in adding the averages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAverage = async (id) => {
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
            hasError = true; break;
          }
          try {
            await axios.post('/averages', { timeInSeconds: Number(time), type });
          } catch (err) {
            setImportError("Failed to import some averages. Please check your CSV.");
            hasError = true; break;
          }
        }
        if(!hasError) fetchAverages();
      },
      error: () => setImportError("Failed to parse CSV file."),
    });
  };

  return (
    <div className="space-y-6">

      {/* Add Average Card */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: '#181818', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
      >
        <h2 className="text-[18px] font-semibold text-white mb-5">Add Average (ao5)</h2>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-grow w-full space-y-4">
            <Input
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Time in seconds"
              label="Average Time"
            />

            <div className="flex gap-3">
              {/* Event dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-colors"
                  style={{ border: '1px solid #4d4d4d', color: '#b3b3b3', backgroundColor: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1f1f1f'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; }}
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

              {/* Add button */}
              <button
                onClick={handleAddAverage}
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
                Add Average
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
            <p className="text-[10px] mt-2" style={{ color: '#b3b3b3' }}>Format: time,type</p>
          </div>
        </div>
      </div>

      {/* Averages Grid */}
      <div className="space-y-3">
        <h3 className="text-[18px] font-bold text-white px-1">Recorded Averages</h3>

        {averages.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg"
            style={{ color: '#b3b3b3', border: '1px dashed #282828', backgroundColor: '#181818' }}
          >
            <Calculator size={40} className="mx-auto mb-4 opacity-20" />
            <p>No averages recorded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {averages.map((average) => (
              <div
                key={average._id}
                className="relative p-5 rounded-lg transition-all duration-200 group"
                style={{ backgroundColor: '#181818' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#181818'}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-[14px]" style={{ color: '#1ed760' }}>{average.type}</div>
                  {average.isPB && <Badge>PB</Badge>}
                </div>

                <div className="font-mono text-[28px] font-bold tracking-tight mb-1 text-white">
                  {average.timeInSeconds.toFixed(2)}s
                </div>

                <p className="text-[12px]" style={{ color: '#b3b3b3' }}>Average of 5</p>

                {/* Delete — reveal on hover */}
                <button
                  onClick={() => { if(confirm("Delete this average?")) handleDeleteAverage(average._id); }}
                  className="absolute top-4 right-4 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: '#b3b3b3' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f3727f'; e.currentTarget.style.backgroundColor = 'rgba(243,114,127,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#b3b3b3'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
