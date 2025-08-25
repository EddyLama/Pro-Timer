import { useState, useEffect, useCallback } from 'react';
import { TimerState, TimerSettings } from '../types/timer';

export const useStandaloneTimer = (initialSettings: TimerSettings) => {
  const [timer, setTimer] = useState<TimerState>({
    currentTime: 0,
    initialTime: 0,
    isRunning: false,
    mode: 'countdown'
  });

  const [settings, setSettings] = useState<TimerSettings>(initialSettings);

  // Timer update loop
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
    }, 100);

    return () => clearInterval(interval);
  }, [timer.isRunning]);

  const startTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  }, []);

  const stopTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      currentTime: prev.mode === 'countdown' ? prev.initialTime : 0
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      currentTime: prev.mode === 'countdown' ? prev.initialTime : 0
    }));
  }, []);

  const setTime = useCallback((seconds: number) => {
    setTimer(prev => ({
      ...prev,
      currentTime: seconds,
      initialTime: seconds,
      isRunning: false
    }));
  }, []);

  const setMode = useCallback((mode: 'countdown' | 'stopwatch') => {
    setTimer(prev => ({
      ...prev,
      mode,
      isRunning: false,
      currentTime: mode === 'countdown' ? prev.initialTime : 0
    }));
  }, []);

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
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setTime,
    setMode,
    getTimerColor,
    isConnected: true,
    displayMessage: '',
    isElementVisible: () => true
  };
};