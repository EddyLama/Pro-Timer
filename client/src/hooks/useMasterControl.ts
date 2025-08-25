import { useState, useEffect, useCallback } from 'react';
import { TimerState, TimerSettings } from '../types/timer';
import { MasterService } from '../services/MasterService';

export const useMasterControl = (initialSettings: TimerSettings) => {
  const [timer, setTimer] = useState<TimerState>({
    currentTime: 0,
    initialTime: 0,
    isRunning: false,
    mode: 'countdown'
  });

  const [settings, setSettings] = useState<TimerSettings>(initialSettings);
  const [masterService] = useState(() => new MasterService());
  const [connectedClients, setConnectedClients] = useState<string[]>([]);

  // Local timer update loop for master display
  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (!prev.isRunning) return prev;

        let newTime: number;
        if (prev.mode === 'countdown') {
          newTime = Math.max(0, prev.currentTime - 0.1);
          if (newTime <= 0) {
            // Timer finished, stop and notify clients
            masterService.stopTimer();
            return { ...prev, currentTime: 0, isRunning: false };
          }
        } else {
          newTime = prev.currentTime + 0.1;
        }

        // Update master service state
        const masterState = masterService.getState();
        masterState.globalTimer.currentTime = newTime;

        return { ...prev, currentTime: newTime };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timer.isRunning, masterService]);

  // Periodically update connected clients list
  useEffect(() => {
    const interval = setInterval(() => {
      const clients = masterService.getConnectedClients();
      setConnectedClients(clients.map(client => client.screenId));
    }, 1000);

    return () => clearInterval(interval);
  }, [masterService]);

  const startTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: true }));
    masterService.startTimer();
  }, [masterService]);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: false }));
    masterService.pauseTimer();
  }, [masterService]);

  const stopTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      currentTime: prev.mode === 'countdown' ? prev.initialTime : 0
    }));
    masterService.stopTimer();
  }, [masterService]);

  const resetTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      currentTime: prev.mode === 'countdown' ? prev.initialTime : 0
    }));
    masterService.resetTimer();
  }, [masterService]);

  const setTime = useCallback((seconds: number) => {
    setTimer(prev => ({
      ...prev,
      currentTime: seconds,
      initialTime: seconds,
      isRunning: false
    }));
    masterService.setTime(seconds);
  }, [masterService]);

  const setMode = useCallback((mode: 'countdown' | 'stopwatch') => {
    setTimer(prev => ({
      ...prev,
      mode,
      isRunning: false,
      currentTime: mode === 'countdown' ? prev.initialTime : 0
    }));
    masterService.setMode(mode);
  }, [masterService]);

  const sendMessage = useCallback((screenId: string, message: string) => {
    masterService.showMessage(screenId, message);
  }, [masterService]);

  const hideMessage = useCallback((screenId: string) => {
    masterService.hideMessage(screenId);
  }, [masterService]);

  const showElement = useCallback((screenId: string, elementId: string) => {
    masterService.showElement(screenId, elementId);
  }, [masterService]);

  const hideElement = useCallback((screenId: string, elementId: string) => {
    masterService.hideElement(screenId, elementId);
  }, [masterService]);

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

  return {
    timer,
    settings,
    setSettings,
    connectedClients,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setTime,
    setMode,
    sendMessage,
    hideMessage,
    showElement,
    hideElement,
    getTimerColor,
    masterService
  };
};