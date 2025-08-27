import React, { useState, useEffect } from 'react';
import { useNetworkTimer } from '../hooks/useNetworkTimer';

interface NetworkMonitorProps {
  screenId: string;
}

interface ClientInfo {
  id: string;
  screenId: string;
  connected: boolean;
  lastPing: number;
  connectionTime: number;
  latency: number;
  status: 'healthy' | 'unresponsive';
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ screenId }) => {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showDetails, setShowDetails] = useState(false);

  const fetchClientStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch client status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServerHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setServerHealth(data);
    } catch (error) {
      console.error('Failed to fetch server health:', error);
    }
  };

  const checkLatency = async (targetScreenId: string) => {
    try {
      const response = await fetch('/api/diagnostics/latency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId: targetScreenId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to check latency:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchClientStatus();
    fetchServerHealth();
    
    const interval = setInterval(() => {
      fetchClientStatus();
      fetchServerHealth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'unresponsive': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 1000) return 'text-green-500';
    if (latency < 5000) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Network Monitor</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {serverHealth && (
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h4 className="font-semibold mb-2">Server Health</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 ${serverHealth.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
                {serverHealth.status}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Clients:</span>
              <span className="ml-2">{serverHealth.clients.connected}/{serverHealth.clients.total}</span>
            </div>
            <div>
              <span className="text-gray-400">Uptime:</span>
              <span className="ml-2">{Math.floor(serverHealth.uptime)}s</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Connected Clients ({clients.length})</h4>
          <button
            onClick={fetchClientStatus}
            disabled={isLoading}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="text-xs text-gray-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {clients.map((client) => (
            <div key={client.id} className="p-3 bg-gray-800 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{client.screenId}</div>
                  <div className="text-xs text-gray-400">
                    Connected: {new Date(client.connectionTime).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(client.status)}`}>
                    {client.status}
                  </div>
                  <div className={`text-xs ${getLatencyColor(client.latency)}`}>
                    {client.latency}ms
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {clients.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No clients connected
            </div>
          )}
        </div>
      )}
    </div>
  );
};