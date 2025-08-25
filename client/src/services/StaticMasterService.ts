// Static version for Netlify deployment (no backend server)
export class StaticMasterService {
  private clients: string[] = [];
  
  // Simulate real service for static deployment
  async startTimer() {
    console.log('Timer started (static mode)');
  }

  async pauseTimer() {
    console.log('Timer paused (static mode)');
  }

  async stopTimer() {
    console.log('Timer stopped (static mode)');
  }

  async resetTimer() {
    console.log('Timer reset (static mode)');
  }

  async setTime(seconds: number) {
    console.log('Time set to:', seconds, '(static mode)');
  }

  async setMode(mode: 'countdown' | 'stopwatch') {
    console.log('Mode set to:', mode, '(static mode)');
  }

  async showMessage(screenId: string, message: string) {
    console.log('Message sent to', screenId, ':', message, '(static mode)');
  }

  async hideMessage(screenId: string) {
    console.log('Message hidden for', screenId, '(static mode)');
  }

  async showElement(screenId: string, elementId: string) {
    console.log('Element', elementId, 'shown for', screenId, '(static mode)');
  }

  async hideElement(screenId: string, elementId: string) {
    console.log('Element', elementId, 'hidden for', screenId, '(static mode)');
  }

  getConnectedClients() {
    return [{ screenId: 'demo_screen_1' }, { screenId: 'demo_screen_2' }];
  }

  getState() {
    return {
      clients: new Map(),
      globalTimer: { currentTime: 0, initialTime: 0, isRunning: false, mode: 'countdown' as const },
      messages: new Map(),
      visibleElements: new Map()
    };
  }
}