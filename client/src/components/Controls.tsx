import React from 'react';
import { Play, Pause, Square, RotateCcw, Maximize } from 'lucide-react';
import { TimerState } from '../types/timer';

interface ControlsProps {
  timer: TimerState;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  timer,
  onStart,
  onPause,
  onStop,
  onReset
}) => {
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 p-6">
      <button
        onClick={timer.isRunning ? onPause : onStart}
        className={`p-4 rounded-full transition-all duration-200 ${
          timer.isRunning
            ? 'bg-yellow-600 hover:bg-yellow-700'
            : 'bg-green-600 hover:bg-green-700'
        } text-white shadow-lg hover:shadow-xl transform hover:scale-105`}
        disabled={timer.mode === 'countdown' && timer.currentTime <= 0}
      >
        {timer.isRunning ? <Pause size={24} /> : <Play size={24} />}
      </button>
      
      <button
        onClick={onStop}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <Square size={24} />
      </button>
      
      <button
        onClick={onReset}
        className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <RotateCcw size={24} />
      </button>
      
      <button
        onClick={toggleFullscreen}
        className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <Maximize size={24} />
      </button>
    </div>
  );
};