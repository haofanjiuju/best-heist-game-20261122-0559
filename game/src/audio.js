// The Gilded Fox — tiny WebAudio sound kit. Every sound is synthesised
// with oscillators, so the game needs no audio files. All calls are safe
// before any user gesture: a missing AudioContext just stays silent.
let ctx = null;
let muted = false;
let lastAlarmBeep = 0;

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch (e) {
    ctx = null;
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

function tone(freq, seconds, type, gain, when = 0, slideTo = 0) {
  if (!ctx || muted) return;
  try {
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + seconds);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  } catch (e) {
    // Audio is decoration; never break the game for it.
  }
}

export function playPickup() {
  tone(660, 0.12, 'sine', 0.16);
  tone(880, 0.16, 'sine', 0.16, 0.09);
  tone(1320, 0.22, 'sine', 0.12, 0.18);
}

export function playCoin() {
  tone(1560, 0.07, 'triangle', 0.12);
  tone(1170, 0.09, 'triangle', 0.1, 0.06);
}

export function playSmoke() {
  tone(320, 0.35, 'sine', 0.12, 0, 90);
}

export function playStep() {
  tone(140, 0.04, 'sine', 0.03);
}

export function playAlarmTick(now) {
  if (now - lastAlarmBeep < 0.55) return;
  lastAlarmBeep = now;
  tone(920, 0.09, 'square', 0.05);
}

export function playCaught() {
  tone(392, 0.25, 'sawtooth', 0.12);
  tone(311, 0.25, 'sawtooth', 0.12, 0.22);
  tone(233, 0.5, 'sawtooth', 0.12, 0.44);
}

export function playEscape() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, i * 0.11));
}
