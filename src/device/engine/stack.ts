import { load, save } from '../storage';
import { reducedMotion } from '../refs';
import { click, vibe } from './audio';
import { drawEndCard } from './endcard';

/**
 * Stack, played with the center button alone. A block slides across the top of the tower; each
 * press drops it, and whatever hangs over the block below is cut off and falls away, so the
 * blocks get narrower. A drop within a few pixels counts as perfect and keeps its width. Miss
 * the tower entirely and it's over. The board is a 656×560 canvas (2× the screen), like Brick.
 */
type Mode = 'ready' | 'play' | 'over';
interface Block {
  x: number;
  w: number;
  /** When it landed perfectly (for a flash), or 0. */
  perfectAt: number;
}
interface Piece {
  x: number;
  y: number;
  w: number;
  vy: number;
  at: number;
}

const W = 656;
const UI = '"Geist Variable", system-ui, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, monospace';
const TICK = 1000 / 60;
const H = 34;
/** The base block's top edge, on the board. */
const FLOOR = 470;
/** The top of the tower stays at least this far down; above it the view scrolls. */
const TOP = 200;
/** Close enough to count as perfect, in board pixels. */
const SNAP = 6;
/** Anything narrower than this left on the tower counts as a miss (it would be hard to see). */
const MIN = 18;
/** The base block's width. */
const BASE = 320;

/** Exported for dev hooks and tests. */
export const game = {
  tower: [] as Block[],
  /** The sliding block: its left edge, width and speed (board pixels per step). */
  slide: { x: 0, w: BASE, v: 4 },
  pieces: [] as Piece[],
  /** How far the view has scrolled up, eased toward `cameraTarget`. */
  camera: 0,
  cameraTarget: 0,
  mode: 'ready' as Mode,
  best: 0,
  newBest: false,
  overAt: 0,
};

let raf = 0;
let canvas: HTMLCanvasElement | null = null;

const score = () => game.tower.length - 1;
/** The board y of a block's top edge by its height in the tower (0 is the base). */
const rowY = (i: number) => FLOOR - i * H;

export function reset() {
  game.tower = [{ x: (W - BASE) / 2, w: BASE, perfectAt: 0 }];
  game.pieces = [];
  game.camera = game.cameraTarget = 0;
  game.mode = 'ready';
  game.newBest = false;
  game.best = load('stackBest', 0);
  next();
}

/** The next block starts at one edge, alternating sides, a little faster each time. */
function next() {
  const top = game.tower.at(-1)!;
  const fromLeft = game.tower.length % 2 === 1;
  const v = Math.min(9, 3.6 + score() * 0.18);
  game.slide = { x: fromLeft ? 0 : W - top.w, w: top.w, v: fromLeft ? v : -v };
  game.cameraTarget = Math.max(0, TOP - rowY(game.tower.length));
}

/** The center button (or a tap on the screen). */
export function press() {
  if (game.mode === 'over') {
    // a beat to read the end card, so a flurry of presses doesn't restart past it
    if (performance.now() - game.overAt < 700) return;
    reset();
    click(2);
    return;
  }
  if (game.mode === 'ready') game.mode = 'play';
  drop();
}

function drop() {
  const top = game.tower.at(-1)!;
  const s = game.slide;
  const y = rowY(game.tower.length);
  const now = performance.now();
  // a near miss snaps into place and keeps its width
  if (Math.abs(s.x - top.x) <= SNAP) {
    game.tower.push({ x: top.x, w: top.w, perfectAt: now });
    click(2);
    vibe(14);
    return next();
  }
  const left = Math.max(s.x, top.x);
  const right = Math.min(s.x + s.w, top.x + top.w);
  if (right - left < MIN) {
    // missed the tower (or would leave a sliver too thin to see): the whole block falls
    game.pieces.push({ x: s.x, y, w: s.w, vy: 0, at: now });
    return end();
  }
  // the overhang is cut off and falls away
  const cutX = s.x < top.x ? s.x : right;
  game.pieces.push({ x: cutX, y, w: s.w - (right - left), vy: 0, at: now });
  game.tower.push({ x: left, w: right - left, perfectAt: 0 });
  click(1.5);
  vibe(6);
  next();
}

function end() {
  game.mode = 'over';
  game.overAt = performance.now();
  if (score() > game.best) {
    game.best = score();
    game.newBest = true;
    save('stackBest', game.best);
  }
  click(2);
  vibe(20);
}

