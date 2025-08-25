import { useState, useEffect, useCallback } from 'react';
import { TimerState, TimerSettings } from '../types/timer';
import { MasterService } from '../services/MasterService';
import { StaticMasterService } from '../services/StaticMasterService';

export const useMasterControl = (initialSettings: TimerSettings) => {
  const [timer, setTimer] = useState<TimerState>({
    currentTime: 0,
    initialTime: 0,
    isRunning: false,
    mode: 'countdown'
  });

  const [settings, setSettings] = useState<TimerSettings>(initialSettings);
  // Use static service for Netlify deployment (no backend)
  const isStatic = !window.location.host.includes('localhost') && !window.location.host.includes('replit');
  const [masterService] = useState(() => isStatic ? new StaticMasterService() : new MasterService());
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
    if (isStatic) {
      // For static deployment, show demo clients
      setConnectedClients(['demo_screen_1', 'demo_screen_2']);
      return;
    }

    const interval = setInterval(() => {
      const clients = masterService.getConnectedClients();
      setConnectedClients(clients.map(client => client.screenId));
    }, 1000);

    return () => clearInterval(interval);
  }, [masterService, isStatic]);

  const startTimer = useCallback(async () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
    await masterService.startTimer();
  }, [masterService]);

  const pauseTimer = useCallback(async () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
    await masterService.pauseTimer();
  }, [masterService]);

  const stopTimer = useCallback(async () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      currentTime: prev.mode === 'countdown' ? prev.initialTime : 0
    }));
    await masterService.stopTimer();
  }, [masterService]);

  const resetTimer = useCallback(async () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      currentTime: prev.mode === 'countdown' ? prev.initialTime : 0
    }));
    await masterService.resetTimer();
  }, [masterService]);

  const setTime = useCallback(async (seconds: number) => {
    setTimer(prev => ({
      ...prev,
      currentTime: seconds,
      initialTime: seconds,
      isRunning: false
    }));
    await masterService.setTime(seconds);
  }, [masterService]);

  const setMode = useCallback(async (mode: 'countdown' | 'stopwatch') => {
    setTimer(prev => ({
      ...prev,
      mode,
      isRunning: false,
      currentTime: mode === 'countdown' ? prev.initialTime : 0
    }));
    await masterService.setMode(mode);
  }, [masterService]);

  const sendMessage = useCallback(async (screenId: string, message: string) => {
    await masterService.showMessage(screenId, message);
  }, [masterService]);

  const hideMessage = useCallback(async (screenId: string) => {
    await masterService.hideMessage(screenId);
  }, [masterService]);

  const showElement = useCallback(async (screenId: string, elementId: string) => {
    await masterService.showElement(screenId, elementId);
  }, [masterService]);

  const hideElement = useCallback(async (screenId: string, elementId: string) => {
    await masterService.hideElement(screenId, elementId);
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