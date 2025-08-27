import { TimerSettings } from '../types/timer';

export interface AppStorage {
  settings: TimerSettings;
}

const STORAGE_KEY = 'stage-timer-pro';

export const loadAppStorage = (): Partial<AppStorage> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return {};
};

export const saveAppStorage = (data: Partial<AppStorage>) => {
  try {
    const existing = loadAppStorage();
    const updated = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
};

export const saveSettings = (settings: TimerSettings) => {
  saveAppStorage({ settings });
};

export const loadSettings = (): TimerSettings | null => {
  const storage = loadAppStorage();
  return storage.settings || null;
};