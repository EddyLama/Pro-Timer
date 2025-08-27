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
  const [defaultTimerLabel, setDefaultTimerLabel] = useState('');

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seconds = parseTimeInput(customTime);
    if (seconds > 0) {
      onSetCustomTime(seconds);
      setIsOpen(false);
    }
  };

  const presets = [
    { minutes: 1, label: '1m' },
    { minutes: 5, label: '5m' },
    { minutes: 10, label: '10m' },
    { minutes: 15, label: '15m' },
    { minutes: 30, label: '30m' },
    { minutes: 45, label: '45m' },
    { minutes: 60, label: '1h' },
    { minutes: 90, label: '1h30' }
  ];

  const handlePresetSelect = (minutes: number) => {
    const seconds = minutes * 60;
    const label = `${minutes}m`;
    onSetCustomTime(seconds);
    setIsOpen(false);
  };

  const handleSetDefaultTimer = () => {
    const minutesInput = document.getElementById('settings-minutes') as HTMLInputElement;
    const secondsInput = document.getElementById('settings-seconds') as HTMLInputElement;
    const labelInput = document.getElementById('settings-label') as HTMLInputElement;
    
    const minutes = Math.max(0, parseInt(minutesInput?.value || '0', 10));
    const seconds = Math.max(0, parseInt(secondsInput?.value || '0', 10));
    const label = labelInput?.value.trim() || `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const totalSeconds = minutes * 60 + Math.min(59, seconds);
    onSetCustomTime(totalSeconds);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 p-1.5 sm:p-2 md:p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white shadow-lg transition-colors duration-200 z-40"
      >
        <SettingsIcon size={16} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 sm:p-2 md:p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 w-full max-w-md mx-1 sm:mx-2 md:mx-0 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Timer Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={16} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Timer Mode */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Timer Mode
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => onModeChange('countdown')}
                    className={`flex-1 p-1.5 sm:p-2 rounded text-xs font-medium transition-colors ${
                      currentMode === 'countdown'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Countdown
                  </button>
                  <button
                    onClick={() => onModeChange('stopwatch')}
                    className={`flex-1 p-1.5 sm:p-2 rounded text-xs font-medium transition-colors ${
                      currentMode === 'stopwatch'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Stopwatch
                  </button>
                </div>
              </div>

              {/* Default Timer Settings */}
              {currentMode === 'countdown' && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Set Default Timer
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue="5"
                        className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder="MM"
                        id="settings-minutes"
                      />
                      <span className="text-gray-400">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        defaultValue="00"
                        className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder="SS"
                        id="settings-seconds"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Timer label (optional)"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      id="settings-label"
                      maxLength={20}
                    />
                    <button
                      onClick={handleSetDefaultTimer}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-sm"
                    >
                      Set as Default
                    </button>
                    <p className="text-xs text-gray-400">*Minutes convert to hour(s) at 60min</p>
                  </div>
                </div>
              )}

              {/* Warning Thresholds */}
              {currentMode === 'countdown' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Warning Threshold (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.warningThreshold}
                      onChange={(e) => onSettingsChange({
                        ...settings,
                        warningThreshold: Math.max(0, parseInt(e.target.value, 10) || 0)
                      })}
                      className="w-full p-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">Timer turns yellow when time remaining is below this value</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Danger Threshold (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.dangerThreshold}
                      onChange={(e) => onSettingsChange({
                        ...settings,
                        dangerThreshold: Math.max(0, parseInt(e.target.value, 10) || 0)
                      })}
                      className="w-full p-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-1"
                  />
                  <span className="text-xs text-gray-300">Show milliseconds</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showHours}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      showHours: e.target.checked
                    })}
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-1"
                  />
                  <span className="text-xs text-gray-300">Always show hours (HH:MM:SS)</span>
                </label>
              </div>

              {/* Overtime */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!settings.allowOvertime}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      allowOvertime: e.target.checked
                    })}
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-1"
                  />
                  <span className="text-xs text-gray-300">Allow overtime (go below 0)</span>
                </label>
              </div>

              {/* Sounds */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!settings.soundsEnabled}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      soundsEnabled: e.target.checked
                    })}
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-1"
                  />
                  <span className="text-xs text-gray-300">Sounds: start, warning, end</span>
                </label>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 md:mt-6 pt-2 sm:pt-3 md:pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                Changes are automatically saved
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};