import { NetworkMessage, ClientConnection, MasterState } from '../types/network';

export class MasterService {
  private state: MasterState = {
    clients: new Map(),
    globalTimer: {
      currentTime: 0,
      initialTime: 0,
      isRunning: false,
      mode: 'countdown'
    },
    messages: new Map(),
    visibleElements: new Map()
  };

  private ws: WebSocket | null = null;
  private serverUrl: string = 'ws://localhost:8080';

  constructor() {
    this.startServer();
  }

  private async startServer() {
    // In a real implementation, this would start a WebSocket server
    // For now, we'll simulate the master connection
    console.log('Master service initialized');
  }

  // Broadcast to all clients
  broadcastToAll(message: Omit<NetworkMessage, 'target'>) {
    const fullMessage: NetworkMessage = {
      ...message,
      target: 'all',
      timestamp: Date.now()
    };
    
    this.state.clients.forEach((client) => {
      if (client.connected && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(fullMessage));
      }
    });
  }

  // Send to specific client
  sendToClient(screenId: string, message: Omit<NetworkMessage, 'target'>) {
    const client = this.state.clients.get(screenId);
    if (client && client.connected && client.ws.readyState === WebSocket.OPEN) {
      const fullMessage: NetworkMessage = {
        ...message,
        target: screenId,
        timestamp: Date.now()
      };
      client.ws.send(JSON.stringify(fullMessage));
    }
  }

  // Timer control methods
  startTimer() {
    this.state.globalTimer.isRunning = true;
    this.broadcastToAll({
      command: 'start_timer',
      timer_state: { ...this.state.globalTimer }
    });
  }

  pauseTimer() {
    this.state.globalTimer.isRunning = false;
    this.broadcastToAll({
      command: 'pause_timer',
      timer_state: { ...this.state.globalTimer }
    });
  }

  stopTimer() {
    this.state.globalTimer.isRunning = false;
    this.state.globalTimer.currentTime = this.state.globalTimer.mode === 'countdown' 
      ? this.state.globalTimer.initialTime 
      : 0;
    this.broadcastToAll({
      command: 'stop_timer',
      timer_state: { ...this.state.globalTimer }
    });
  }

  resetTimer() {
    this.state.globalTimer.isRunning = false;
    this.state.globalTimer.currentTime = this.state.globalTimer.mode === 'countdown' 
      ? this.state.globalTimer.initialTime 
      : 0;
    this.broadcastToAll({
      command: 'reset_timer',
      timer_state: { ...this.state.globalTimer }
    });
  }

  setTime(seconds: number) {
    this.state.globalTimer.currentTime = seconds;
    this.state.globalTimer.initialTime = seconds;
    this.broadcastToAll({
      command: 'update_time',
      time: this.formatTime(seconds),
      timer_state: { ...this.state.globalTimer }
    });
  }

  setMode(mode: 'countdown' | 'stopwatch') {
    this.state.globalTimer.mode = mode;
    this.state.globalTimer.currentTime = mode === 'countdown' 
      ? this.state.globalTimer.initialTime 
      : 0;
    this.broadcastToAll({
      command: 'set_mode',
      timer_mode: mode,
      timer_state: { ...this.state.globalTimer }
    });
  }

  // Message control methods
  showMessage(screenId: string, message: string) {
    this.state.messages.set(screenId, message);
    if (screenId === 'all') {
      this.broadcastToAll({
        command: 'show_message',
        message
      });
    } else {
      this.sendToClient(screenId, {
        command: 'show_message',
        message
      });
    }
  }

  hideMessage(screenId: string) {
    this.state.messages.delete(screenId);
    if (screenId === 'all') {
      this.broadcastToAll({
        command: 'hide_message'
      });
    } else {
      this.sendToClient(screenId, {
        command: 'hide_message'
      });
    }
  }

  // Element visibility control
  showElement(screenId: string, elementId: string) {
    if (!this.state.visibleElements.has(screenId)) {
      this.state.visibleElements.set(screenId, new Set());
    }
    this.state.visibleElements.get(screenId)!.add(elementId);
    
    if (screenId === 'all') {
      this.broadcastToAll({
        command: 'show_element',
        visible_element: elementId
      });
    } else {
      this.sendToClient(screenId, {
        command: 'show_element',
        visible_element: elementId
      });
    }
  }

  hideElement(screenId: string, elementId: string) {
    if (this.state.visibleElements.has(screenId)) {
      this.state.visibleElements.get(screenId)!.delete(elementId);
    }
    
    if (screenId === 'all') {
      this.broadcastToAll({
        command: 'hide_element',
        visible_element: elementId
      });
    } else {
      this.sendToClient(screenId, {
        command: 'hide_element',
        visible_element: elementId
      });
    }
  }

  // Utility methods
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Client management
  addClient(client: ClientConnection) {
    this.state.clients.set(client.id, client);
    console.log(`Client ${client.screenId} connected`);
  }

  removeClient(clientId: string) {
    const client = this.state.clients.get(clientId);
    if (client) {
      console.log(`Client ${client.screenId} disconnected`);
      this.state.clients.delete(clientId);
    }
  }

  getConnectedClients(): ClientConnection[] {
    return Array.from(this.state.clients.values()).filter(client => client.connected);
  }

  getState(): MasterState {
    return { ...this.state };
  }
}