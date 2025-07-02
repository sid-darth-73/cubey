import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export default function Solves() {
  const [solves, setSolves] = useState([]);
  const [scramble, setScramble] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('3x3');

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

  const handleAddSolve = async () => {
    console.log(scramble)
    console.log(time)
    console.log(type)
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
      <h2 className="text-2xl font-bold mb-6">🧩 Your Solves</h2>

      <div className="bg-slate-800 p-4 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-2">Add a new solve</h3>
        <div className="space-y-3">
          <Input value={scramble} onChange={(e) => setScramble(e.target.value)} placeholder="Scramble" />
          <Input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time in seconds" />
          <select className="bg-slate-700 p-2 rounded text-white" value={type} onChange={(e) => setType(e.target.value)}>
            {['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'].map(ev => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
          <Button text="Add Solve" onClick={handleAddSolve} />
        </div>
      </div>

      <div className="space-y-4">
        {solves.length === 0 ? (
          <p>No solves yet.</p>
        ) : (
          solves.map(solve => (
            <div
              key={solve._id}
              className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{solve.type}</div>
                  <div className="text-sm text-gray-400">Scramble: {solve.scramble}</div>
                  <div className="text-sm">Time: {solve.timeInSeconds}s</div>
                </div>
                {solve.isPB && <Badge variant="default">PB</Badge>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
