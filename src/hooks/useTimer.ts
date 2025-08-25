import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, TimerSettings } from '../types/timer';

export const useTimer = (initialSettings: TimerSettings) => {
  const [timer, setTimer] = useState<TimerState>({
    currentTime: 0,
    initialTime: 0,
    isRunning: false,
    mode: 'countdown'
  });

  const [settings, setSettings] = useState<TimerSettings>(initialSettings);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  const updateTimer = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    setTimer(prev => {
      if (!prev.isRunning) return prev;

      let newTime: number;
      
      if (prev.mode === 'countdown') {
        newTime = Math.max(0, prev.currentTime - deltaTime);
        
        // Auto-stop when countdown reaches zero
        if (newTime <= 0) {
          return {
            ...prev,
            currentTime: 0,
            isRunning: false
          };
        }
      } else {
        // Stopwatch mode
        newTime = prev.currentTime + deltaTime;
      }

      return {
        ...prev,
        currentTime: newTime
      };
    });
  }, []);

  useEffect(() => {
    if (timer.isRunning) {
      lastUpdateRef.current = Date.now();
      intervalRef.current = setInterval(updateTimer, 16); // ~60fps updates
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, updateTimer]);

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
    getTimerColor
  };
};