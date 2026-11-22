// The Gilded Fox — the thief. WASD or arrows to move, Shift to sneak
// (slower, half as noticeable), E to lift the idol from the vault, Space
// to drop a smoke pellet, click to toss a coin that draws a guard over.
// Gadgets are limited: every tool costs one of a small stash.
import { PLAYER } from './config.js';
import { collideCircle } from './vision.js';
import { VAULT, EXIT } from './level.js';
import { playCoin, playPickup, playSmoke, playStep } from './audio.js';

export function makePlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    facing: -Math.PI / 2,
    sneaking: false,
    moving: false,
    hasLoot: false,
    smokeLeft: PLAYER.smokeCharges,
    coinsLeft: PLAYER.coinCharges,
    stepTimer: 0,
  };
}

export function updatePlayer(p, dt, input, world) {
  const { blockers } = world;
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  p.sneaking = !!input.sneak;
  p.moving = mx !== 0 || my !== 0;
  if (p.moving) {
    const len = Math.hypot(mx, my);
    const speed = p.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
    const nx = p.x + (mx / len) * speed * dt;
    const ny = p.y + (my / len) * speed * dt;
    p.facing = Math.atan2(my, mx);
    const fixed = collideCircle(nx, ny, PLAYER.radius, blockers);
    p.x = fixed.x;
    p.y = fixed.y;
    p.stepTimer -= dt;
    if (p.stepTimer <= 0) {
      playStep();
      p.stepTimer = p.sneaking ? 0.55 : 0.34;
    }
  }
}

export function tryGrabLoot(p, world) {
  if (p.hasLoot) return false;
  const cx = VAULT.x + VAULT.w / 2;
  const cy = VAULT.y + VAULT.h / 2;
  if (Math.hypot(p.x - cx, p.y - cy) > PLAYER.grabRange) return false;
  p.hasLoot = true;
  playPickup();
  world.toast = 'GILDED IDOL SECURED — get to the GETAWAY door!';
  world.toastLeft = 3;
  return true;
}

export function tryDropSmoke(p, world) {
  if (p.smokeLeft <= 0) return false;
  p.smokeLeft -= 1;
  world.smokes.push({
    x: p.x,
    y: p.y,
    radius: PLAYER.smokeRadius,
    left: PLAYER.smokeSeconds,
  });
  playSmoke();
  return true;
}

export function tryThrowCoin(p, tx, ty, world) {
  if (p.coinsLeft <= 0) return false;
  const dx = tx - p.x;
  const dy = ty - p.y;
  const d = Math.hypot(dx, dy);
  if (d > PLAYER.coinRange * 1.4) return false;
  p.coinsLeft -= 1;
  world.coins.push({ x: tx, y: ty, left: 6 });
  playCoin();
  return true;
}

export function atExit(p) {
  return (
    p.x > EXIT.x - 6 && p.x < EXIT.x + EXIT.w + 6 &&
    p.y > EXIT.y - 6 && p.y < EXIT.y + EXIT.h + 6
  );
}
