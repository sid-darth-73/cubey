import { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { AddButton } from "../../components/ui/AddButton";
const eventOptions = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Skewb', 'BLD', 'Other'];

export default function Averages() {
  const [averages, setAverages] = useState([]);
  const [time, setTime] = useState('');
  const [type, setType] = useState('3x3');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

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
    } catch (error) {
      console.error('Failure in adding the averages', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <h2 className="text-2xl font-bold mb-6">Your Averages</h2>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-2">Add a new ao5</h3>
        <div className="space-y-3">
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

            <AddButton text="Add ao5" onClick={handleAddAverage} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {averages.length === 0 ? (
          <p>No averages yet!</p>
        ) : (
          averages.map((average) => (
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
