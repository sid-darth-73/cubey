import { useRef, useEffect, useState } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export default function Averages() {
    const [averages, setAverages] = useState([]);
    const [time, setTime] = useState();
    const [type, setType] = useState();


    const fetchAverages = async ()=>{
        try {
            const res = await axios.get('/averages');
            setAverages(res.data.reverse())
        }catch (error) {
            console.error('Failed to fetch Averages', error)
        }
    }

    useEffect(()=>{
        fetchAverages()
    }, []);

    const handleAddAverage = async ()=>{
        try {
            await axios.post('/averages', {
                timeInSeconds: Number(time), 
                type
            });
            setTime('');
            setType(''); //set them to empty to handle Add average in next turns

        }catch (error) {
            console.error('Failure in adding the averges', error)
        }
    }


    return (
        <div>
          <h2 className="text-2xl font-bold mb-6"> Your Averages</h2>
    
          <div className="bg-slate-800 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-2">Add a new ao5 </h3>
            <div className="space-y-3">
              <Input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time in seconds" />
              <select className="bg-slate-700 p-2 rounded text-white" value={type} onChange={(e) => setType(e.target.value)}>
                {['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'].map(ev => (
                  <option key={ev} value={ev}>{ev}</option>
                ))}
              </select>
              <Button text="Add ao5" onClick={handleAddAverage} />
            </div>
          </div>
    
          <div className="space-y-4">
            {averages.length === 0 ? (
              <p>No averages yet!</p>
            ) : (
              averages.map(average => (
                <div
                  key={average._id}
                  className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">{average.type}</div>
                      <div className="text-sm">Time: {average.timeInSeconds}s</div>
                    </div>
                    {average.isPB && <Badge variant="default">PB</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
}