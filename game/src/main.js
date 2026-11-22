// The Gilded Fox — boot and loop. Owns the world object, the keyboard and
// mouse, the title/caught/escaped states, and the ?shot= staging used for
// screenshots: each shot drops the thief, the guards and the alarm into a
// fixed moment of the heist and holds it still for the camera.
import { ALARM, VIEW } from './config.js';
import {
  CAMERA_MOUNTS,
  GUARD_ROUTES,
  PLAYER_SPAWN,
  allBlockers,
} from './level.js';
import { makeGuard, updateGuard } from './guards.js';
import { makeCamera, updateCamera } from './cameras.js';
import { makePlayer, tryDropSmoke, tryGrabLoot, tryThrowCoin, updatePlayer, atExit } from './player.js';
import { makeAlarm, updateAlarm, alarmState } from './alarm.js';
import { render } from './render.js';
import { playAlarmTick, playCaught, playEscape, toggleMute, unlockAudio } from './audio.js';
import { sendNearestGuardTo } from './guards.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

function freshWorld() {
  const guards = GUARD_ROUTES.map((route) => {
    const g = makeGuard(route);
    g.route = route;
    return g;
  });
  return {
    mode: shot ? 'playing' : 'title',
    player: makePlayer(PLAYER_SPAWN),
    guards,
    cameras: CAMERA_MOUNTS.map(makeCamera),
    alarm: makeAlarm(),
    blockers: allBlockers(),
    smokes: [],
    coins: [],
    elapsed: 0,
    toast: '',
    toastLeft: 0,
    frozen: !!shot, // a staged shot holds still for its screenshot
  };
}

let world = freshWorld();

function stageShot(name) {
  const p = world.player;
  if (name === 'start') {
    world.alarm.level = 8;
    world.alarm.peak = 8;
  } else if (name === 'loot') {
    p.x = 640;
    p.y = 215;
    world.alarm.level = 55;
    world.alarm.peak = 55;
    const rosa = world.guards[1];
    rosa.x = 700;
    rosa.y = 300;
    rosa.facing = Math.atan2(p.y - rosa.y, p.x - rosa.x);
    rosa.state = 'investigate';
    rosa.target = { x: 640, y: 215 };
  } else if (name === 'escape') {
    p.x = 1120;
    p.y = 640;
    p.hasLoot = true;
    world.alarm.level = 78;
    world.alarm.peak = 78;
    const vince = world.guards[2];
    vince.x = 1020;
    vince.y = 580;
    vince.facing = Math.atan2(p.y - vince.y, p.x - vince.x);
    vince.state = 'chase';
    vince.lastSeen = { x: p.x, y: p.y };
    world.smokes.push({ x: 640, y: 420, radius: 135, left: 4 });
  }
  world.toast = '';
  world.toastLeft = 0;
}

if (shot) stageShot(shot);

const input = { up: false, down: false, left: false, right: false, sneak: false };

function restart() {
  world = freshWorld();
  if (shot) stageShot(shot);
}

window.addEventListener('keydown', (e) => {
  unlockAudio();
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') input.up = true;
  if (k === 'arrowdown' || k === 's') input.down = true;
  if (k === 'arrowleft' || k === 'a') input.left = true;
  if (k === 'arrowright' || k === 'd') input.right = true;
  if (e.key === 'Shift') input.sneak = true;
  if (k === 'm') toggleMute();
  if (k === 'r' && (world.mode === 'caught' || world.mode === 'escaped')) restart();
  if (k === 'enter' && world.mode === 'title') world.mode = 'playing';
  if (k === 'e' && world.mode === 'playing') tryGrabLoot(world.player, world);
  if (k === ' ' && world.mode === 'playing') {
    e.preventDefault();
    tryDropSmoke(world.player, world);
  }
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') input.up = false;
  if (k === 'arrowdown' || k === 's') input.down = false;
  if (k === 'arrowleft' || k === 'a') input.left = false;
  if (k === 'arrowright' || k === 'd') input.right = false;
  if (e.key === 'Shift') input.sneak = false;
});

canvas.addEventListener('mousedown', (e) => {
  unlockAudio();
  if (world.mode !== 'playing') return;
  const rect = canvas.getBoundingClientRect();
  const tx = ((e.clientX - rect.left) / rect.width) * VIEW.width;
  const ty = ((e.clientY - rect.top) / rect.height) * VIEW.height;
  if (tryThrowCoin(world.player, tx, ty, world)) {
    sendNearestGuardTo(world.guards, tx, ty);
  }
});

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (world.mode === 'playing' && !world.frozen) {
    world.elapsed += dt;
    updatePlayer(world.player, dt, input, world);
    for (const g of world.guards) updateGuard(g, dt, world);
    for (const c of world.cameras) updateCamera(c, dt, world);
    updateAlarm(world.alarm, dt, world);
    for (const s of world.smokes) s.left -= dt;
    world.smokes = world.smokes.filter((s) => s.left > 0);
    for (const c of world.coins) c.left -= dt;
    world.coins = world.coins.filter((c) => c.left > 0);
    if (world.toastLeft > 0) world.toastLeft -= dt;
    if (alarmState(world.alarm) === 'critical') playAlarmTick(now / 1000);
    const touching = world.guards.some(
      (g) => Math.hypot(g.x - world.player.x, g.y - world.player.y) < 27,
    );
    if (world.alarm.level >= ALARM.max || touching) {
      world.mode = 'caught';
      playCaught();
    } else if (world.player.hasLoot && atExit(world.player)) {
      world.mode = 'escaped';
      playEscape();
    }
  }
  render(ctx, world);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
