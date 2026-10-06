import { click, vibe } from './audio';

/**
 * Brick, steered by the wheel. The board is a 656×560 canvas (2× the screen).
 * Modes: ready (ball on the paddle), play, over (lost every ball), won (cleared every brick).
 * From over or won, the center resets to a fresh board; the next press launches.
 */
type Mode = 'ready' | 'play' | 'over' | 'won';
interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  row: number;
  /** When it was hit (for the pop-and-fade), or 0 while standing. */
  hitAt: number;
}

const W = 656;
const UI = '"Geist Variable", system-ui, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, monospace';
const ROW_ALPHA = [1, 0.8, 0.62, 0.46, 0.32];
/** One physics step, in ms. */
const TICK = 1000 / 60;
/** The fastest the ball moves sideways per step (it falls at 8). */
const MAX_VX = 8;

const game = {
  paddle: 328,
  target: 328,
  ball: { x: 328, y: 490, vx: 0, vy: 0, stuck: true },
  bricks: [] as Brick[],
  score: 0,
  lives: 3,
  mode: 'ready' as Mode,
  trail: [] as [number, number][],
  message: '',
  /** The win also unlocked the Clear finish for the first time. */
  unlockedNow: false,
};

let raf = 0;
let canvas: HTMLCanvasElement | null = null;
let onWin: () => boolean = () => false;

export function reset() {
  game.paddle = game.target = 328;
  game.ball = { x: 328, y: 490, vx: 0, vy: 0, stuck: true };
  game.trail = [];
  game.bricks = [];
  for (let row = 0; row < 5; row++)
    for (let c = 0; c < 8; c++)
      game.bricks.push({ x: 20 + c * 78, y: 86 + row * 30, w: 70, h: 20, row, hitAt: 0 });
  game.score = 0;
  game.lives = 3;
  game.mode = 'ready';
  game.message = 'press the center to launch';
}

/** The center button. */
export function press() {
  if (game.mode === 'over' || game.mode === 'won') {
    reset();
    click(2);
    return;
  }
  if (game.ball.stuck) {
    Object.assign(game.ball, { stuck: false, vx: (Math.random() - 0.5) * 7, vy: -8 });
    game.mode = 'play';
    game.message = '';
    click(2);
  }
}

/** Spinning steers the paddle; it glides toward where it was spun. */
export function steer(dx: number) {
  game.target += dx;
}

/** `win` unlocks the reward and reports whether it was new. */
export function start(el: HTMLCanvasElement, win: () => boolean) {
  canvas = el;
  onWin = win;
  reset();
  cancelAnimationFrame(raf);
  // the physics runs in fixed 60Hz steps, so the ball is the same speed on 60Hz and 120Hz screens
  let last = performance.now();
  let behind = 0;
  const loop = (now = last) => {
    if (!canvas) return;
    // after a stall (a background tab), catch up at most a few steps instead of jumping
    behind = Math.min(behind + now - last, TICK * 4);
    last = now;
    while (behind >= TICK) {
      step();
      behind -= TICK;
    }
    draw();
    raf = requestAnimationFrame(loop);
  };
  step();
  loop();
}

export function stop() {
  canvas = null;
  cancelAnimationFrame(raf);
}

/** Dev hook: show an end card. */
export function showEnd(mode: 'over' | 'won') {
  game.mode = mode;
  game.score = mode === 'won' ? 40 : 23;
  game.unlockedNow = true;
  game.message = '';
}

