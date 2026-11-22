// The Gilded Fox — the gallery itself: walls, cover, the vault, the getaway
// door and the patrol routes. One room, three lanes, all coordinates in
// canvas pixels (1280x720, HUD occupies the top 64).
import { VIEW } from './config.js';

// Every rectangle blocks both movement and sight. Walls and display cases
// are the only sight blockers; ropes and paintings are decoration.
export const WALLS = [
  { x: 0, y: 64, w: 1280, h: 16 }, // top wall under the HUD
  { x: 0, y: 704, w: 1280, h: 16 }, // bottom wall
  { x: 0, y: 64, w: 16, h: 656 }, // left wall
  { x: 1264, y: 64, w: 16, h: 656 }, // right wall
  { x: 380, y: 180, w: 24, h: 180 }, // upper-left partition
  { x: 880, y: 180, w: 24, h: 180 }, // upper-right partition
  { x: 400, y: 420, w: 110, h: 24 }, // mid-room partition, left of the carpet
  { x: 770, y: 420, w: 110, h: 24 }, // mid-room partition, right of the carpet
];

export const COVER = [
  { x: 180, y: 260, w: 130, h: 64, kind: 'case' }, // left display cases
  { x: 180, y: 470, w: 130, h: 64, kind: 'case' },
  { x: 970, y: 260, w: 130, h: 64, kind: 'case' }, // right display cases
  { x: 970, y: 470, w: 130, h: 64, kind: 'case' },
  { x: 600, y: 300, w: 80, h: 80, kind: 'fountain' }, // centre fountain
  { x: 440, y: 560, w: 56, h: 56, kind: 'pillar' }, // floor pillars
  { x: 840, y: 560, w: 56, h: 56, kind: 'pillar' },
];

export const VAULT = { x: 590, y: 84, w: 100, h: 56, name: 'Gilded Idol' };
export const EXIT = { x: 1150, y: 656, w: 114, h: 48, name: 'GETAWAY' };
export const ENTRANCE = { x: 600, y: 676, w: 80, h: 24 };

export const GUARD_ROUTES = [
  // Routes weave around the display cases and partitions: a straight line
  // through a case would pin a guard against it forever.
  { name: 'Marco', waypoints: [{ x: 150, y: 180 }, { x: 150, y: 600 }, { x: 360, y: 600 }, { x: 360, y: 180 }] },
  { name: 'Rosa', waypoints: [{ x: 560, y: 220 }, { x: 560, y: 600 }] },
  { name: 'Vince', waypoints: [{ x: 1130, y: 180 }, { x: 1130, y: 600 }, { x: 920, y: 600 }, { x: 920, y: 180 }] },
];

export const CAMERA_MOUNTS = [
  { x: 300, y: 82, baseAngle: Math.PI / 2, name: 'CAM 1' },
  { x: 980, y: 82, baseAngle: Math.PI / 2, name: 'CAM 2' },
];

export const PLAYER_SPAWN = { x: 640, y: 668 };

// Velvet ropes guarding the vault approach (decoration only, no collision).
export const ROPES = [
  { x1: 520, y1: 210, x2: 760, y2: 210 },
  { x1: 520, y1: 210, x2: 520, y2: 300 },
  { x1: 760, y1: 210, x2: 760, y2: 300 },
];

// Framed paintings on the top wall (decoration only).
export const PAINTINGS = [
  { x: 90, y: 88, w: 70, h: 48, hue: '#7a4a6e' },
  { x: 220, y: 88, w: 70, h: 48, hue: '#3f6e5a' },
  { x: 990, y: 88, w: 70, h: 48, hue: '#6e4a3f' },
  { x: 1120, y: 88, w: 70, h: 48, hue: '#4a5a7a' },
];

export function allBlockers() {
  return WALLS.concat(COVER);
}

export function inRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
