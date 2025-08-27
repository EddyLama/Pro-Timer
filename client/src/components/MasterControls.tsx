import React, { useState } from 'react';
import { Eye, EyeOff, Zap, Monitor } from 'lucide-react';

interface MasterControlsProps {
  connectedClients: string[];
  onShowElement: (screenId: string, elementId: string) => void;
  onHideElement: (screenId: string, elementId: string) => void;
}

export const MasterControls: React.FC<MasterControlsProps> = ({
  connectedClients,
  onShowElement,
  onHideElement
}) => {
  const [selectedScreen, setSelectedScreen] = useState('all');
  const [isProgressVisible, setIsProgressVisible] = useState(true);

  const toggleProgressVisibility = () => {
    if (isProgressVisible) {
      onHideElement(selectedScreen, 'progress');
    } else {
      onShowElement(selectedScreen, 'progress');
    }
    setIsProgressVisible(!isProgressVisible);
  };

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 w-full">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-blue-400" />
        <h3 className="text-base font-semibold text-white">Element Controls</h3>
      </div>

      {/* Screen Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Target Screen
        </label>
        <select
          value={selectedScreen}
          onChange={(e) => setSelectedScreen(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Screens</option>
          {connectedClients.map(clientId => (
            <option key={clientId} value={clientId}>{clientId}</option>
          ))}
        </select>
      </div>

      {/* Progress Bar Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">
              {selectedScreen === 'all' ? 'All Screens' : selectedScreen}
            </div>
            <div className="text-sm text-white font-medium">
              Progress Bar
            </div>
          </div>
          <button
            onClick={toggleProgressVisibility}
            className={`p-2 text-white rounded-lg transition-colors flex items-center gap-1 ${
              isProgressVisible
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            title={isProgressVisible ? 'Hide progress bar' : 'Show progress bar'}
          >
            {isProgressVisible ? (
              <>
                <EyeOff size={16} />
                <span className="text-xs">Hide</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span className="text-xs">Show</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};