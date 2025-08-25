import React from 'react';
import { formatTime } from '../utils/timeFormat';
import { TimerState, TimerSettings } from '../types/timer';

interface TimerProps {
  timer: TimerState;
  settings: TimerSettings;
  getTimerColor: () => string;
}

export const Timer: React.FC<TimerProps> = ({ timer, settings, getTimerColor }) => {
  const isFullscreen = document.fullscreenElement !== null;
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-center mb-4">
        <span className="text-lg font-medium text-gray-400 uppercase tracking-wider">
          {timer.mode === 'countdown' ? 'Countdown Timer' : 'Stopwatch'}
        </span>
      </div>
      
      <div className={`font-mono font-bold ${getTimerColor()} transition-colors duration-200 ${
        isFullscreen ? 'text-9xl' : 'text-6xl md:text-8xl'
      }`}>
        {formatTime(timer.currentTime, settings.showMilliseconds)}
      </div>
      
      {timer.mode === 'countdown' && timer.initialTime > 0 && (
        <div className="mt-6 w-full max-w-md">
          <div className="text-sm text-gray-400 mb-2 text-center">
            Progress: {Math.round((1 - timer.currentTime / timer.initialTime) * 100)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-200 ${
                timer.currentTime <= settings.dangerThreshold
                  ? 'bg-red-400'
                  : timer.currentTime <= settings.warningThreshold
                  ? 'bg-yellow-400'
                  : 'bg-green-400'
              }`}
              style={{
                width: `${Math.max(0, (1 - timer.currentTime / timer.initialTime) * 100)}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};