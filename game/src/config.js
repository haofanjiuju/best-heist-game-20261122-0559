// The Gilded Fox — a one-room museum heist. Shared tuning for every system:
// speeds, sight ranges, alarm rates and the palette. One place to tune the game.
export const VIEW = { width: 1280, height: 720, hudHeight: 64 };

export const PALETTE = {
  floorA: '#171e33',
  floorB: '#12172a',
  carpet: '#571f2c',
  carpetEdge: '#8a6d2f',
  wall: '#2a3350',
  wallTop: '#3b4670',
  gold: '#e8b64c',
  goldDim: '#a8823a',
  red: '#c0392b',
  green: '#2ecc71',
  cream: '#f2e8d5',
  ink: '#0c1020',
  coneGuard: 'rgba(255, 210, 80, 0.20)',
  coneGuardHot: 'rgba(255, 90, 60, 0.30)',
  coneCamera: 'rgba(255, 80, 80, 0.16)',
  smoke: 'rgba(200, 205, 215, 0.35)',
};

export const PLAYER = {
  radius: 13,
  walkSpeed: 155,
  sneakSpeed: 88,
  grabRange: 78,
  smokeCharges: 2,
  coinCharges: 3,
  smokeRadius: 135,
  smokeSeconds: 4,
  coinRange: 300,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 58,
  chaseSpeed: 102,
  investigateSpeed: 80,
  sightRange: 215,
  sightHalfAngle: 0.62,
  touchDistance: 27,
  spotPerSecond: 62,
  suspiciousAt: 45,
  chaseAt: 65,
  loseSightSeconds: 2.5,
  scanSeconds: 2.5,
};

export const CAMERA = {
  sightRange: 245,
  sightHalfAngle: 0.5,
  sweepHalfAngle: 0.78,
  sweepSeconds: 3.2,
  spotPerSecond: 30,
};

export const ALARM = {
  decayPerSecond: 9,
  tenseAt: 35,
  criticalAt: 70,
  max: 100,
};

export const TIMING = { freezeShotSeconds: 0 };
