# Professional Multi-Screen Broadcast Timer System

A professional-grade, multi-screen broadcast timing and messaging system designed for live events, venues, and presentations. Built with a robust master-client architecture for reliable local network operation.

## Architecture Overview

### Master-Client System
- **Master (Controller) Application**: Single source of truth that manages all timers and messages
- **Client (Display) Applications**: Display-only instances that receive and render data from the master

### Key Features
- **Robust Local Network Engine**: Persistent WebSocket connections over TCP/IP
- **State-driven Synchronization**: Event-driven updates only when changes occur
- **Dynamic & Selective Control**: Address clients individually or globally
- **Real-time Communication**: Sub-second response times for critical timing applications

## Getting Started

### Installation
```bash
npm install
```

### Running the System

#### Option 1: Full System (Recommended)
```bash
npm run dev:full
```
This starts both the WebSocket server and the web application.

#### Option 2: Manual Setup
Terminal 1 - Start WebSocket Server:
```bash
npm run dev:server
```

Terminal 2 - Start Web Application:
```bash
npm run dev
```

### Accessing the Applications

#### Master Control Station
```
http://localhost:5173?mode=master
```
- Full timer controls (start, pause, stop, reset)
- Message broadcasting to all or specific screens
- Element visibility control
- Connected client monitoring

#### Client Display Screens
```
http://localhost:5173?screenId=screen_1
http://localhost:5173?screenId=screen_2
http://localhost:5173?screenId=screen_3
```
- Display-only mode
- Receives commands from master
- Shows broadcast messages
- Responsive to element visibility controls

## Network Protocol

### Message Structure
```json
{
  "target": "screen_1" | "all",
  "command": "start_timer" | "stop_timer" | "show_message" | "update_time" | "show_element",
  "time": "00:10:00",
  "message": "Break time - 10 minutes",
  "visible_element": "timer",
  "timer_state": {
    "currentTime": 600,
    "initialTime": 600,
    "isRunning": true,
    "mode": "countdown"
  },
  "timestamp": 1703123456789
}
```

### Supported Commands
- `start_timer`: Start the timer on target screens
- `pause_timer`: Pause the timer
- `stop_timer`: Stop and reset timer to initial time
- `reset_timer`: Reset timer to initial state
- `update_time`: Set new timer duration
- `set_mode`: Switch between countdown/stopwatch modes
- `show_message`: Display message overlay
- `hide_message`: Hide message overlay
- `show_element`: Show specific UI element
- `hide_element`: Hide specific UI element

## Master Control Features

### Timer Management
- Start/Pause/Stop/Reset controls
- Countdown and Stopwatch modes
- Custom time setting
- Visual warning zones (green/yellow/red)

### Message Broadcasting
- Send messages to all screens or specific screens
- Full-screen message overlays
- Instant message hiding

### Element Visibility Control
- Show/hide timer display
- Show/hide control panels
- Show/hide preset buttons
- Show/hide progress bars
- Show/hide headers/footers

### Client Monitoring
- Real-time connected client list
- Connection status monitoring
- Automatic reconnection handling

## Client Display Features

### Automatic Synchronization
- Receives all timer updates in real-time
- Displays broadcast messages automatically
- Responds to element visibility commands

### Robust Connection Management
- Automatic reconnection on network issues
- Visual connection status indicator
- Graceful handling of network interruptions

### Display Optimization
- Large, readable timer display
- Color-coded warning zones
- Full-screen message overlays
- Responsive design for all screen sizes

## Technical Implementation

### WebSocket Server
- Node.js with Express and WebSocket (ws)
- Handles multiple simultaneous client connections
- RESTful API endpoints for external control
- Automatic client cleanup and health monitoring

### Frontend Architecture
- React with TypeScript
- Custom hooks for master/client modes
- Real-time state synchronization
- Modular component architecture

### Network Resilience
- Automatic reconnection with exponential backoff
- Heartbeat/ping system for connection monitoring
- Graceful degradation on network issues
- State synchronization on reconnection

## Use Cases

### Live Events
- Conference presentations with break timers
- Workshop session management
- Performance timing displays

### Broadcast Production
- Show segment timing
- Commercial break countdowns
- Live event coordination

### Venue Management
- Event scheduling displays
- Break time announcements
- Multi-room coordination

## Development

### Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Network and business logic
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

server/
└── websocket-server.js # WebSocket server implementation
```

### Adding New Features
1. Define message types in `src/types/network.ts`
2. Implement server-side handling in `server/websocket-server.js`
3. Add client-side handlers in `src/services/NetworkService.ts`
4. Update UI components as needed

## Deployment

### Local Network Deployment
1. Build the application: `npm run build`
2. Deploy the WebSocket server to a local server
3. Configure client devices to connect to the server IP
4. Access master control and client displays via web browsers

### Production Considerations
- Use HTTPS/WSS for secure connections
- Implement authentication for master control access
- Add logging and monitoring
- Configure firewall rules for WebSocket ports
- Consider load balancing for large deployments

## License

Professional Timer System - Built for Live Events & Presentations