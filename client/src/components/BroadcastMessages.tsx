import React, { useState } from 'react';
import { Send, MessageSquare, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

interface BroadcastMessagesProps {
  connectedClients: string[];
  onSendMessage: (screenId: string, message: string) => void;
  onHideMessage: (screenId: string) => void;
}

interface SentMessage {
  id: string;
  screenIds: string[];
  message: string;
  isVisible: boolean;
  isEditing: boolean;
}

export const BroadcastMessages: React.FC<BroadcastMessagesProps> = ({
  connectedClients,
  onSendMessage,
  onHideMessage
}) => {
  const [selectedScreen, setSelectedScreen] = useState('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [endCaption, setEndCaption] = useState('TIME IS UP!');
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);

  const handleSendBroadcast = () => {
    if (broadcastMessage.trim()) {
      onSendMessage(selectedScreen, broadcastMessage.trim());
      
      // Add to sent messages list
      const newMessage: SentMessage = {
        id: Date.now().toString(),
        screenIds: selectedScreen === 'all' ? connectedClients : [selectedScreen],
        message: broadcastMessage.trim(),
        isVisible: true,
        isEditing: false
      };
      
      setSentMessages(prev => [newMessage, ...prev]);
      setBroadcastMessage('');
    }
  };

  const handleSetEndCaption = () => {
    if (endCaption.trim()) {
      // This would be stored and shown when timer reaches zero
      console.log('End caption set:', endCaption);
    }
  };

  const handleToggleMessageVisibility = (messageId: string) => {
    setSentMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newVisibility = !msg.isVisible;
        // Update visibility on server
        msg.screenIds.forEach(screenId => {
          if (newVisibility) {
            onSendMessage(screenId, msg.message);
          } else {
            onHideMessage(screenId);
          }
        });
        return { ...msg, isVisible: newVisibility };
      }
      return msg;
    }));
  };

  const handleEditMessage = (messageId: string) => {
    setSentMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isEditing: true } : msg
    ));
  };

  const handleSaveEdit = (messageId: string, newMessage: string) => {
    if (newMessage.trim()) {
      setSentMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          // Update message on server
          msg.screenIds.forEach(screenId => {
            onSendMessage(screenId, newMessage.trim());
          });
          return { ...msg, message: newMessage.trim(), isEditing: false };
        }
        return msg;
      }));
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const message = sentMessages.find(msg => msg.id === messageId);
    if (message) {
      // Hide message on all screens
      message.screenIds.forEach(screenId => {
        onHideMessage(screenId);
      });
      setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const formatScreenIds = (screenIds: string[]) => {
    if (screenIds.length === 1) {
      return `scrn${screenIds[0].replace('screen_', '')}`;
    }
    return screenIds.map(id => `scrn${id.replace('screen_', '')}`).join(', ');
  };

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Broadcast Messages</h3>
      </div>

      <div className="space-y-4">
        {/* Broadcast Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Broadcast Message
          </label>
          <div className="flex gap-2 mb-2">
            <select
              value={selectedScreen}
              onChange={(e) => setSelectedScreen(e.target.value)}
              className="p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Screens</option>
              {connectedClients.map(clientId => (
                <option key={clientId} value={clientId}>{clientId}</option>
              ))}
            </select>
            <button
              onClick={() => onHideMessage(selectedScreen)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Hide
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter broadcast message..."
              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSendBroadcast()}
            />
            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastMessage.trim()}
              className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Live Messages */}
        {sentMessages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Live Messages:
            </label>
            <div className="space-y-2">
              {sentMessages.map((sentMsg) => (
                <div key={sentMsg.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-xs text-gray-400 mb-1">
                    {formatScreenIds(sentMsg.screenIds)}
                  </div>
                  <div className="flex items-center gap-2">
                    {sentMsg.isEditing ? (
                      <input
                        type="text"
                        defaultValue={sentMsg.message}
                        className="flex-1 p-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(sentMsg.id, e.currentTarget.value);
                          }
                        }}
                        onBlur={(e) => handleSaveEdit(sentMsg.id, e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span className={`flex-1 text-sm ${sentMsg.isVisible ? 'text-white' : 'text-gray-400'}`}>
                        {sentMsg.message}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleMessageVisibility(sentMsg.id)}
                        className={`p-1 rounded transition-colors ${
                          sentMsg.isVisible 
                            ? 'text-green-400 hover:text-green-300' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        title={sentMsg.isVisible ? 'Hide message' : 'Show message'}
                      >
                        {sentMsg.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => sentMsg.isEditing 
                          ? handleSaveEdit(sentMsg.id, sentMsg.message)
                          : handleEditMessage(sentMsg.id)
                        }
                        className="p-1 text-blue-400 hover:text-blue-300 rounded transition-colors"
                        title={sentMsg.isEditing ? 'Save changes' : 'Edit message'}
                      >
                        {sentMsg.isEditing ? <Send size={14} /> : <Edit size={14} />}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(sentMsg.id)}
                        className="p-1 text-red-400 hover:text-red-300 rounded transition-colors"
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* End Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Caption (shown when timer reaches zero)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={endCaption}
              onChange={(e) => setEndCaption(e.target.value)}
              placeholder="Enter end caption..."
              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSetEndCaption}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
