import React from 'react';
import { Wifi, WifiOff, Users, Monitor } from 'lucide-react';

interface NetworkStatusProps {
  isConnected: boolean;
  connectedClients?: string[];
  isMaster?: boolean;
  screenId?: string;
  position?: 'top-left' | 'top-right';
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  isConnected, 
  connectedClients = [], 
  isMaster = false,
  screenId,
  position = 'top-left'
}) => {
  const positionClass = position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4';
  return (
    <div className={`fixed ${positionClass} bg-gray-800/90 rounded-lg p-3 border border-gray-700 shadow` }>
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi size={16} className="text-green-400" />
          ) : (
            <WifiOff size={16} className="text-red-400" />
          )}
          <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Master Mode - Show Connected Clients */}
        {isMaster && (
          <div className="flex items-center gap-2 border-l border-gray-600 pl-3">
            <Users size={16} className="text-blue-400" />
            <span className="text-sm text-gray-300">
              {Array.from(new Set(connectedClients)).length} screen{Array.from(new Set(connectedClients)).length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Client Mode - Show Screen ID */}
        {!isMaster && (
          <div className="flex items-center gap-2 border-l border-gray-600 pl-3">
            <Monitor size={16} className="text-blue-400" />
            <span className="text-sm text-gray-300">Screen{screenId ? `: ${screenId}` : ''}</span>
          </div>
        )}
      </div>

      {/* Connected Clients List (Master Only) */}
      {isMaster && connectedClients.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Connected screens</div>
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(connectedClients)).map(clientId => (
              <span 
                key={clientId}
                className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
              >
                {clientId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};