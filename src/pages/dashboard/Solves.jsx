import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { applyScramble } from 'react-rubiks-cube-utils';
import { Cube2D } from "../../utils/Cube2D"; 
import { Timer, Trash2, Plus, Upload, ChevronDown } from 'lucide-react';
import { scrambleCheck } from "../../utils/scrambleCheck";
import Papa from 'papaparse';

const eventOptions = ['2x2', '3x3', '4x4', '5x5', '6x6','7x7','OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'];

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
    const isVisualCube = ['2x2', '3x3', '4x4', '5x5', '6x6', '7x7'].includes(type);

    if(isVisualCube && !scrambleCheck(scramble, type)) {
      alert(`Invalid scramble for ${type}. Please check your input.`);
      return;
    }

    try {
      setLoading(true);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Add New Solve</CardTitle>
        </CardHeader>
        <CardContent>
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

              <div className="flex gap-4">
                <div className="relative" ref={dropdownRef}>
                  <Button 
                    variant="secondary" 
                    className="w-32 justify-between"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {type}
                    <ChevronDown size={14} />
                  </Button>

                  {dropdownOpen && (
                    <div className="absolute top-full mt-2 w-32 z-50 bg-surface border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {eventOptions.map((ev) => (
                        <button
                          key={ev}
                          onClick={() => { setType(ev); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover text-text-main transition-colors"
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleAddSolve} loading={loading} className="flex-1 md:flex-none">
                  <Plus size={18} className="mr-2" />
                  Add Solve
                </Button>
              </div>
            </div>

            {/* CSV Import */}
            <div className="w-full lg:w-auto p-4 rounded-lg bg-surface-hover/30 border border-white/5 flex flex-col items-center justify-center text-center">
              <label className="cursor-pointer group flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Upload size={20} />
                </div>
                <span className="text-sm font-medium text-text-muted group-hover:text-text-main transition-colors">Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
              {importError && <div className="text-red-400 text-xs mt-2 max-w-[150px]">{importError}</div>}
              <p className="text-[10px] text-text-muted mt-2">Format: time,type,scramble</p>
            </div>

          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold font-mont px-1">Recent Solves</h3>
        
        {solves.length === 0 ? (
          <div className="text-center py-12 text-text-muted bg-surface/30 rounded-xl border border-dashed border-border">
            <Timer size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No solves recorded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {solves.map((solve) => {
              const isVisualCube = ['2x2','3x3', '4x4', '5x5','6x6','7x7'].includes(solve.type);
              let cube = null;

              if(isVisualCube && solve.scramble && solve.scramble.length < 100) { // Limit scramble length for visual
                try {
                  cube = applyScramble({ type: solve.type, scramble: solve.scramble });
                } catch(err) {
                  // console.error(`Invalid ${solve.type} scramble`);
                }
              }

              return (
                <div key={solve._id} className="group bg-surface hover:bg-surface-hover/80 border border-border rounded-lg p-4 transition-all duration-200">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-primary">{solve.type}</span>
                        {solve.isPB && <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">PB</Badge>}
                      </div>
                      <p className="text-sm text-text-muted font-mono break-all">{solve.scramble}</p>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-2 text-xl font-bold font-mono text-text-main">
                        <Timer size={18} className="text-text-muted" />
                        {solve.timeInSeconds.toFixed(2)}s
                      </div>

                      <div className="flex items-center gap-4">
                         {isVisualCube && cube && (
                          <div className="hidden sm:block opacity-80 hover:opacity-100 transition-opacity">
                            <Cube2D cube={cube} size={15} />
                          </div>
                        )}
                        
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="text-text-muted hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            if (confirm("Delete this solve?")) handleDeleteSolve(solve._id);
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
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
