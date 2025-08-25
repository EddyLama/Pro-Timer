import React from 'react';
import { formatTime } from '../utils/timeFormat';
import { TimerState, TimerSettings } from '../types/timer';

interface TimerProps {
  timer: TimerState;
  settings: TimerSettings;
  getTimerColor: () => string;
  fullscreen?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ timer, settings, getTimerColor, fullscreen = false }) => {
  
  return (
    <div className={`flex flex-col items-center justify-center ${fullscreen ? 'p-12' : 'p-8'}`}>
      <div className="text-center mb-6">
        <span className={`font-medium text-gray-400 uppercase tracking-wider ${
          fullscreen ? 'text-2xl' : 'text-lg'
        }`}>
          {timer.mode === 'countdown' ? 'Countdown Timer' : 'Stopwatch'}
        </span>
      </div>
      
      <div className={`font-mono font-bold ${getTimerColor()} transition-colors duration-200 ${
        fullscreen ? 'text-[12rem] md:text-[16rem]' : 'text-6xl md:text-8xl'
      }`}>
        {formatTime(timer.currentTime, settings.showMilliseconds)}
      </div>
      
      {timer.mode === 'countdown' && timer.initialTime > 0 && (
        <div className={`mt-8 w-full ${fullscreen ? 'max-w-2xl' : 'max-w-md'}`}>
          <div className={`text-gray-400 mb-3 text-center ${
            fullscreen ? 'text-xl' : 'text-sm'
          }`}>
            Progress: {Math.round((1 - timer.currentTime / timer.initialTime) * 100)}%
          </div>
          <div className={`w-full bg-gray-700 rounded-full ${fullscreen ? 'h-4' : 'h-2'}`}>
            <div
              className={`${fullscreen ? 'h-4' : 'h-2'} rounded-full transition-all duration-200 ${
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