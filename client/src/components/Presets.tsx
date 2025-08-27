import React from 'react';
import { PresetTime } from '../types/timer';
import { Clock } from 'lucide-react';

interface PresetsProps {
  onSelectPreset: (seconds: number) => void;
  currentMode: 'countdown' | 'stopwatch';
}

export const Presets: React.FC<PresetsProps> = ({ onSelectPreset, currentMode }) => {
  const presets: PresetTime[] = [
    { label: '1 min', seconds: 60 },
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
    { label: '30 min', seconds: 1800 }
  ];

  if (currentMode === 'stopwatch') {
    return (
      <div className="p-4 sm:p-5 md:p-6 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Clock size={16} className="text-blue-400 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Stopwatch Mode</h3>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">Press play to start counting up from zero.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800/60 border border-gray-700 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-blue-400" />
        <h3 className="text-base font-semibold text-white">Quick Presets</h3>
      </div>
      
      <div className="flex gap-3">
        {/* Left Side - Quick Presets */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.seconds}
                onClick={() => onSelectPreset(preset.seconds)}
                className="px-2 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side - Custom Time Setter */}
        <div className="flex-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                defaultValue="5"
                className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="MM"
                id="custom-minutes"
              />
              <span className="text-gray-400">:</span>
              <input
                type="number"
                min="0"
                max="59"
                defaultValue="00"
                className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="SS"
                id="custom-seconds"
              />
              <button
                onClick={() => {
                  const minutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
                  const secondsInput = document.getElementById('custom-seconds') as HTMLInputElement;
                  const minutes = Math.max(0, parseInt(minutesInput?.value || '0', 10));
                  const seconds = Math.max(0, parseInt(secondsInput?.value || '0', 10));
                  const totalSeconds = minutes * 60 + Math.min(59, seconds);
                  const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                  onSelectPreset(totalSeconds);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-sm"
              >
                Set
              </button>
            </div>
            <p className="text-xs text-gray-400">*Minutes convert to hour(s) at 60min</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTimeInput: React.FC<{ onSelectPreset: (seconds: number) => void }> = ({ onSelectPreset }) => {
  const [mm, setMm] = React.useState('05');
  const [ss, setSs] = React.useState('00');

  const apply = () => {
    const minutes = Math.max(0, parseInt(mm || '0', 10));
    const seconds = Math.max(0, parseInt(ss || '0', 10));
    const totalSeconds = minutes * 60 + Math.min(59, seconds);
    const label = `${mm}:${ss.padStart(2, '0')}`;
    onSelectPreset(totalSeconds);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={mm}
        onChange={(e) => setMm(e.target.value.slice(0, 3))}
        className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
        placeholder="MM"
      />
      <span className="text-gray-400">:</span>
      <input
        type="number"
        min="0"
        max="59"
        value={ss}
        onChange={(e) => setSs(e.target.value.slice(0, 2))}
        className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
        placeholder="SS"
      />
      <button
        onClick={apply}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-sm"
      >
        Set
      </button>
    </div>
  );
};