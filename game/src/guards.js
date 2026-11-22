// The Gilded Fox — the night guards. Each guard walks a patrol route,
// pauses at each end, and reacts to what it sees: a glimpse makes it
// suspicious and sends it to investigate, a clear sighting at high alarm
// makes it chase. Smoke blinds it; a coin landing nearby draws it over.
import { GUARD } from './config.js';
import { angleDiff, angleTo, canSpot, collideCircle } from './vision.js';

export function makeGuard(route) {
  const start = route.waypoints[0];
  return {
    name: route.name,
    x: start.x,
    y: start.y,
    facing: Math.PI / 2,
    waypointIndex: 1,
    pauseLeft: 0,
    state: 'patrol', // patrol | investigate | chase | scan
    target: null,
    scanLeft: 0,
    lastSeen: null,
    lostSightFor: 0,
    seenNow: false,
  };
}

function moveTowards(g, tx, ty, speed, dt, blockers) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  const nx = g.x + (dx / d) * step;
  const ny = g.y + (dy / d) * step;
  g.facing = angleTo(g.x, g.y, nx, ny);
  const fixed = collideCircle(nx, ny, GUARD.radius, blockers);
  g.x = fixed.x;
  g.y = fixed.y;
  return d - step < 3;
}

export function updateGuard(g, dt, world) {
  const { player, blockers, smokes, alarm } = world;
  const blinded = smokes.some(
    (s) => Math.hypot(g.x - s.x, g.y - s.y) < s.radius + GUARD.radius,
  );
  const spotted =
    !blinded &&
    canSpot(
      g.x, g.y, g.facing,
      GUARD.sightHalfAngle, GUARD.sightRange,
      player.x, player.y, blockers,
    );
  g.seenNow = spotted;
  if (spotted) {
    g.lastSeen = { x: player.x, y: player.y };
    g.lostSightFor = 0;
    if (alarm.level >= GUARD.chaseAt) g.state = 'chase';
  } else {
    g.lostSightFor += dt;
  }

  if (g.state === 'chase') {
    if (!g.lastSeen || g.lostSightFor > GUARD.loseSightSeconds) {
      g.state = 'investigate';
      g.target = g.lastSeen ? { ...g.lastSeen } : { x: g.x, y: g.y };
      g.scanLeft = GUARD.scanSeconds;
    } else if (g.lastSeen) {
      moveTowards(g, g.lastSeen.x, g.lastSeen.y, GUARD.chaseSpeed, dt, blockers);
    }
    return;
  }

  if (g.state === 'investigate' && g.target) {
    const arrived = moveTowards(g, g.target.x, g.target.y, GUARD.investigateSpeed, dt, blockers);
    if (arrived) {
      g.state = 'scan';
      g.scanLeft = GUARD.scanSeconds;
    }
    return;
  }

  if (g.state === 'scan') {
    g.facing += dt * 1.4;
    g.scanLeft -= dt;
    if (g.scanLeft <= 0) g.state = 'patrol';
    return;
  }

  // Patrol: walk the route, pausing at each waypoint.
  if (g.pauseLeft > 0) {
    g.pauseLeft -= dt;
    return;
  }
  const wp = world.route.waypoints[g.waypointIndex];
  const arrived = moveTowards(g, wp.x, wp.y, GUARD.patrolSpeed, dt, blockers);
  if (arrived) {
    g.waypointIndex = (g.waypointIndex + 1) % world.route.waypoints.length;
    g.pauseLeft = 1.2;
  }
}

// A glimpse at rising alarm sends the nearest guard to look.
export function sendNearestGuardTo(guards, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const g of guards) {
    const d = Math.hypot(g.x - x, g.y - y);
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }
  if (best && best.state !== 'chase') {
    best.state = 'investigate';
    best.target = { x, y };
  }
}
