import { useState, useEffect, useCallback } from 'react';
import { TimerState, TimerSettings } from '../types/timer';
import { NetworkService } from '../services/NetworkService';
import { NetworkMessage } from '../types/network';

export const useNetworkTimer = (screenId: string, initialSettings: TimerSettings) => {
  const [timer, setTimer] = useState<TimerState>({
    currentTime: 0,
    initialTime: 0,
    isRunning: false,
    mode: 'countdown'
  });

  const [settings, setSettings] = useState<TimerSettings>(initialSettings);
  const [networkService] = useState(() => new NetworkService());
  const [isConnected, setIsConnected] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string>('');
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  // Initialize network connection
  useEffect(() => {
    const initNetwork = async () => {
      try {
        await networkService.connect(screenId);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to master:', error);
        setIsConnected(false);
      }
    };

    initNetwork();

    // Setup message handlers
    networkService.onMessage('start_timer', (message: NetworkMessage) => {
      if (message.timer_state) {
        setTimer(prev => ({ ...prev, ...message.timer_state, isRunning: true }));
      }
    });

    networkService.onMessage('pause_timer', (message: NetworkMessage) => {
      if (message.timer_state) {
        setTimer(prev => ({ ...prev, ...message.timer_state, isRunning: false }));
      }
    });

    networkService.onMessage('stop_timer', (message: NetworkMessage) => {
      if (message.timer_state) {
        setTimer(prev => ({ ...prev, ...message.timer_state, isRunning: false }));
      }
    });

    networkService.onMessage('reset_timer', (message: NetworkMessage) => {
      if (message.timer_state) {
        setTimer(prev => ({ ...prev, ...message.timer_state, isRunning: false }));
      }
    });

    networkService.onMessage('update_time', (message: NetworkMessage) => {
      if (message.timer_state) {
        setTimer(prev => ({ ...prev, ...message.timer_state }));
      }
    });

    networkService.onMessage('set_mode', (message: NetworkMessage) => {
      if (message.timer_state && message.timer_mode) {
        setTimer(prev => ({ ...prev, ...message.timer_state, mode: message.timer_mode! }));
      }
    });

    networkService.onMessage('show_message', (message: NetworkMessage) => {
      if (message.message) {
        setDisplayMessage(message.message);
      }
    });

    networkService.onMessage('hide_message', () => {
      setDisplayMessage('');
    });

    networkService.onMessage('show_element', (message: NetworkMessage) => {
      if (message.visible_element) {
        setVisibleElements(prev => new Set([...Array.from(prev), message.visible_element!]));
      }
    });

    networkService.onMessage('hide_element', (message: NetworkMessage) => {
      if (message.visible_element) {
        setVisibleElements(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(message.visible_element!);
          return newSet;
        });
      }
    });

    networkService.onMessage('sync_state', (message: NetworkMessage) => {
      if (message.timer_state) {
        setTimer(prev => ({ ...prev, ...message.timer_state }));
      }
    });

    networkService.onMessage('initial_state', (message: NetworkMessage) => {
      if (message.timer_state) {
        setTimer(prev => ({ ...prev, ...message.timer_state }));
      }
    });

    networkService.onMessage('pong', () => {
      // Pong is handled automatically, no action needed
    });

    networkService.onConnectionChange(setIsConnected);

    return () => {
      networkService.disconnect();
    };
  }, [screenId, networkService]);

  // Local timer update loop (for smooth display)
  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (!prev.isRunning) return prev;

        let newTime: number;
        if (prev.mode === 'countdown') {
          newTime = Math.max(0, prev.currentTime - 0.1);
          if (newTime <= 0) {
            return { ...prev, currentTime: 0, isRunning: false };
          }
        } else {
          newTime = prev.currentTime + 0.1;
        }

        return { ...prev, currentTime: newTime };
      });
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(interval);
  }, [timer.isRunning]);

  const getTimerColor = useCallback((): string => {
    if (timer.mode === 'stopwatch') return 'text-blue-400';
    
    const timeLeft = timer.currentTime;
    
    if (timeLeft <= settings.dangerThreshold) {
      return 'text-red-400';
    } else if (timeLeft <= settings.warningThreshold) {
      return 'text-yellow-400';
    }
    
    return 'text-green-400';
  }, [timer.currentTime, timer.mode, settings.dangerThreshold, settings.warningThreshold]);

  const isElementVisible = useCallback((elementId: string): boolean => {
    return visibleElements.has(elementId);
  }, [visibleElements]);

  return {
    timer,
    settings,
    setSettings,
    isConnected,
    displayMessage,
    getTimerColor,
    isElementVisible,
    networkService
  };
};