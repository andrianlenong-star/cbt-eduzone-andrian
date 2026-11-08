// Synthetic Audio Utility for EduZone CBT Proctoring & Anti-Cheat
// Uses Web Audio API - 100% client-side, zero dependencies

let activeBuzzerOsc: OscillatorNode | null = null;
let activeBuzzerGain: GainNode | null = null;
let activeBuzzerInterval: any = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }
  } catch {}
  return null;
}

/**
 * Starts a loud, pulsing synthetic alarm buzzer for anti-cheating / proctor alerts.
 * Alternates between high & low frequencies with sharp pulses to immediately grab student attention.
 */
export function startSyntheticAlarmBuzzer(): void {
  stopSyntheticAlarmBuzzer();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    activeBuzzerOsc = osc;
    activeBuzzerGain = gain;

    let isHigh = true;
    activeBuzzerInterval = setInterval(() => {
      try {
        if (!activeBuzzerOsc || !activeBuzzerGain) return;
        const now = ctx.currentTime;
        if (isHigh) {
          activeBuzzerOsc.frequency.setValueAtTime(440, now);
          activeBuzzerGain.gain.setValueAtTime(0.2, now);
        } else {
          activeBuzzerOsc.frequency.setValueAtTime(880, now);
          activeBuzzerGain.gain.setValueAtTime(0.4, now);
        }
        isHigh = !isHigh;
      } catch {}
    }, 220);
  } catch (e) {
    console.warn('Gagal membunyikan alarm buzzer:', e);
  }
}

/**
 * Stops the active alarm buzzer.
 */
export function stopSyntheticAlarmBuzzer(): void {
  if (activeBuzzerInterval) {
    clearInterval(activeBuzzerInterval);
    activeBuzzerInterval = null;
  }
  if (activeBuzzerOsc) {
    try {
      activeBuzzerOsc.stop();
      activeBuzzerOsc.disconnect();
    } catch {}
    activeBuzzerOsc = null;
  }
  if (activeBuzzerGain) {
    try {
      activeBuzzerGain.disconnect();
    } catch {}
    activeBuzzerGain = null;
  }
}

/**
 * Checks if the alarm buzzer is currently active.
 */
export function isAlarmBuzzerActive(): boolean {
  return activeBuzzerOsc !== null || activeBuzzerInterval !== null;
}

/**
 * Plays a pleasant two-tone intercom chime (ding-dong) when proctor initiates VoIP intercom broadcast.
 */
export function playIntercomChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // First tone (Ding - 660 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(660, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second tone (Dong - 440 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, now + 0.35);
    gain2.gain.setValueAtTime(0.35, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.35);
    osc2.stop(now + 0.9);
  } catch {}
}

/**
 * Single quick warning chirp
 */
export function playWarningChirp(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {}
}
