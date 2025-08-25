import React from 'react';

interface MessageOverlayProps {
  message: string;
  isVisible: boolean;
}

export const MessageOverlay: React.FC<MessageOverlayProps> = ({ message, isVisible }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-4 border border-gray-700 shadow-2xl">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-4">
            {message}
          </div>
          <div className="text-sm text-gray-400">
            Broadcast Message
          </div>
        </div>
      </div>
    </div>
  );
};