// The Gilded Fox — the alarm meter. Every watcher that can see the thief
// pushes it up; hiding lets it fall. At 100 the night is over. Crossing
// the tense line makes the nearest guard come and look.
import { ALARM, CAMERA, GUARD, PLAYER } from './config.js';
import { sendNearestGuardTo } from './guards.js';

export function makeAlarm() {
  return {
    level: 0,
    peak: 0,
    trips: 0, // times the meter crossed into critical
    wasCritical: false,
  };
}

export function updateAlarm(alarm, dt, world) {
  const { player, guards, cameras } = world;
  let rise = 0;
  for (const g of guards) {
    if (g.seenNow) rise += GUARD.spotPerSecond * (player.sneaking ? 0.5 : 1);
  }
  for (const c of cameras) {
    if (c.seenNow) rise += CAMERA.spotPerSecond * (player.sneaking ? 0.5 : 1);
  }
  if (rise > 0) {
    alarm.level = Math.min(ALARM.max, alarm.level + rise * dt);
  } else {
    alarm.level = Math.max(0, alarm.level - ALARM.decayPerSecond * dt);
  }
  if (alarm.level > alarm.peak) alarm.peak = alarm.level;
  const critical = alarm.level >= ALARM.criticalAt;
  if (critical && !alarm.wasCritical) alarm.trips += 1;
  alarm.wasCritical = critical;
  if (
    alarm.level >= GUARD.suspiciousAt &&
    alarm.level - rise * dt < GUARD.suspiciousAt
  ) {
    sendNearestGuardTo(guards, player.x, player.y);
  }
}

export function alarmState(alarm) {
  if (alarm.level >= ALARM.criticalAt) return 'critical';
  if (alarm.level >= ALARM.tenseAt) return 'tense';
  return 'calm';
}
