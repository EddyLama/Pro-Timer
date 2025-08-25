export interface TimerState {
  currentTime: number; // in seconds
  initialTime: number;
  isRunning: boolean;
  mode: 'countdown' | 'stopwatch';
}

export interface TimerSettings {
  warningThreshold: number; // seconds
  dangerThreshold: number; // seconds
  showMilliseconds: boolean;
  autoReset: boolean;
}

export interface PresetTime {
  label: string;
  seconds: number;
}