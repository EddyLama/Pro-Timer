import React from 'react';
import { formatTime } from '../utils/timeFormat';
import { X } from 'lucide-react';

interface LapTime {
  lapNumber: number;
  time: number;
  splitTime: number;
}

interface LapTimesProps {
  lapTimes: LapTime[];
  onClear?: () => void;
}

export const LapTimes: React.FC<LapTimesProps> = ({ lapTimes, onClear }) => {
  if (lapTimes.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2">Lap Times</h3>
        <p className="text-gray-400 text-sm">No laps recorded yet</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Lap Times</h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-white transition-colors text-sm"
            title="Clear all laps"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {lapTimes.map((lap, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Lap {lap.lapNumber}</span>
            <div className="text-right">
              <div className="text-blue-400 font-mono">{formatTime(lap.time, false, true)}</div>
              <div className="text-gray-500 text-xs font-mono">+{formatTime(lap.splitTime, false, true)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};