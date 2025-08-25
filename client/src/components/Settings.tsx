import React, { useState } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { TimerSettings } from '../types/timer';
import { parseTimeInput } from '../utils/timeFormat';

interface SettingsProps {
  settings: TimerSettings;
  onSettingsChange: (settings: TimerSettings) => void;
  currentMode: 'countdown' | 'stopwatch';
  onModeChange: (mode: 'countdown' | 'stopwatch') => void;
  onSetCustomTime: (seconds: number) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSettingsChange,
  currentMode,
  onModeChange,
  onSetCustomTime
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customTime, setCustomTime] = useState('05:00');

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seconds = parseTimeInput(customTime);
    if (seconds > 0) {
      onSetCustomTime(seconds);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white shadow-lg transition-colors duration-200"
      >
        <SettingsIcon size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Timer Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Timer Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timer Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onModeChange('countdown')}
                    className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
                      currentMode === 'countdown'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Countdown
                  </button>
                  <button
                    onClick={() => onModeChange('stopwatch')}
                    className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
                      currentMode === 'stopwatch'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Stopwatch
                  </button>
                </div>
              </div>

              {/* Custom Time Input */}
              {currentMode === 'countdown' && (
                <form onSubmit={handleCustomTimeSubmit}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Time (MM:SS or HH:MM:SS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      placeholder="05:00"
                      className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                    >
                      Set
                    </button>
                  </div>
                </form>
              )}

              {/* Warning Thresholds */}
              {currentMode === 'countdown' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Warning Threshold (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.warningThreshold}
                      onChange={(e) => onSettingsChange({
                        ...settings,
                        warningThreshold: Math.max(0, parseInt(e.target.value, 10) || 0)
                      })}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">Timer turns yellow when time remaining is below this value</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Danger Threshold (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.dangerThreshold}
                      onChange={(e) => onSettingsChange({
                        ...settings,
                        dangerThreshold: Math.max(0, parseInt(e.target.value, 10) || 0)
                      })}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">Timer turns red when time remaining is below this value</p>
                  </div>
                </>
              )}

              {/* Display Options */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showMilliseconds}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      showMilliseconds: e.target.checked
                    })}
                    className="mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Show milliseconds</span>
                </label>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};