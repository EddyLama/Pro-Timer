import React, { useState } from 'react';
import { Send, Eye, EyeOff, MessageSquare, X } from 'lucide-react';

interface MasterControlsProps {
  connectedClients: string[];
  onSendMessage: (screenId: string, message: string) => void;
  onHideMessage: (screenId: string) => void;
  onShowElement: (screenId: string, elementId: string) => void;
  onHideElement: (screenId: string, elementId: string) => void;
}

export const MasterControls: React.FC<MasterControlsProps> = ({
  connectedClients,
  onSendMessage,
  onHideMessage,
  onShowElement,
  onHideElement
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState('all');
  const [message, setMessage] = useState('');
  const [selectedElement, setSelectedElement] = useState('timer');

  const availableElements = [
    { id: 'timer', label: 'Timer Display' },
    { id: 'controls', label: 'Control Panel' },
    { id: 'presets', label: 'Preset Buttons' },
    { id: 'progress', label: 'Progress Bar' },
    { id: 'header', label: 'Header' },
    { id: 'footer', label: 'Footer' }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(selectedScreen, message.trim());
      setMessage('');
    }
  };

  const handleHideMessage = () => {
    onHideMessage(selectedScreen);
  };

  const handleShowElement = () => {
    onShowElement(selectedScreen, selectedElement);
  };

  const handleHideElement = () => {
    onHideElement(selectedScreen, selectedElement);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg transition-colors duration-200"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 border border-gray-700 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Master Controls</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
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

      {/* Message Controls */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Broadcast Message
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <button
          onClick={handleHideMessage}
          className="mt-2 w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
        >
          Hide Messages
        </button>
      </div>

      {/* Element Visibility Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Element Control
        </label>
        <select
          value={selectedElement}
          onChange={(e) => setSelectedElement(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
        >
          {availableElements.map(element => (
            <option key={element.id} value={element.id}>{element.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleShowElement}
            className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
          >
            <Eye size={14} />
            Show
          </button>
          <button
            onClick={handleHideElement}
            className="flex-1 p-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
          >
            <EyeOff size={14} />
            Hide
          </button>
        </div>
      </div>
    </div>
  );
};