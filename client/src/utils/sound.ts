export const playBeep = (frequency = 880, durationMs = 150, volume = 0.2) => {
  try {
    const AudioContextImpl = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextImpl) return;
    const audioCtx = new AudioContextImpl();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.value = volume;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, durationMs);
  } catch (_e) {
    // no-op on environments without audio support
  }
};

export const playStartSound = () => playBeep(880, 150, 0.25);
export const playWarnSound = () => playBeep(440, 200, 0.25);
export const playEndSound = () => playBeep(220, 250, 0.3);
export const playCountdownBeep = () => playBeep(660, 100, 0.2);

export const playCountdownSequence = () => {
  // Play 3 beeps with 1 second intervals
  playCountdownBeep();
  setTimeout(() => playCountdownBeep(), 1000);
  setTimeout(() => playCountdownBeep(), 2000);
};


