import React, { useEffect, useRef } from 'react';
import { formatTime } from '../utils/timeFormat';
import { TimerState, TimerSettings } from '../types/timer';
import { SyncStatus } from './SyncStatus';

interface TimerProps {
  timer: TimerState;
  settings: TimerSettings;
  getTimerColor: () => string;
  fullscreen?: boolean;
  showProgress?: boolean;
  isConnected?: boolean;
  screenId?: string;
  isElementVisible?: (elementId: string) => boolean;
  timerLabel?: string;
}

export const Timer: React.FC<TimerProps> = ({
  timer,
  settings,
  getTimerColor,
  fullscreen = false,
  showProgress = true,
  isConnected = false,
  screenId = '',
  isElementVisible = () => true,
  timerLabel = ''
}) => {
  const hasBeepedRef = useRef(false);
  const prevTimeRef = useRef(timer.currentTime);

  useEffect(() => {
    const createBeep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      // 3-second beep with fade out
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 3);
    };

    // Beep when countdown reaches 0
    if (timer.mode === 'countdown' &&
        timer.currentTime <= 0 &&
        prevTimeRef.current > 0 &&
        !hasBeepedRef.current) {
      createBeep();
      hasBeepedRef.current = true;
    }

    // Reset beep flag when timer starts
    if (timer.currentTime > 0) {
      hasBeepedRef.current = false;
    }

    prevTimeRef.current = timer.currentTime;
  }, [timer.currentTime, timer.mode]);

  return (
    <div className={`flex flex-col items-center justify-center ${fullscreen ? 'p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12' : 'p-2 sm:p-4 md:p-6 lg:p-8'}`}>
      <div className="text-center mb-2 sm:mb-4 md:mb-6">
        <div className={`font-medium text-gray-400 uppercase tracking-wider ${
          fullscreen ? 'text-base sm:text-lg md:text-xl lg:text-2xl' : 'text-xs sm:text-sm md:text-base lg:text-lg'
        }`}>
          {timerLabel || (timer.mode === 'countdown' ? 'Countdown Timer' : 'Stopwatch')}
        </div>
        {screenId && (
          <div className="mt-1">
            <SyncStatus isConnected={isConnected} screenId={screenId} />
          </div>
        )}
      </div>
      
      <div className={`font-digital font-bold ${getTimerColor()} transition-colors duration-200 leading-none flex items-baseline justify-center ${
        fullscreen
          ? 'text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem]'
          : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl tracking-tighter'
      }`}>
        <span dangerouslySetInnerHTML={{
          __html: formatTime(timer.currentTime, settings.showMilliseconds, settings.showHours)
            .replace(/:/g, '<span class="mx-0.5">:</span>')
            .replace(/\.(\d{2})$/, '<span class="text-[0.25em] leading-none ml-0.5">.$1</span>')
        }} />
        {timer.currentTime < 0 && (
          <span className={`text-red-500 ml-2 md:ml-3 lg:ml-4 ${
            fullscreen
              ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
              : 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
          }`}>
            OVERTIME
          </span>
        )}
      </div>
      
      {showProgress && timer.mode === 'countdown' && timer.initialTime > 0 && isElementVisible('progress') && (
        <div className={`mt-2 sm:mt-4 md:mt-6 w-full ${fullscreen ? 'max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl' : 'max-w-xs sm:max-w-sm md:max-w-md'}`}>
          <div className={`text-gray-400 mb-1 sm:mb-2 text-center ${
            fullscreen ? 'text-xs sm:text-sm md:text-base lg:text-lg' : 'text-xs sm:text-sm md:text-base'
          }`}>
            Progress: {Math.round((1 - Math.max(0, Math.min(timer.initialTime, timer.currentTime)) / timer.initialTime) * 100)}%
          </div>
          <div className={`w-full bg-gray-700 rounded-full ${fullscreen ? 'h-1 sm:h-2 md:h-3' : 'h-1 sm:h-2'}`}>
            <div
              className={`${fullscreen ? 'h-1 sm:h-2 md:h-3' : 'h-1 sm:h-2'} rounded-full transition-all duration-200 ${
                timer.currentTime <= settings.dangerThreshold
                  ? 'bg-red-400'
                  : timer.currentTime <= settings.warningThreshold
                  ? 'bg-yellow-400'
                  : 'bg-green-400'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, (1 - Math.max(0, Math.min(timer.initialTime, timer.currentTime)) / timer.initialTime) * 100))}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Timer Controls removed - presets are now handled by the Presets component */}
    </div>
  );
};