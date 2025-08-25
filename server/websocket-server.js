const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Master state
let masterState = {
  globalTimer: {
    currentTime: 0,
    initialTime: 0,
    isRunning: false,
    mode: 'countdown'
  },
  messages: new Map(),
  visibleElements: new Map()
};

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const screenId = url.searchParams.get('screenId') || `client_${Date.now()}`;
  
  const clientId = `${screenId}_${Date.now()}`;
  
  // Store client connection
  clients.set(clientId, {
    id: clientId,
    ws: ws,
    screenId: screenId,
    connected: true,
    lastPing: Date.now()
  });

  console.log(`Client connected: ${screenId} (${clientId})`);
  console.log(`Total clients: ${clients.size}`);

  // Send current state to new client
  ws.send(JSON.stringify({
    target: screenId,
    command: 'sync_state',
    timer_state: masterState.globalTimer,
    timestamp: Date.now()
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.command === 'ping') {
        const client = clients.get(clientId);
        if (client) {
          client.lastPing = Date.now();
          ws.send(JSON.stringify({ command: 'pong', timestamp: Date.now() }));
        }
        return;
      }

      // Handle other commands from clients
      console.log(`Message from ${screenId}:`, message);
      
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client disconnected: ${screenId} (${clientId})`);
    console.log(`Total clients: ${clients.size}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for ${screenId}:`, error);
    clients.delete(clientId);
  });
});

// Broadcast function
function broadcast(message, targetScreenId = 'all') {
  const messageWithTimestamp = {
    ...message,
    timestamp: Date.now()
  };

  clients.forEach((client) => {
    if (client.connected && client.ws.readyState === WebSocket.OPEN) {
      if (targetScreenId === 'all' || client.screenId === targetScreenId) {
        client.ws.send(JSON.stringify({
          ...messageWithTimestamp,
          target: client.screenId
        }));
      }
    }
  });
}

// REST API endpoints for master control
app.post('/api/timer/start', (req, res) => {
  masterState.globalTimer.isRunning = true;
  broadcast({
    command: 'start_timer',
    timer_state: masterState.globalTimer
  });
  res.json({ success: true });
});

app.post('/api/timer/pause', (req, res) => {
  masterState.globalTimer.isRunning = false;
  broadcast({
    command: 'pause_timer',
    timer_state: masterState.globalTimer
  });
  res.json({ success: true });
});

app.post('/api/timer/stop', (req, res) => {
  masterState.globalTimer.isRunning = false;
  masterState.globalTimer.currentTime = masterState.globalTimer.mode === 'countdown' 
    ? masterState.globalTimer.initialTime 
    : 0;
  broadcast({
    command: 'stop_timer',
    timer_state: masterState.globalTimer
  });
  res.json({ success: true });
});

app.post('/api/timer/reset', (req, res) => {
  masterState.globalTimer.isRunning = false;
  masterState.globalTimer.currentTime = masterState.globalTimer.mode === 'countdown' 
    ? masterState.globalTimer.initialTime 
    : 0;
  broadcast({
    command: 'reset_timer',
    timer_state: masterState.globalTimer
  });
  res.json({ success: true });
});

app.post('/api/timer/set-time', (req, res) => {
  const { seconds } = req.body;
  masterState.globalTimer.currentTime = seconds;
  masterState.globalTimer.initialTime = seconds;
  broadcast({
    command: 'update_time',
    timer_state: masterState.globalTimer
  });
  res.json({ success: true });
});

app.post('/api/timer/set-mode', (req, res) => {
  const { mode } = req.body;
  masterState.globalTimer.mode = mode;
  masterState.globalTimer.currentTime = mode === 'countdown' 
    ? masterState.globalTimer.initialTime 
    : 0;
  broadcast({
    command: 'set_mode',
    timer_mode: mode,
    timer_state: masterState.globalTimer
  });
  res.json({ success: true });
});

app.post('/api/message/send', (req, res) => {
  const { screenId, message } = req.body;
  broadcast({
    command: 'show_message',
    message: message
  }, screenId);
  res.json({ success: true });
});

app.post('/api/message/hide', (req, res) => {
  const { screenId } = req.body;
  broadcast({
    command: 'hide_message'
  }, screenId);
  res.json({ success: true });
});

app.post('/api/element/show', (req, res) => {
  const { screenId, elementId } = req.body;
  broadcast({
    command: 'show_element',
    visible_element: elementId
  }, screenId);
  res.json({ success: true });
});

app.post('/api/element/hide', (req, res) => {
  const { screenId, elementId } = req.body;
  broadcast({
    command: 'hide_element',
    visible_element: elementId
  }, screenId);
  res.json({ success: true });
});

app.get('/api/clients', (req, res) => {
  const clientList = Array.from(clients.values())
    .filter(client => client.connected)
    .map(client => ({
      id: client.id,
      screenId: client.screenId,
      lastPing: client.lastPing
    }));
  res.json(clientList);
});

// Cleanup disconnected clients periodically
setInterval(() => {
  const now = Date.now();
  clients.forEach((client, clientId) => {
    if (now - client.lastPing > 60000) { // 60 seconds timeout
      console.log(`Removing stale client: ${client.screenId}`);
      clients.delete(clientId);
    }
  });
}, 30000); // Check every 30 seconds

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Master Control: http://localhost:3000?mode=master`);
  console.log(`Client Display: http://localhost:3000?screenId=screen_1`);
});