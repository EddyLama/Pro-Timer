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
  showHours: boolean;
  autoReset: boolean;
  allowOvertime: boolean;
  soundsEnabled?: boolean;
}

export interface PresetTime {
  label: string;
  seconds: number;
}