function step() {
  const b = game.ball;
  game.target = Math.max(56, Math.min(600, game.target));
  game.paddle += (game.target - game.paddle) * 0.35;
  if (game.mode === 'over' || game.mode === 'won') return;
  if (b.stuck) {
    b.x = game.paddle;
    b.y = 490;
    game.trail = [];
    return;
  }
  game.trail.push([b.x, b.y]);
  if (game.trail.length > 6) game.trail.shift();

  b.x += b.vx;
  b.y += b.vy;
  if (b.x < 10 || b.x > 646) {
    b.vx *= -1;
    b.x = Math.max(10, Math.min(646, b.x));
  }
  if (b.y < 78) b.vy = Math.abs(b.vy);
  if (b.vy > 0 && b.y > 492 && b.y < 512 && Math.abs(b.x - game.paddle) < 62) {
    b.vy = -Math.abs(b.vy);
    // hitting off-center angles the ball, but it never gets faster sideways than it falls
    b.vx = Math.max(-MAX_VX, Math.min(MAX_VX, b.vx + (b.x - game.paddle) * 0.08));
    click();
  }
  if (b.y > 575) {
    b.stuck = true;
    game.lives--;
    vibe(20);
    if (game.lives <= 0) {
      game.mode = 'over';
      game.message = '';
      click(2);
    } else game.message = 'press the center to launch';
  }
  for (const k of game.bricks) {
    if (!k.hitAt && b.x > k.x - 8 && b.x < k.x + k.w + 8 && b.y > k.y - 8 && b.y < k.y + k.h + 8) {
      k.hitAt = performance.now();
      b.vy *= -1;
      game.score++;
      click(1.5);
      vibe(6);
      break;
    }
  }
  if (game.bricks.every((k) => k.hitAt)) {
    game.unlockedNow = onWin();
    game.mode = 'won';
    b.stuck = true;
    game.message = '';
    vibe(30);
  }
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

  // lives on the left, score on the right, a hairline under both
  for (let i = 0; i < 3; i++) {
    x.fillStyle = ink;
    x.globalAlpha = i < game.lives ? 0.85 : 0.15;
    x.beginPath();
    x.arc(30 + i * 24, 40, 7, 0, 7);
    x.fill();
  }
  x.globalAlpha = 1;
  x.textAlign = 'right';
  x.font = `600 30px ${UI}`;
  x.fillStyle = ink;
  x.fillText(String(game.score), 580, 41);
  x.globalAlpha = 0.4;
  x.font = `500 19px ${MONO}`;
  x.fillText('/ 40', 634, 42);
  x.globalAlpha = 0.1;
  x.fillRect(20, 68, 616, 2);

  // bricks in the theme's selection color, fading by row; hit bricks pop and fade
  for (const k of game.bricks) {
    let p = 0;
    if (k.hitAt) {
      p = (now - k.hitAt) / 220;
      if (p >= 1) continue;
    }
    x.globalAlpha = ROW_ALPHA[k.row]! * (1 - p);
    x.fillStyle = sel;
    const grow = p * 6;
    x.beginPath();
    x.roundRect(k.x - grow, k.y - grow / 2, k.w + grow * 2, k.h + grow, 6);
    x.fill();
  }

  // ball trail, ball, paddle
  game.trail.forEach(([tx, ty], i) => {
    x.globalAlpha = 0.05 + i * 0.03;
    x.fillStyle = sel;
    x.beginPath();
    x.arc(tx, ty, 8, 0, 7);
    x.fill();
  });
  x.globalAlpha = 1;
  x.fillStyle = sel;
  x.beginPath();
  x.arc(game.ball.x, game.ball.y, 9, 0, 7);
  x.fill();
  x.fillStyle = ink;
  x.beginPath();
  x.roundRect(game.paddle - 56, 500, 112, 12, 6);
  x.fill();

  if (game.message) {
    x.globalAlpha = 0.55;
    x.textAlign = 'center';
    x.font = `500 19px ${MONO}`;
    x.fillText(game.message, W / 2, 410);
  }

  // end-of-game card: the board dims, a title and the score, then how to continue
  if (game.mode === 'over' || game.mode === 'won') {
    const won = game.mode === 'won';
    x.globalAlpha = 0.86;
    x.fillStyle = css.getPropertyValue('--scr').trim();
    x.fillRect(0, 70, W, 490);
    x.globalAlpha = 1;
    x.textAlign = 'center';
    x.fillStyle = won ? sel : ink;
    x.font = `600 46px ${UI}`;
    x.fillText(won ? 'Cleared' : 'Game over', W / 2, 250);
    x.fillStyle = ink;
    x.globalAlpha = 0.7;
    x.font = `500 22px ${UI}`;
    x.fillText(
      won
        ? game.unlockedNow
          ? 'You unlocked the Clear finish'
          : 'All 40 bricks'
        : `${game.score} of 40 bricks`,
      W / 2,
      300,
    );
    x.globalAlpha = 0.5;
    x.font = `500 19px ${MONO}`;
    x.fillText('press the center to reset', W / 2, 400);
  }
  x.globalAlpha = 1;
}