export function start(el: HTMLCanvasElement) {
  canvas = el;
  reset();
  cancelAnimationFrame(raf);
  let last = performance.now();
  let behind = 0;
  const loop = (now = last) => {
    if (!canvas) return;
    behind = Math.min(behind + now - last, TICK * 4);
    last = now;
    while (behind >= TICK) {
      step();
      behind -= TICK;
    }
    draw();
    raf = requestAnimationFrame(loop);
  };
  loop();
}

export function stop() {
  canvas = null;
  cancelAnimationFrame(raf);
}

/** Dev hook: show the end card. */
export function showEnd() {
  for (let i = 0; i < 12; i++)
    game.tower.push({ x: (W - BASE) / 2 + i * 4, w: BASE - i * 12, perfectAt: 0 });
  end();
}

function step() {
  const s = game.slide;
  if (game.mode !== 'over') {
    // the block bounces between the board's edges
    s.x += s.v;
    if (s.x > W - s.w && s.v > 0) s.v = -s.v;
    if (s.x < 0 && s.v < 0) s.v = -s.v;
  }
  game.camera += (game.cameraTarget - game.camera) * (reducedMotion() ? 1 : 0.12);
  for (const p of game.pieces) {
    p.vy += 0.9;
    p.y += p.vy;
  }
  game.pieces = game.pieces.filter((p) => p.y - game.camera < 640);
}

function draw() {
  if (!canvas) return;
  const x = canvas.getContext('2d')!;
  const css = getComputedStyle(canvas);
  const ink = css.getPropertyValue('--scrInk').trim();
  const sel = css.getPropertyValue('--sel').trim();
  const now = performance.now();
  x.clearRect(0, 0, canvas.width, canvas.height);
  x.textBaseline = 'middle';

  // score on the left, best on the right, a hairline under both (Brick's header)
  x.fillStyle = ink;
  x.textAlign = 'left';
  x.font = `600 30px ${UI}`;
  x.fillText(String(score()), 24, 41);
  x.textAlign = 'right';
  x.globalAlpha = 0.4;
  x.font = `500 19px ${MONO}`;
  x.fillText(`best ${game.best}`, 634, 42);
  x.globalAlpha = 0.1;
  x.fillRect(20, 68, 616, 2);

  // the board below the header scrolls with the tower
  x.save();
  x.beginPath();
  x.rect(0, 70, W, 490);
  x.clip();
  const cam = game.camera;
  const block = (bx: number, by: number, bw: number, alpha: number, color = sel) => {
    x.globalAlpha = alpha;
    x.fillStyle = color;
    x.beginPath();
    x.roundRect(bx, by + cam, bw, H - 4, 6);
    x.fill();
  };
  // the tower fades a little with height, in the theme's selection color; the base is ink
  game.tower.forEach((b, i) => {
    const y = rowY(i);
    if (y + cam > 600) return;
    block(b.x, y, b.w, i === 0 ? 0.85 : 0.55 + 0.45 * ((i % 6) / 5), i === 0 ? ink : sel);
    // a perfect drop flashes a ring around the block
    const p = b.perfectAt ? (now - b.perfectAt) / 420 : 1;
    if (p < 1) {
      x.globalAlpha = 0.5 * (1 - p);
      x.strokeStyle = sel;
      x.lineWidth = 3;
      const g = p * 10;
      x.beginPath();
      x.roundRect(b.x - g, y + cam - g, b.w + g * 2, H - 4 + g * 2, 8);
      x.stroke();
    }
  });
  for (const p of game.pieces) block(p.x, p.y, p.w, 0.45 * Math.max(0, 1 - (now - p.at) / 700));
  if (game.mode !== 'over') block(game.slide.x, rowY(game.tower.length), game.slide.w, 1);
  x.restore();

  if (game.mode === 'ready') {
    // how to play, before the first drop
    x.globalAlpha = 0.8;
    x.fillStyle = ink;
    x.textAlign = 'center';
    x.font = `500 23px ${UI}`;
    x.fillText('Land each block on the tower.', W / 2, 140);
    x.fillText('Anything hanging over gets cut off.', W / 2, 172);
    x.globalAlpha = 0.55;
    x.font = `500 19px ${MONO}`;
    x.fillText('press the center or tap to drop', W / 2, 222);
  }

  if (game.mode === 'over')
    drawEndCard(x, css, {
      title: game.newBest ? 'New best' : 'Toppled',
      value: String(score()),
      unit: score() === 1 ? 'block high' : 'blocks high',
      note: game.newBest ? undefined : `best ${game.best}`,
      at: game.overAt,
    });
  x.globalAlpha = 1;
}
