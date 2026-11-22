// The Gilded Fox — the hand-in program (Node 22, standard library only).
// The game is plain static files under game/ (index.html plus its ES
// modules, no library, no network request) and three screenshots. This
// program hands it in: it mirrors game/ and screenshots/ from beside this
// file into /output and writes /output/dossier.json, the summary the judge
// reads, with the vendored make.fun library.
//
// Serve the game locally with `node serve.ts` (or any static server over
// game/) and open it in a desktop browser. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Mirror one directory tree by hand: read each entry, copy files, recurse
// into subdirectories. Plain files only — the gate refuses symlinks.
function mirrorTree(fromDir, toDir) {
  mkdirSync(toDir, { recursive: true });
  for (const name of readdirSync(fromDir)) {
    const from = join(fromDir, name);
    const to = join(toDir, name);
    const st = statSync(from);
    if (st.isDirectory()) mirrorTree(from, to);
    else if (st.isFile()) copyFileSync(from, to);
  }
}

mkdirSync(out, { recursive: true });
mirrorTree(join(here, 'game'), join(out, 'game'));
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  mirrorTree(join(here, 'screenshots'), join(out, 'screenshots'));
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB
// of game files, in all, or a path under game/ over 1000 bytes: game/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// One line on stdout so the build log shows what was handed in.
console.log(
  `The Gilded Fox handed in: game/ + ${readdirSync(join(out, 'screenshots')).length} screenshot(s), dossier ${Buffer.byteLength(dossier, 'utf8')} bytes -> ${out}`,
);
