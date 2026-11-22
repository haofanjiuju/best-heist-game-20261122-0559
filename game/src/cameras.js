// The Gilded Fox — the wall cameras. Fixed mounts that sweep their cones
// back and forth on a slow, readable rhythm. A camera never chases, but
// standing in its red cone feeds the alarm meter steadily.
import { CAMERA } from './config.js';
import { canSpot } from './vision.js';

export function makeCamera(mount) {
  return {
    name: mount.name,
    x: mount.x,
    y: mount.y,
    baseAngle: mount.baseAngle,
    phase: mount.x < 640 ? 0 : Math.PI, // the two cameras sweep out of phase
    facing: mount.baseAngle,
    seenNow: false,
  };
}

export function updateCamera(cam, dt, world) {
  cam.phase += (Math.PI * 2 * dt) / (CAMERA.sweepSeconds * 2);
  cam.facing =
    cam.baseAngle + Math.sin(cam.phase) * CAMERA.sweepHalfAngle;
  const blinded = world.smokes.some(
    (s) => Math.hypot(cam.x - s.x, cam.y - s.y) < s.radius,
  );
  cam.seenNow =
    !blinded &&
    canSpot(
      cam.x, cam.y, cam.facing,
      CAMERA.sightHalfAngle, CAMERA.sightRange,
      world.player.x, world.player.y, world.blockers,
    );
}
