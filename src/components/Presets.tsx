import React from 'react';
import { PresetTime } from '../types/timer';
import { Clock } from 'lucide-react';

interface PresetsProps {
  onSelectPreset: (seconds: number) => void;
  currentMode: 'countdown' | 'stopwatch';
}

export const Presets: React.FC<PresetsProps> = ({ onSelectPreset, currentMode }) => {
  const presets: PresetTime[] = [
    { label: '30 sec', seconds: 30 },
    { label: '1 min', seconds: 60 },
    { label: '2 min', seconds: 120 },
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
    { label: '15 min', seconds: 900 },
    { label: '20 min', seconds: 1200 },
    { label: '30 min', seconds: 1800 },
    { label: '45 min', seconds: 2700 },
    { label: '1 hour', seconds: 3600 }
  ];

  if (currentMode === 'stopwatch') {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Stopwatch Mode</h3>
        </div>
        <p className="text-gray-400">Press play to start counting up from zero.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Quick Presets</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.seconds}
            onClick={() => onSelectPreset(preset.seconds)}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors duration-200 hover:text-blue-400"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};