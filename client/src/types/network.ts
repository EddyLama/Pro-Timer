export interface NetworkMessage {
  target: string; // "screen_1", "screen_2", "all", etc.
  command: string; // "start_timer", "stop_timer", "show_message", "update_time", "show_element", etc.
  time?: string; // "00:10:00" format
  message?: string; // Text message to display
  visible_element?: string; // UI element identifier
  timer_mode?: 'countdown' | 'stopwatch';
  timer_state?: {
    currentTime: number;
    initialTime: number;
    isRunning: boolean;
    mode: 'countdown' | 'stopwatch';
  };
  timestamp?: number;
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  screenId: string;
  connected: boolean;
  lastPing: number;
}

export interface MasterState {
  clients: Map<string, ClientConnection>;
  globalTimer: {
    currentTime: number;
    initialTime: number;
    isRunning: boolean;
    mode: 'countdown' | 'stopwatch';
  };
  messages: Map<string, string>; // screenId -> message
  visibleElements: Map<string, Set<string>>; // screenId -> set of visible elements
}