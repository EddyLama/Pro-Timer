import React from 'react';
import { Play, Pause, Square, RotateCcw, Maximize, Flag } from 'lucide-react';
import { TimerState } from '../types/timer';

interface ControlsProps {
  timer: TimerState;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onLap?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  timer,
  onStart,
  onPause,
  onStop,
  onReset,
  onLap
}) => {
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
      <button
        onClick={timer.isRunning ? onPause : onStart}
        className={`p-2 sm:p-3 md:p-4 rounded-full transition-colors duration-150 ${
          timer.isRunning
            ? 'bg-yellow-600 hover:bg-yellow-700'
            : 'bg-green-600 hover:bg-green-700'
        } text-white shadow-md`}
      >
        {timer.isRunning ? <Pause size={16} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <Play size={16} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
      </button>
      
      <button
        onClick={onStop}
        className="p-2 sm:p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md"
      >
        <Square size={16} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </button>
      
      <button
        onClick={onReset}
        className="p-2 sm:p-3 md:p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
      >
        <RotateCcw size={16} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </button>
      
      {timer.mode === 'stopwatch' && onLap && (
        <button
          onClick={onLap}
          disabled={!timer.isRunning}
          className="p-2 sm:p-3 md:p-4 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white shadow-md"
        >
          <Flag size={16} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        </button>
      )}
      
      <button
        onClick={toggleFullscreen}
        className="p-2 sm:p-3 md:p-4 rounded-full bg-gray-600 hover:bg-gray-700 text-white shadow-md"
      >
        <Maximize size={16} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
};