import { useState, useEffect, useCallback } from 'react';
import { playStartSound, playWarnSound, playEndSound, playCountdownSequence } from '../utils/sound';
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
          newTime = prev.currentTime - 0.01;
          
          // Only stop if overtime is not allowed and we hit 0
          if (newTime <= 0 && !settings.allowOvertime) {
            newTime = 0;
            // Timer finished, stop and notify clients
            masterService.stopTimer();
            if (settings.soundsEnabled) {
              playEndSound();
            }
            return { ...prev, currentTime: 0, isRunning: false };
          }
        } else {
          newTime = prev.currentTime + 0.01;
        }

        // Broadcast timer updates to all clients every 100ms for smooth milliseconds
        if (Math.floor(newTime * 100) % 10 === 0) {
          masterService.syncTimerState(newTime, prev.initialTime, true, prev.mode);
        }

        // Play warning sound once when crossing thresholds
        if (settings.soundsEnabled && prev.mode === 'countdown') {
          const justCrossedDanger = prev.currentTime > settings.dangerThreshold && newTime <= settings.dangerThreshold;
          const justCrossedWarning = prev.currentTime > settings.warningThreshold && newTime <= settings.warningThreshold;
          if (justCrossedDanger || justCrossedWarning) {
            playWarnSound();
          }
        }

        return { ...prev, currentTime: newTime };
      });
    }, 10);

    return () => clearInterval(interval);
  }, [timer.isRunning, masterService, settings.soundsEnabled, settings.warningThreshold, settings.dangerThreshold, settings.allowOvertime]);

  // Periodically update connected clients list
  useEffect(() => {
    const interval = setInterval(() => {
      const clients = masterService.getConnectedClients();
      const ids = clients.map(client => client.screenId);
      // Deduplicate screens
      setConnectedClients(Array.from(new Set(ids)));
    }, 1000);

    return () => clearInterval(interval);
  }, [masterService]);

  const startTimer = useCallback(async () => {
    // Start 3-second countdown with beeps
    if (settings.soundsEnabled) {
      playCountdownSequence();
    }
    
    // Wait 3 seconds before actually starting
    setTimeout(() => {
      setTimer(prev => ({ ...prev, isRunning: true }));
      if (settings.soundsEnabled) {
        playStartSound();
      }
      masterService.startTimer();
    }, 3000);
  }, [masterService, settings.soundsEnabled]);

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
    if (settings.soundsEnabled) {
      playEndSound();
    }
  }, [masterService, settings.soundsEnabled]);

  const resetTimer = useCallback(async () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      currentTime: prev.mode === 'countdown' ? prev.initialTime : 0
    }));
    await masterService.resetTimer();
  }, [masterService]);

  const setTime = useCallback(async (seconds: number, label?: string) => {
    setTimer(prev => ({
      ...prev,
      currentTime: seconds,
      initialTime: seconds,
      isRunning: false
    }));
    await masterService.setTime(seconds, label);
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