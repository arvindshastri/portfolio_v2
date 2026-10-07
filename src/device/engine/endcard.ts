import { themeById } from '@/data/themes';

const UI = '"Geist Variable", system-ui, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, monospace';

export interface EndCard {
  /** What happened, small above the number ("Game over", "New best"). */
  title: string;
  /** The result, big. */
  value: string;
  /** What the number counts ("of 40 bricks", "blocks high"). */
  unit: string;
  /** A quiet line under the result ("best 23"). */
  note?: string;
  /** This game earned a secret finish for the first time: show its chip. */
  unlocked?: string;
  /** When the card appeared, for its entrance. */
  at: number;
}

/**
 * The end-of-game card Brick and Stack share, drawn over the board on a 656×560 canvas: the
 * board fades back, the result rises in (a small title, a big number in the selection color,
 * what it counts), then a pill for a new finish if one was earned, and how to play again.
 */
export function drawEndCard(x: CanvasRenderingContext2D, css: CSSStyleDeclaration, card: EndCard) {
  const ink = css.getPropertyValue('--scrInk').trim();
  const sel = css.getPropertyValue('--sel').trim();
  const scr = css.getPropertyValue('--scr').trim();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ms = reduced ? Infinity : performance.now() - card.at;
  /** Each part eases in on its own beat, rising a few pixels. */
  const part = (delay: number) => {
    const p = Math.max(0, Math.min(1, (ms - delay) / 320));
    const e = 1 - Math.pow(1 - p, 3);
    return { a: e, dy: (1 - e) * 10 };
  };
  const W = 656;
  x.save();
  x.globalAlpha = Math.min(1, ms / 260);
  x.fillStyle = scr;
  x.fillRect(0, 70, W, 490);
  x.textAlign = 'center';
  x.textBaseline = 'middle';

  const head = part(0);
  x.globalAlpha = 0.6 * head.a;
  x.fillStyle = ink;
  x.font = `600 24px ${UI}`;
  x.fillText(card.title, W / 2, 150 + head.dy);

  const big = part(60);
  x.globalAlpha = big.a;
  x.fillStyle = sel;
  x.font = `700 132px ${UI}`;
  x.fillText(card.value, W / 2, 245 + big.dy);
  x.globalAlpha = 0.7 * big.a;
  x.fillStyle = ink;
  x.font = `500 22px ${UI}`;
  x.fillText(card.unit, W / 2, 322 + big.dy);

  const extra = part(140);
  if (card.unlocked) {
    const theme = themeById(card.unlocked);
    const label = `${theme.name} finish unlocked`;
    x.font = `600 20px ${UI}`;
    const w = x.measureText(label).width + 76;
    const left = W / 2 - w / 2;
    const y = 392 + extra.dy;
    x.globalAlpha = extra.a;
    x.fillStyle = sel;
    x.globalAlpha = 0.12 * extra.a;
    x.beginPath();
    x.roundRect(left, y - 24, w, 48, 24);
    x.fill();
    x.globalAlpha = extra.a;
    chip(x, theme.swatch, left + 26, y);
    x.fillStyle = ink;
    x.textAlign = 'left';
    x.fillText(label, left + 50, y + 1);
    x.textAlign = 'center';
  } else if (card.note) {
    x.globalAlpha = 0.5 * extra.a;
    x.fillStyle = ink;
    x.font = `500 19px ${MONO}`;
    x.fillText(card.note, W / 2, 380 + extra.dy);
  }

  const foot = part(220);
  x.globalAlpha = 0.45 * foot.a;
  x.fillStyle = ink;
  x.font = `500 18px ${MONO}`;
  x.fillText('press the center to play again', W / 2, 482 + foot.dy);
  x.restore();
}

/** A finish's color chip: its swatch (a color, or a conic gradient for Clear) with a soft sheen. */
function chip(x: CanvasRenderingContext2D, swatch: string, cx: number, cy: number) {
  const r = 13;
  let fill: string | CanvasGradient = swatch;
  const stops = swatch.startsWith('conic') ? swatch.match(/#[0-9a-f]{3,8}/gi) : null;
  if (stops) {
    const g = x.createConicGradient(0, cx, cy);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    fill = g;
  }
  x.fillStyle = fill;
  x.beginPath();
  x.arc(cx, cy, r, 0, 7);
  x.fill();
  const sheen = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  sheen.addColorStop(0, 'rgba(255,255,255,.45)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  x.fillStyle = sheen;
  x.fill();
}
