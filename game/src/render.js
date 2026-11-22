// The Gilded Fox — everything the eye sees: the gallery floor, the vault,
// the getaway door, the sweeping vision cones, the thief and the guards,
// and the HUD with its alarm meter. One frame must tell the whole heist:
// thief, guards, cones, cameras, loot and alarm, all at once.
import { ALARM, CAMERA, GUARD, PALETTE, VIEW } from './config.js';
import {
  CAMERA_MOUNTS,
  COVER,
  ENTRANCE,
  EXIT,
  PAINTINGS,
  ROPES,
  VAULT,
  WALLS,
} from './level.js';
import { alarmState } from './alarm.js';

function drawCone(g, x, y, facing, halfAngle, range, fill, hot) {
  g.save();
  g.beginPath();
  g.moveTo(x, y);
  g.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  g.closePath();
  g.fillStyle = hot ? PALETTE.coneGuardHot : fill;
  g.fill();
  g.strokeStyle = hot ? 'rgba(255,120,80,0.5)' : 'rgba(255,220,120,0.35)';
  g.lineWidth = 1.5;
  g.stroke();
  g.restore();
}

function drawFloor(g) {
  const tile = 64;
  for (let y = VIEW.hudHeight; y < VIEW.height; y += tile) {
    for (let x = 0; x < VIEW.width; x += tile) {
      const odd = ((x + y) / tile) % 2 === 0;
      g.fillStyle = odd ? PALETTE.floorA : PALETTE.floorB;
      g.fillRect(x, y, tile, tile);
    }
  }
  // Red carpet runner from the entrance to the vault.
  g.fillStyle = PALETTE.carpet;
  g.fillRect(596, 180, 88, 500);
  g.fillStyle = PALETTE.carpetEdge;
  g.fillRect(592, 180, 4, 500);
  g.fillRect(684, 180, 4, 500);
}

