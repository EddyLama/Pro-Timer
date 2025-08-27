import React, { useState, useEffect } from 'react';

interface SyncStatusProps {
  isConnected: boolean;
  screenId: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ isConnected, screenId }) => {
  const [latency, setLatency] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);

  const checkLatency = async () => {
    if (!isConnected) return;
    
    setIsChecking(true);
    try {
      const response = await fetch('/api/diagnostics/latency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId })
      });
      const data = await response.json();
      setLatency(data.latency);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to check latency:', error);
      setLatency(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      checkLatency();
      const interval = setInterval(checkLatency, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, screenId]);

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    if (latency === null) return 'text-yellow-500';
    if (latency < 1000) return 'text-green-500';
    if (latency < 5000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (latency === null) return 'Checking...';
    if (latency < 1000) return 'Synced';
    if (latency < 5000) return 'Slow';
    return 'Laggy';
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className={`${getStatusColor()}`}>{getStatusText()}</span>
      {latency !== null && (
        <span className="text-gray-400">
          ({latency}ms)
        </span>
      )}
      {isChecking && (
        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
};