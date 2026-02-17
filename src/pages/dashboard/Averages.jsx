import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Trash2, Plus, Upload, ChevronDown, Calculator } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      await axios.post('/averages', {
        timeInSeconds: Number(time),
        type
      });
      setTime('');
      setType('3x3');
      fetchAverages();
    } catch(error) {
      console.error('Failure in adding the averages', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Add Average (ao5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            <div className="flex-grow w-full space-y-4">
              <Input 
                type="number" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                placeholder="Time in seconds"
                label="Average Time"
              />

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

                <Button onClick={handleAddAverage} loading={loading}>
                  <Plus size={18} className="mr-2" />
                  Add Average
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
              <p className="text-[10px] text-text-muted mt-2">Format: time,type</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold font-mont px-1">Recorded Averages</h3>

        {averages.length === 0 ? (
           <div className="text-center py-12 text-text-muted bg-surface/30 rounded-xl border border-dashed border-border">
            <Calculator size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No averages recorded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {averages.map((average) => (
              <div
                key={average._id}
                className="group relative bg-surface hover:bg-surface-hover/80 border border-border p-6 rounded-xl transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="font-bold text-lg text-primary">{average.type}</div>
                   {average.isPB && <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">PB</Badge>}
                </div>
                
                <div className="font-mono text-3xl font-bold tracking-tight mb-2">
                  {average.timeInSeconds.toFixed(2)}s
                </div>
                
                <p className="text-xs text-text-muted">Average of 5</p>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:text-red-400 hover:bg-red-500/10"
                     onClick={() => {
                        if(confirm("Delete this average?")) handleDeleteAverage(average._id);
                      }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}
