import React from 'react';
import { useNetworkTimer } from './hooks/useNetworkTimer';
import { useMasterControl } from './hooks/useMasterControl';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { Presets } from './components/Presets';
import { Settings } from './components/Settings';
import { NetworkStatus } from './components/NetworkStatus';
import { MasterControls } from './components/MasterControls';
import { MessageOverlay } from './components/MessageOverlay';
import { TimerSettings } from './types/timer';

const initialSettings: TimerSettings = {
  warningThreshold: 60, // 1 minute
  dangerThreshold: 30,  // 30 seconds
  showMilliseconds: false,
  autoReset: false
};

// Determine if this is master or client mode based on URL params
const urlParams = new URLSearchParams(window.location.search);
const isMaster = urlParams.get('mode') === 'master' || urlParams.get('mode') === null;
const screenId = urlParams.get('screenId') || 'screen_1';

function App() {
  // Use different hooks based on mode
  const masterControl = isMaster ? useMasterControl(initialSettings) : null;
  const networkTimer = !isMaster ? useNetworkTimer(screenId, initialSettings) : null;

  // Extract common interface
  const timer = isMaster ? masterControl!.timer : networkTimer!.timer;
  const settings = isMaster ? masterControl!.settings : networkTimer!.settings;
  const setSettings = isMaster ? masterControl!.setSettings : networkTimer!.setSettings;
  const getTimerColor = isMaster ? masterControl!.getTimerColor : networkTimer!.getTimerColor;
  
  // Master-only functions
  const startTimer = isMaster ? masterControl!.startTimer : () => {};
  const pauseTimer = isMaster ? masterControl!.pauseTimer : () => {};
  const stopTimer = isMaster ? masterControl!.stopTimer : () => {};
  const resetTimer = isMaster ? masterControl!.resetTimer : () => {};
  const setTime = isMaster ? masterControl!.setTime : () => {};
  const setMode = isMaster ? masterControl!.setMode : () => {};

  // Network status
  const isConnected = isMaster ? true : networkTimer!.isConnected;
  const connectedClients = isMaster ? masterControl!.connectedClients : [];
  const displayMessage = !isMaster ? networkTimer!.displayMessage : '';
  const isElementVisible = !isMaster ? networkTimer!.isElementVisible : () => true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className={`p-4 border-b border-gray-700 ${!isMaster && !isElementVisible('header') ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Stage Timer Pro
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            {isMaster ? 'Master Control Station' : `Display Client - ${screenId}`}
          </div>
        </div>
      </header>

      {/* Network Status */}
      <NetworkStatus 
        isConnected={isConnected}
        connectedClients={connectedClients}
        isMaster={isMaster}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Timer Display */}
          <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 mb-8 ${!isMaster && !isElementVisible('timer') ? 'hidden' : ''}`}>
            <Timer 
              timer={timer} 
              settings={settings} 
              getTimerColor={getTimerColor} 
            />
          </div>

          {/* Controls */}
          <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 mb-8 ${!isMaster && !isElementVisible('controls') ? 'hidden' : ''}`}>
            <Controls
              timer={timer}
              onStart={startTimer}
              onPause={pauseTimer}
              onStop={stopTimer}
              onReset={resetTimer}
            />
          </div>

          {/* Presets */}
          <div className={!isMaster && !isElementVisible('presets') ? 'hidden' : ''}>
            <Presets
              onSelectPreset={setTime}
              currentMode={timer.mode}
            />
          </div>
        </div>
      </main>

      {/* Settings */}
      {isMaster && (
        <Settings
          settings={settings}
          onSettingsChange={setSettings}
          currentMode={timer.mode}
          onModeChange={setMode}
          onSetCustomTime={setTime}
        />
      )}

      {/* Master Controls */}
      {isMaster && (
        <MasterControls
          connectedClients={connectedClients}
          onSendMessage={masterControl!.sendMessage}
          onHideMessage={masterControl!.hideMessage}
          onShowElement={masterControl!.showElement}
          onHideElement={masterControl!.hideElement}
        />
      )}

      {/* Message Overlay for Clients */}
      {!isMaster && (
        <MessageOverlay
          message={displayMessage}
          isVisible={!!displayMessage}
        />
      )}

      {/* Footer */}
      <footer className={`p-4 text-center text-gray-500 text-sm border-t border-gray-700 ${!isMaster && !isElementVisible('footer') ? 'hidden' : ''}`}>
        <p>Professional Timer System • Built for Live Events & Presentations</p>
        <p className="mt-1">
          {isMaster 
            ? 'Master Control - Managing all connected displays' 
            : 'Client Display - Controlled remotely'}
        </p>
        {isMaster && (
          <div className="mt-2 text-xs text-gray-600">
            <p>📖 <strong>Testing Guide:</strong></p>
            <p>• Open <strong>?mode=client&screenId=screen_1</strong> in new tab for client view</p>
            <p>• Use Master Controls panel (bottom right) to send messages and control elements</p>
            <p>• Element visibility controls: Show/Hide timer, controls, presets on client screens</p>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;