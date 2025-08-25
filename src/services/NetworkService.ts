import { NetworkMessage, ClientConnection, MasterState } from '../types/network';

export class NetworkService {
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (message: NetworkMessage) => void> = new Map();
  private connectionHandlers: Array<(connected: boolean) => void> = [];
  
  constructor(private serverUrl: string = 'ws://localhost:8080') {}

  // Client-side connection
  connect(screenId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.serverUrl}?screenId=${screenId}`);
        
        this.ws.onopen = () => {
          console.log(`Connected to master as ${screenId}`);
          this.startPing();
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: NetworkMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Disconnected from master');
          this.notifyConnectionHandlers(false);
          this.scheduleReconnect(screenId);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: NetworkMessage) {
    const handler = this.messageHandlers.get(message.command);
    if (handler) {
      handler(message);
    } else {
      console.warn('No handler for command:', message.command);
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ command: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private scheduleReconnect(screenId: string) {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setInterval(() => {
      console.log('Attempting to reconnect...');
      this.connect(screenId).then(() => {
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      }).catch(() => {
        // Continue trying to reconnect
      });
    }, 5000); // Try to reconnect every 5 seconds
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  // Register message handlers
  onMessage(command: string, handler: (message: NetworkMessage) => void) {
    this.messageHandlers.set(command, handler);
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
  }

  // Send message to master (for client feedback)
  sendToMaster(message: NetworkMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}