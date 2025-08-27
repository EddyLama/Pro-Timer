import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";

interface TimerState {
  currentTime: number;
  initialTime: number;
  isRunning: boolean;
  mode: 'countdown' | 'stopwatch';
}

interface ClientConnection {
  id: string;
  screenId: string;
  ws: any;
  connected: boolean;
  lastPing: number;
  connectionTime: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);
  
  // WebSocket server for Stage Timer Pro
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  // Timer state management
  const globalTimer: TimerState = {
    currentTime: 0,
    initialTime: 0,
    isRunning: false,
    mode: 'countdown'
  };

  const clients = new Map<string, ClientConnection>();
  const messages = new Map<string, string>();
  const visibleElements = new Map<string, Set<string>>();
  const messageQueue = new Map<string, any[]>();

  // Helper functions
  function broadcastToAll(message: any) {
    const fullMessage = {
      ...message,
      target: 'all',
      timestamp: Date.now()
    };
    
    clients.forEach((client) => {
      if (client.connected && client.ws.readyState === 1) {
        client.ws.send(JSON.stringify(fullMessage));
      }
    });
  }

  function sendToClient(screenId: string, message: any) {
    const client = Array.from(clients.values()).find(c => c.screenId === screenId);
    if (client && client.connected && client.ws.readyState === 1) {
      const fullMessage = {
        ...message,
        target: screenId,
        timestamp: Date.now()
      };
      client.ws.send(JSON.stringify(fullMessage));
    } else {
      // Queue message for offline client
      if (!messageQueue.has(screenId)) {
        messageQueue.set(screenId, []);
      }
      messageQueue.get(screenId)!.push({
        ...message,
        target: screenId,
        timestamp: Date.now()
      });
    }
  }

  // WebSocket connection handling
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const screenId = url.searchParams.get('screenId') || 'unknown';
    const clientId = `${screenId}_${Date.now()}`;
    
    const client: ClientConnection = {
      id: clientId,
      screenId,
      ws,
      connected: true,
      lastPing: Date.now(),
      connectionTime: Date.now()
    };
    
    clients.set(clientId, client);
    console.log(`Client ${screenId} connected (${clientId})`);

    // Send current state to new client
    ws.send(JSON.stringify({
      command: 'initial_state',
      timer_state: globalTimer,
      timestamp: Date.now()
    }));

    // Send queued messages if any
    const queuedMessages = messageQueue.get(screenId) || [];
    if (queuedMessages.length > 0) {
      queuedMessages.forEach(message => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(message));
        }
      });
      messageQueue.delete(screenId);
    }

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.command) {
          case 'ping':
            client.lastPing = Date.now();
            ws.send(JSON.stringify({ command: 'pong', timestamp: Date.now() }));
            break;
          
          default:
            console.log('Received message:', message);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Client ${screenId} disconnected (${clientId})`);
      clients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(clientId);
    });
  });

  // Timer API endpoints for master control
  app.post('/api/timer/start', (req, res) => {
    globalTimer.isRunning = true;
    broadcastToAll({
      command: 'start_timer',
      timer_state: { ...globalTimer }
    });
    res.json({ success: true });
  });

  app.post('/api/timer/pause', (req, res) => {
    globalTimer.isRunning = false;
    broadcastToAll({
      command: 'pause_timer',
      timer_state: { ...globalTimer }
    });
    res.json({ success: true });
  });

  app.post('/api/timer/stop', (req, res) => {
    globalTimer.isRunning = false;
    // Keep countdown at 0 when stopped instead of jumping back to initial time
    globalTimer.currentTime = globalTimer.mode === 'countdown' 
      ? 0 
      : 0;
    broadcastToAll({
      command: 'stop_timer',
      timer_state: { ...globalTimer }
    });
    res.json({ success: true });
  });

  app.post('/api/timer/reset', (req, res) => {
    globalTimer.isRunning = false;
    globalTimer.currentTime = globalTimer.mode === 'countdown' 
      ? globalTimer.initialTime 
      : 0;
    broadcastToAll({
      command: 'reset_timer',
      timer_state: { ...globalTimer }
    });
    res.json({ success: true });
  });

  app.post('/api/timer/set-time', (req, res) => {
    const { seconds, label } = req.body;
    globalTimer.currentTime = seconds;
    globalTimer.initialTime = seconds;
    broadcastToAll({
      command: 'update_time',
      timer_state: { ...globalTimer },
      label
    });
    res.json({ success: true });
  });

  app.post('/api/timer/set-mode', (req, res) => {
    const { mode } = req.body;
    globalTimer.mode = mode;
    globalTimer.currentTime = mode === 'countdown' 
      ? globalTimer.initialTime 
      : 0;
    broadcastToAll({
      command: 'set_mode',
      timer_mode: mode,
      timer_state: { ...globalTimer }
    });
    res.json({ success: true });
  });

  // Timer sync endpoint for real-time updates
  app.post('/api/timer/sync', (req, res) => {
    const { timer_state } = req.body;
    if (timer_state) {
      globalTimer.currentTime = timer_state.currentTime;
      globalTimer.initialTime = timer_state.initialTime;
      globalTimer.isRunning = timer_state.isRunning;
      globalTimer.mode = timer_state.mode;
      
      broadcastToAll({
        command: 'sync_timer',
        timer_state: { ...globalTimer }
      });
    }
    res.json({ success: true });
  });

  app.post('/api/message/show', (req, res) => {
    const { screenId, message } = req.body;
    if (screenId === 'all') {
      broadcastToAll({
        command: 'show_message',
        message
      });
    } else {
      sendToClient(screenId, {
        command: 'show_message',
        message
      });
    }
    res.json({ success: true });
  });

  app.post('/api/message/hide', (req, res) => {
    const { screenId } = req.body;
    if (screenId === 'all') {
      broadcastToAll({
        command: 'hide_message'
      });
    } else {
      sendToClient(screenId, {
        command: 'hide_message'
      });
    }
    res.json({ success: true });
  });

  app.get('/api/clients', (req, res) => {
    const connectedClients = Array.from(clients.values())
      .filter(client => client.connected)
      .map(client => ({
        id: client.id,
        screenId: client.screenId,
        connected: client.connected,
        lastPing: client.lastPing,
        connectionTime: client.connectionTime || Date.now(),
        latency: Date.now() - client.lastPing,
        status: (Date.now() - client.lastPing) < 35000 ? 'healthy' : 'unresponsive'
      }));
    res.json(connectedClients);
  });

  app.get('/api/clients/:screenId', (req, res) => {
    const { screenId } = req.params;
    const client = Array.from(clients.values()).find(c => c.screenId === screenId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({
      id: client.id,
      screenId: client.screenId,
      connected: client.connected,
      lastPing: client.lastPing,
      connectionTime: client.connectionTime || Date.now(),
      latency: Date.now() - client.lastPing,
      status: (Date.now() - client.lastPing) < 35000 ? 'healthy' : 'unresponsive'
    });
  });

  // Element visibility control endpoints
  app.post('/api/element/show', (req, res) => {
    const { screenId, elementId } = req.body;
    if (screenId === 'all') {
      broadcastToAll({
        command: 'show_element',
        visible_element: elementId
      });
    } else {
      sendToClient(screenId, {
        command: 'show_element',
        visible_element: elementId
      });
    }
    res.json({ success: true });
  });

  app.post('/api/element/hide', (req, res) => {
    const { screenId, elementId } = req.body;
    if (screenId === 'all') {
      broadcastToAll({
        command: 'hide_element',
        visible_element: elementId
      });
    } else {
      sendToClient(screenId, {
        command: 'hide_element',
        visible_element: elementId
      });
    }
    res.json({ success: true });
  });

  // Health check endpoints
  app.get('/api/health', (req, res) => {
    const totalClients = clients.size;
    const connectedClients = Array.from(clients.values()).filter(c => c.connected).length;
    const healthyClients = Array.from(clients.values()).filter(c =>
      c.connected && (Date.now() - c.lastPing) < 35000
    ).length;
    
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      clients: {
        total: totalClients,
        connected: connectedClients,
        healthy: healthyClients
      },
      uptime: process.uptime()
    });
  });

  app.get('/api/health/clients', (req, res) => {
    const clientHealth = Array.from(clients.values()).map(client => ({
      id: client.id,
      screenId: client.screenId,
      connected: client.connected,
      lastPing: client.lastPing,
      connectionTime: client.connectionTime,
      latency: Date.now() - client.lastPing,
      status: (Date.now() - client.lastPing) < 35000 ? 'healthy' : 'unresponsive',
      queuedMessages: (messageQueue.get(client.screenId) || []).length
    }));
    
    res.json({
      clients: clientHealth,
      timestamp: Date.now()
    });
  });

  // Network diagnostics endpoint
  app.post('/api/diagnostics/latency', (req, res) => {
    const { screenId } = req.body;
    const client = Array.from(clients.values()).find(c => c.screenId === screenId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const latency = Date.now() - client.lastPing;
    res.json({
      screenId,
      latency,
      status: latency < 35000 ? 'healthy' : 'unresponsive',
      lastPing: client.lastPing,
      connectionTime: client.connectionTime
    });
  });

  // Client list endpoint
  app.get('/api/clients', (req, res) => {
    const clientList = Array.from(clients.values()).map(client => ({
      id: client.id,
      screenId: client.screenId,
      connected: client.connected,
      lastPing: client.lastPing,
      connectionTime: client.connectionTime,
      latency: Date.now() - client.lastPing,
      status: (Date.now() - client.lastPing) < 35000 ? 'healthy' : 'unresponsive'
    }));
    
    res.json(clientList);
  });

  return httpServer;
}