function drawWalls(g) {
  for (const w of WALLS) {
    g.fillStyle = PALETTE.wall;
    g.fillRect(w.x, w.y, w.w, w.h);
    g.fillStyle = PALETTE.wallTop;
    if (w.h <= 16) g.fillRect(w.x, w.y, w.w, 3);
    else g.fillRect(w.x, w.y, 3, w.h);
  }
  for (const p of PAINTINGS) {
    g.fillStyle = PALETTE.goldDim;
    g.fillRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
    g.fillStyle = p.hue;
    g.fillRect(p.x, p.y, p.w, p.h);
    g.fillStyle = 'rgba(242,232,213,0.85)';
    g.beginPath();
    g.arc(p.x + p.w / 2, p.y + p.h / 2, 9, 0, Math.PI * 2);
    g.fill();
  }
  // Warm wall lamps.
  for (const lx of [150, 640, 1130]) {
    const grad = g.createRadialGradient(lx, 84, 4, lx, 84, 70);
    grad.addColorStop(0, 'rgba(255, 200, 110, 0.35)');
    grad.addColorStop(1, 'rgba(255, 200, 110, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(lx, 84, 70, 0, Math.PI * 2);
    g.fill();
  }
}

function drawCover(g) {
  for (const c of COVER) {
    if (c.kind === 'case') {
      g.fillStyle = PALETTE.goldDim;
      g.fillRect(c.x - 3, c.y - 3, c.w + 6, c.h + 6);
      g.fillStyle = '#1d2f4d';
      g.fillRect(c.x, c.y, c.w, c.h);
      g.fillStyle = 'rgba(160, 200, 255, 0.25)';
      g.fillRect(c.x + 4, c.y + 4, c.w - 8, 14);
      g.fillStyle = PALETTE.gold;
      g.beginPath();
      g.moveTo(c.x + c.w / 2, c.y + 16);
      g.lineTo(c.x + c.w / 2 + 12, c.y + c.h / 2 + 8);
      g.lineTo(c.x + c.w / 2 - 12, c.y + c.h / 2 + 8);
      g.closePath();
      g.fill();
    } else if (c.kind === 'fountain') {
      g.fillStyle = '#2f6e6a';
      g.beginPath();
      g.arc(c.x + c.w / 2, c.y + c.h / 2, 40, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(180, 240, 230, 0.6)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(c.x + c.w / 2, c.y + c.h / 2, 28, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(c.x + c.w / 2, c.y + c.h / 2, 16, 0, Math.PI * 2);
      g.stroke();
    } else {
      g.fillStyle = '#8b8fa3';
      g.fillRect(c.x, c.y, c.w, c.h);
      g.fillStyle = '#b9bdcf';
      g.fillRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12);
    }
  }
  for (const r of ROPES) {
    g.strokeStyle = PALETTE.red;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(r.x1, r.y1);
    g.lineTo(r.x2, r.y2);
    g.stroke();
    g.fillStyle = PALETTE.gold;
    for (const [px, py] of [[r.x1, r.y1], [r.x2, r.y2]]) {
      g.beginPath();
      g.arc(px, py, 5, 0, Math.PI * 2);
      g.fill();
    }
  }
}

function drawVault(g, hasLoot) {
  g.save();
  g.shadowColor = PALETTE.gold;
  g.shadowBlur = hasLoot ? 6 : 22;
  g.fillStyle = hasLoot ? '#6e5a26' : PALETTE.gold;
  g.fillRect(VAULT.x, VAULT.y, VAULT.w, VAULT.h);
  g.restore();
  g.fillStyle = '#3a2c10';
  g.beginPath();
  g.arc(VAULT.x + VAULT.w / 2, VAULT.y + VAULT.h / 2, 16, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = PALETTE.cream;
  g.font = 'bold 13px sans-serif';
  g.textAlign = 'center';
  g.fillText(hasLoot ? 'EMPTY' : 'VAULT', VAULT.x + VAULT.w / 2, VAULT.y - 8);
}

function drawExit(g, hasLoot) {
  const pulse = hasLoot ? 0.55 + 0.35 * Math.sin(Date.now() / 180) : 0.25;
  g.fillStyle = `rgba(46, 204, 113, ${pulse})`;
  g.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  g.strokeStyle = PALETTE.green;
  g.lineWidth = 3;
  g.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  g.fillStyle = PALETTE.cream;
  g.font = 'bold 15px sans-serif';
  g.textAlign = 'center';
  g.fillText('GETAWAY →', EXIT.x + EXIT.w / 2, EXIT.y + 30);
  g.fillStyle = PALETTE.cream;
  g.font = '11px sans-serif';
  g.fillText('ENTRANCE', ENTRANCE.x + ENTRANCE.w / 2, ENTRANCE.y + 38);
}

function drawGuard(g, guard) {
  const hot = guard.state === 'chase';
  drawCone(
    g, guard.x, guard.y, guard.facing,
    GUARD.sightHalfAngle, GUARD.sightRange,
    PALETTE.coneGuard, hot,
  );
  g.fillStyle = '#1c2438';
  g.beginPath();
  g.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = PALETTE.gold;
  g.lineWidth = 2;
  g.stroke();
  // Cap brim shows which way the guard faces.
  g.fillStyle = '#31405e';
  g.beginPath();
  g.arc(
    guard.x + Math.cos(guard.facing) * 8,
    guard.y + Math.sin(guard.facing) * 8,
    6, 0, Math.PI * 2,
  );
  g.fill();
  const mark = guard.state === 'chase' ? '!' : guard.state === 'investigate' || guard.state === 'scan' ? '?' : '';
  if (mark) {
    g.fillStyle = hot ? '#ff5a3c' : '#ffd250';
    g.font = 'bold 20px sans-serif';
    g.textAlign = 'center';
    g.fillText(mark, guard.x, guard.y - 22);
  }
  g.fillStyle = 'rgba(242,232,213,0.8)';
  g.font = '11px sans-serif';
  g.textAlign = 'center';
  g.fillText(guard.name, guard.x, guard.y + GUARD.radius + 13);
}

function drawCamera(g, cam) {
  drawCone(
    g, cam.x, cam.y, cam.facing,
    CAMERA.sightHalfAngle, CAMERA.sightRange,
    PALETTE.coneCamera, cam.seenNow,
  );
  g.fillStyle = '#222a40';
  g.fillRect(cam.x - 10, cam.y - 8, 20, 14);
  g.fillStyle = cam.seenNow ? '#ff3b30' : PALETTE.red;
  g.beginPath();
  g.arc(cam.x, cam.y + 8, 4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(242,232,213,0.7)';
  g.font = '10px sans-serif';
  g.textAlign = 'left';
  g.fillText(cam.name, cam.x + 14, cam.y + 2);
}

function drawPlayer(g, p) {
  g.save();
  // Gold ring marks the thief at a glance, even shrunk small.
  g.strokeStyle = 'rgba(232, 182, 76, 0.9)';
  g.lineWidth = 2.5;
  g.beginPath();
  g.arc(p.x, p.y, 19, 0, Math.PI * 2);
  g.stroke();
  // Cloak: a dark triangle trailing behind the direction of travel.
  const bx = p.x - Math.cos(p.facing) * 10;
  const by = p.y - Math.sin(p.facing) * 10;
  g.fillStyle = '#1a2036';
  g.beginPath();
  g.moveTo(bx + Math.cos(p.facing) * 14, by + Math.sin(p.facing) * 14);
  g.lineTo(bx + Math.cos(p.facing + 2.4) * 13, by + Math.sin(p.facing + 2.4) * 13);
  g.lineTo(bx + Math.cos(p.facing - 2.4) * 13, by + Math.sin(p.facing - 2.4) * 13);
  g.closePath();
  g.fill();
  g.fillStyle = '#10131f';
  g.beginPath();
  g.arc(p.x, p.y, 13, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = PALETTE.gold;
  g.lineWidth = 2;
  g.stroke();
  // Hood point shows facing.
  g.fillStyle = PALETTE.gold;
  g.beginPath();
  g.arc(
    p.x + Math.cos(p.facing) * 9,
    p.y + Math.sin(p.facing) * 9,
    4, 0, Math.PI * 2,
  );
  g.fill();
  g.restore();
  if (p.sneaking) {
    g.fillStyle = 'rgba(242,232,213,0.75)';
    g.font = '11px sans-serif';
    g.textAlign = 'center';
    g.fillText('sneaking', p.x, p.y + 30);
  }
}

function drawEffects(g, world) {
  for (const s of world.smokes) {
    // A soft cloud of several overlapping puffs, not one flat disc.
    const puffs = [
      [0, 0, 0.62], [-44, 20, 0.42], [46, -16, 0.4],
      [-24, -34, 0.34], [30, 30, 0.32], [0, -48, 0.28],
    ];
    for (const [dx, dy, a] of puffs) {
      const grad = g.createRadialGradient(
        s.x + dx, s.y + dy, 4, s.x + dx, s.y + dy, s.radius * 0.55,
      );
      grad.addColorStop(0, `rgba(205, 210, 220, ${a})`);
      grad.addColorStop(1, 'rgba(205, 210, 220, 0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(s.x + dx, s.y + dy, s.radius * 0.55, 0, Math.PI * 2);
      g.fill();
    }
  }
  for (const c of world.coins) {
    g.fillStyle = PALETTE.gold;
    g.beginPath();
    g.arc(c.x, c.y, 6, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#fff2c0';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(c.x, c.y, 6, 0, Math.PI * 2);
    g.stroke();
  }
}

function drawHud(g, world) {
  const { alarm, player, elapsed } = world;
  g.fillStyle = PALETTE.ink;
  g.fillRect(0, 0, VIEW.width, VIEW.hudHeight);
  g.fillStyle = PALETTE.goldDim;
  g.fillRect(0, VIEW.hudHeight - 2, VIEW.width, 2);

  // Critical alarm: the screen edges pulse red so the danger is felt.
  if (alarmState(alarm) === 'critical' && world.mode === 'playing') {
    const pulse = 0.10 + 0.06 * Math.sin(Date.now() / 160);
    const edge = g.createLinearGradient(0, VIEW.hudHeight, 0, VIEW.height);
    edge.addColorStop(0, `rgba(255, 59, 48, ${pulse})`);
    edge.addColorStop(0.12, 'rgba(255, 59, 48, 0)');
    edge.addColorStop(0.88, 'rgba(255, 59, 48, 0)');
    edge.addColorStop(1, `rgba(255, 59, 48, ${pulse})`);
    g.fillStyle = edge;
    g.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
  }

  const state = alarmState(alarm);
  const barX = 92;
  const barW = 280;
  g.fillStyle = PALETTE.cream;
  g.font = 'bold 15px sans-serif';
  g.textAlign = 'left';
  g.fillText('ALARM', 16, 26);
  g.fillStyle = '#232a42';
  g.fillRect(barX, 12, barW, 20);
  const fillColor =
    state === 'critical' ? '#ff3b30' : state === 'tense' ? '#ff9f1c' : '#2ecc71';
  g.fillStyle = fillColor;
  g.fillRect(barX, 12, (barW * alarm.level) / 100, 20);
  g.strokeStyle = PALETTE.goldDim;
  g.lineWidth = 1.5;
  g.strokeRect(barX, 12, barW, 20);
  g.fillStyle = PALETTE.cream;
  g.font = 'bold 14px sans-serif';
  g.fillText(`${Math.round(alarm.level)}%`, barX + barW + 10, 27);
  g.font = '12px sans-serif';
  g.fillStyle = state === 'critical' ? '#ff6b5e' : 'rgba(242,232,213,0.7)';
  g.fillText(state.toUpperCase(), 16, 50);

  g.textAlign = 'center';
  g.fillStyle = PALETTE.cream;
  g.font = 'bold 15px sans-serif';
  const objective = player.hasLoot
    ? 'LOOT SECURED — reach the GETAWAY door!'
    : 'Steal the Gilded Idol from the VAULT';
  g.fillText(objective, VIEW.width / 2, 27);
  g.font = '12px sans-serif';
  g.fillStyle = 'rgba(242,232,213,0.7)';
  g.fillText('WASD move · Shift sneak · E grab · Space smoke · Click coin · R restart', VIEW.width / 2, 48);

  g.textAlign = 'right';
  g.font = 'bold 14px sans-serif';
  g.fillStyle = player.hasLoot ? PALETTE.gold : 'rgba(242,232,213,0.6)';
  g.fillText(player.hasLoot ? '⬡ LOOT: STOLEN' : '⬡ LOOT: IN VAULT', VIEW.width - 16, 22);
  g.font = '13px sans-serif';
  g.fillStyle = PALETTE.cream;
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60).toString().padStart(2, '0');
  g.fillText(`◉ smoke ×${player.smokeLeft}   ● coin ×${player.coinsLeft}   ${mins}:${secs}`, VIEW.width - 16, 46);

  if (world.toastLeft > 0) {
    g.textAlign = 'center';
    g.fillStyle = 'rgba(12,16,32,0.85)';
    const tw = 560;
    g.fillRect(VIEW.width / 2 - tw / 2, VIEW.hudHeight + 10, tw, 30);
    g.fillStyle = PALETTE.gold;
    g.font = 'bold 15px sans-serif';
    g.fillText(world.toast, VIEW.width / 2, VIEW.hudHeight + 30);
  }
}

function drawOverlay(g, world) {
  const cx = VIEW.width / 2;
  if (world.mode === 'title') {
    g.fillStyle = 'rgba(8, 11, 22, 0.82)';
    g.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
    g.textAlign = 'center';
    g.fillStyle = PALETTE.gold;
    g.font = 'bold 64px Georgia, serif';
    g.fillText('THE GILDED FOX', cx, 300);
    g.fillStyle = PALETTE.cream;
    g.font = '20px Georgia, serif';
    g.fillText('A one-night museum heist', cx, 340);
    g.font = '16px sans-serif';
    g.fillStyle = 'rgba(242,232,213,0.85)';
    g.fillText('Slip past the guards, dodge the cameras, lift the Gilded Idol,', cx, 400);
    g.fillText('and walk out the GETAWAY door before the alarm hits 100%.', cx, 426);
    g.fillStyle = PALETTE.gold;
    g.font = 'bold 18px sans-serif';
    g.fillText('Press ENTER to begin', cx, 490);
    return;
  }
  if (world.mode === 'caught') {
    g.fillStyle = 'rgba(60, 8, 8, 0.72)';
    g.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
    g.textAlign = 'center';
    g.fillStyle = '#ff6b5e';
    g.font = 'bold 64px Georgia, serif';
    g.fillText('BUSTED!', cx, 320);
    g.fillStyle = PALETTE.cream;
    g.font = '19px sans-serif';
    g.fillText('The alarm hit 100% — the night watch closed in.', cx, 366);
    g.fillText(`Peak alarm ${Math.round(world.alarm.peak)}% · survived ${Math.round(world.elapsed)}s`, cx, 396);
    g.fillStyle = PALETTE.gold;
    g.font = 'bold 18px sans-serif';
    g.fillText('Press R to run it again', cx, 450);
    return;
  }
  if (world.mode === 'escaped') {
    g.fillStyle = 'rgba(6, 40, 24, 0.78)';
    g.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
    g.textAlign = 'center';
    g.fillStyle = '#2ecc71';
    g.font = 'bold 58px Georgia, serif';
    g.fillText('CLEAN GETAWAY!', cx, 320);
    g.fillStyle = PALETTE.cream;
    g.font = '19px sans-serif';
    g.fillText('The Gilded Idol is yours. The Fox vanishes into the night.', cx, 366);
    const mins = Math.floor(world.elapsed / 60);
    const secs = Math.floor(world.elapsed % 60).toString().padStart(2, '0');
    g.fillText(`Time ${mins}:${secs} · peak alarm ${Math.round(world.alarm.peak)}% · alarms tripped ${world.alarm.trips}`, cx, 396);
    g.fillStyle = PALETTE.gold;
    g.font = 'bold 18px sans-serif';
    g.fillText('Press R to run it again', cx, 450);
  }
}

export function render(g, world) {
  g.clearRect(0, 0, VIEW.width, VIEW.height);
  drawFloor(g);
  drawWalls(g);
  drawCover(g);
  drawVault(g, world.player.hasLoot);
  drawExit(g, world.player.hasLoot);
  for (const cam of world.cameras) drawCamera(g, cam);
  for (const guard of world.guards) drawGuard(g, guard);
  drawEffects(g, world);
  drawPlayer(g, world.player);
  drawHud(g, world);
  drawOverlay(g, world);
}
