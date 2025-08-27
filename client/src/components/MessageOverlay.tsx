import React from 'react';

interface MessageOverlayProps {
  message: string;
  isVisible: boolean;
}

export const MessageOverlay: React.FC<MessageOverlayProps> = ({ message, isVisible }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="w-full mt-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl p-4 md:p-5 border border-gray-700 bg-gray-800/70">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-semibold text-white">
              {message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};