import React, { useState, useEffect } from 'react';
import { useNetworkTimer } from './hooks/useNetworkTimer';
import { useMasterControl } from './hooks/useMasterControl';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { Presets } from './components/Presets';
import { Settings } from './components/Settings';
import { NetworkStatus } from './components/NetworkStatus';
import { MasterControls } from './components/MasterControls';
import { MessageOverlay } from './components/MessageOverlay';
import { LapTimes } from './components/LapTimes';
import { TimerSettings } from './types/timer';
import { BroadcastMessages } from './components/BroadcastMessages';
import { loadSettings, saveSettings } from './utils/storage';

const defaultSettings: TimerSettings = {
  warningThreshold: 60, // 1 minute
  dangerThreshold: 30,  // 30 seconds
  showMilliseconds: false,
  showHours: false,
  autoReset: false,
  allowOvertime: true,
  soundsEnabled: true
};

// Determine if this is master or client mode based on URL params
const urlParams = new URLSearchParams(window.location.search);
const isMaster = urlParams.get('mode') === 'master' || urlParams.get('mode') === null;
const screenId = urlParams.get('screenId') || 'screen_1';

function App() {
  const [lapTimes, setLapTimes] = useState<Array<{ lapNumber: number; time: number; splitTime: number }>>([]);
  const [lastLapTime, setLastLapTime] = useState(0);
  
  // Load saved settings
  const [initialSettings] = useState(() => {
    const savedSettings = loadSettings();
    return savedSettings || defaultSettings;
  });
  
  // Use different hooks based on mode
  const masterControl = isMaster ? useMasterControl(initialSettings) : null;
  const networkTimer = !isMaster ? useNetworkTimer(screenId, initialSettings) : null;

  // Extract common interface
  const timer = isMaster ? masterControl!.timer : networkTimer!.timer;
  const settings = isMaster ? masterControl!.settings : networkTimer!.settings;
  const setSettings = isMaster ? masterControl!.setSettings : networkTimer!.setSettings;
  const getTimerColor = isMaster ? masterControl!.getTimerColor : networkTimer!.getTimerColor;
  const showProgress = isMaster ? true : true;
  
  // Master-only functions
  const startTimer = isMaster ? masterControl!.startTimer : () => {};
  const pauseTimer = isMaster ? masterControl!.pauseTimer : () => {};
  const stopTimer = isMaster ? masterControl!.stopTimer : () => {};
  const resetTimer = isMaster ? masterControl!.resetTimer : () => {};
  const setTime = isMaster ? masterControl!.setTime : () => {};
  const setMode = isMaster ? masterControl!.setMode : () => {};

  // Save settings when they change
  useEffect(() => {
    if (settings) {
      saveSettings(settings);
    }
  }, [settings]);
  
  const handleLap = () => {
    if (isMaster && timer.mode === 'stopwatch' && timer.isRunning) {
      const lapNumber = lapTimes.length + 1;
      const currentTime = timer.currentTime;
      const splitTime = currentTime - lastLapTime;
      
      setLapTimes(prev => [...prev, { lapNumber, time: currentTime, splitTime }]);
      setLastLapTime(currentTime);
    }
  };

  const clearLaps = () => {
    setLapTimes([]);
    setLastLapTime(0);
  };

  const handleReset = () => {
    resetTimer();
    clearLaps();
  };

  // Network status
  const isConnected = isMaster ? true : networkTimer!.isConnected;
  const connectedClients = isMaster ? masterControl!.connectedClients : [];
  const displayMessage = !isMaster ? networkTimer!.displayMessage : '';
  const isElementVisible = !isMaster ? networkTimer!.isElementVisible : () => true;
  const timerLabel = !isMaster ? networkTimer!.timerLabel : '';

  // CLIENT MODE - Full screen timer only
  if (!isMaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center">
        {/* Connection Status for Clients */}
        <NetworkStatus 
          isConnected={isConnected}
          isMaster={false}
          screenId={screenId}
          position="top-right"
        />

        {/* Full Screen Timer */}
        <div className="w-full h-full flex items-center justify-center p-6 md:p-8">
          <div className="text-center">
            <Timer
              timer={timer}
              settings={settings}
              getTimerColor={getTimerColor}
              fullscreen={true}
              showProgress={true}
              isElementVisible={isElementVisible}
              timerLabel={timerLabel}
            />
          </div>
        </div>

        {/* Message displayed under timer */}
        {displayMessage && (
          <div className="w-full flex items-center justify-center px-6 mb-8">
            <MessageOverlay
              message={displayMessage}
              isVisible={true}
            />
          </div>
        )}
      </div>
    );
  }

  // MASTER MODE - Full control interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="p-2 sm:p-3 md:p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">ST</span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Stage Timer Pro
              </h1>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 text-center mt-1">
            Master Control Station
          </div>
        </div>
      </header>

      {/* Network Status */}
      <NetworkStatus
        isConnected={isConnected}
        connectedClients={connectedClients}
        isMaster={isMaster}
      />

      {/* Main Content - Two Columns */}
      <main className="flex-1 px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Left Column: Clock, Timer, Controls, Presets */}
          <section className="space-y-2 sm:space-y-3 md:space-y-4">
            {/* Clock */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center">
              <span className="font-digital text-sm sm:text-base md:text-lg text-gray-300">
                CLOCK: {new Date().toLocaleTimeString()}
              </span>
            </div>
            
            {/* Timer */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl">
              <Timer
                timer={timer}
                settings={settings}
                getTimerColor={getTimerColor}
                isElementVisible={isElementVisible}
                timerLabel={timerLabel}
              />
            </div>
            
            {/* Controls */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl">
              <Controls
                timer={timer}
                onStart={startTimer}
                onPause={pauseTimer}
                onStop={stopTimer}
                onReset={handleReset}
                onLap={handleLap}
              />
            </div>
            
            {/* Presets and Custom Time */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl">
              <Presets
                onSelectPreset={setTime}
                currentMode={timer.mode}
              />
            </div>

            {/* Lap Times */}
            {timer.mode === 'stopwatch' && (
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl">
                <LapTimes
                  lapTimes={lapTimes}
                  onClear={clearLaps}
                />
              </div>
            )}
          </section>

          {/* Right Column: Broadcast Messages, Element Controls */}
          <section className="space-y-2 sm:space-y-3 md:space-y-4">
            {/* Broadcast Messages */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl">
              <BroadcastMessages
                connectedClients={connectedClients}
                onSendMessage={masterControl!.sendMessage}
                onHideMessage={masterControl!.hideMessage}
              />
            </div>
            
            {/* Master Controls */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl">
              <MasterControls
                connectedClients={connectedClients}
                onShowElement={masterControl!.showElement}
                onHideElement={masterControl!.hideElement}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Settings */}
      <Settings
        settings={settings}
        onSettingsChange={setSettings}
        currentMode={timer.mode}
        onModeChange={setMode}
        onSetCustomTime={(seconds: number) => setTime(seconds)}
      />

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm border-t border-gray-700">
        <p>Designed by Ohrigina LLC ©2025, All rights reserved • v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;