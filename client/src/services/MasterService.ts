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

  private baseUrl: string = `${window.location.protocol}//${window.location.host}`;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    console.log('Master service initialized');
    // Poll for connected clients periodically
    this.pollConnectedClients();
  }

  private async pollConnectedClients() {
    const poll = async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/clients`);
        const clients = await response.json();
        
        // Update local state
        this.state.clients.clear();
        clients.forEach((client: any) => {
          this.state.clients.set(client.id, {
            ...client,
            ws: null, // Not needed for master service
            connected: client.connected
          });
        });
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    // Poll every 2 seconds
    setInterval(poll, 2000);
    // Initial poll
    poll();
  }

  // Send API request to server
  private async makeApiCall(endpoint: string, data: any = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      return null;
    }
  }

  // Send to specific client (handled by server API)
  private async sendToClient(screenId: string, action: string, data: any = {}) {
    // This is now handled through the server API endpoints
    console.log(`Sending ${action} to client ${screenId}`, data);
  }

  // Timer control methods
  async startTimer() {
    this.state.globalTimer.isRunning = true;
    await this.makeApiCall('/timer/start');
  }

  async pauseTimer() {
    this.state.globalTimer.isRunning = false;
    await this.makeApiCall('/timer/pause');
  }

  async stopTimer() {
    this.state.globalTimer.isRunning = false;
    this.state.globalTimer.currentTime = this.state.globalTimer.mode === 'countdown' 
      ? this.state.globalTimer.initialTime 
      : 0;
    await this.makeApiCall('/timer/stop');
  }

  async resetTimer() {
    this.state.globalTimer.isRunning = false;
    this.state.globalTimer.currentTime = this.state.globalTimer.mode === 'countdown' 
      ? this.state.globalTimer.initialTime 
      : 0;
    await this.makeApiCall('/timer/reset');
  }

  async setTime(seconds: number) {
    this.state.globalTimer.currentTime = seconds;
    this.state.globalTimer.initialTime = seconds;
    await this.makeApiCall('/timer/set-time', { seconds });
  }

  async setMode(mode: 'countdown' | 'stopwatch') {
    this.state.globalTimer.mode = mode;
    this.state.globalTimer.currentTime = mode === 'countdown' 
      ? this.state.globalTimer.initialTime 
      : 0;
    await this.makeApiCall('/timer/set-mode', { mode });
  }

  // Message control methods
  async showMessage(screenId: string, message: string) {
    this.state.messages.set(screenId, message);
    await this.makeApiCall('/message/show', { screenId, message });
  }

  async hideMessage(screenId: string) {
    this.state.messages.delete(screenId);
    await this.makeApiCall('/message/hide', { screenId });
  }

  // Element visibility control
  async showElement(screenId: string, elementId: string) {
    if (!this.state.visibleElements.has(screenId)) {
      this.state.visibleElements.set(screenId, new Set());
    }
    this.state.visibleElements.get(screenId)!.add(elementId);
    await this.makeApiCall('/element/show', { screenId, elementId });
  }

  async hideElement(screenId: string, elementId: string) {
    if (this.state.visibleElements.has(screenId)) {
      this.state.visibleElements.get(screenId)!.delete(elementId);
    }
    await this.makeApiCall('/element/hide', { screenId, elementId });
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