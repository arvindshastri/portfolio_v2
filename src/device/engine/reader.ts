import { frameEls } from '../refs';
import { getState, top } from '../store';

/**
 * The reading scroller. Everything that scrolls a zoomed article (the dial, the mouse wheel
 * anywhere on the page, arrow keys, page down) eases toward a target, and letting go of the
 * dial keeps its momentum.
 */
const rs = { target: 0, pos: 0, velocity: 0, raf: 0, dragging: false, lastMove: 0 };

/** The article element of the screen on top, if it's an article. */
export function readEl(): HTMLElement | null {
  const f = top();
  if (!f || f.node.type !== 'doc') return null;
  return frameEls.get(f.id)?.querySelector<HTMLElement>('.read') ?? null;
}

function sync() {
  const el = readEl();
  if (el && !rs.raf) rs.pos = rs.target = el.scrollTop;
}

function kick() {
  if (!rs.raf) rs.raf = requestAnimationFrame(tick);
}

function tick() {
  rs.raf = 0;
  const el = readEl();
  if (!el || !getState().zoomed) {
    rs.velocity = 0;
    return;
  }
  if (!rs.dragging) {
    rs.target += rs.velocity;
    rs.velocity *= 0.93;
    if (Math.abs(rs.velocity) < 0.2) rs.velocity = 0;
  }
  const max = el.scrollHeight - el.clientHeight;
  rs.target = Math.max(0, Math.min(max, rs.target));
  if (rs.target === 0 || rs.target === max) rs.velocity = 0;
  const d = rs.target - rs.pos;
  if (Math.abs(d) < 0.5 && !rs.velocity && !rs.dragging) {
    rs.pos = rs.target;
    el.scrollTop = rs.pos;
    return;
  }
  rs.pos += d * 0.22;
  el.scrollTop = rs.pos;
  kick();
}

export function scrollBy(dy: number) {
  const el = readEl();
  if (!el) return;
  sync();
  el.style.scrollBehavior = 'auto';
  rs.target += dy;
  kick();
}

export function scrollTo(y: number) {
  if (!readEl()) return;
  sync();
  rs.velocity = 0;
  rs.target = y;
  kick();
}

/** Stops easing (native scrolling, like a trackpad over the article, takes over). */
export function stopScroll() {
  cancelAnimationFrame(rs.raf);
  rs.raf = 0;
  rs.velocity = 0;
}

/** The dial is being dragged: scroll with it, and remember how fast for momentum. */
export function dragBy(dy: number) {
  rs.dragging = true;
  rs.velocity = rs.velocity * 0.5 + dy * 0.5;
  rs.lastMove = performance.now();
  scrollBy(dy);
}

export function release() {
  if (!rs.dragging) return;
  rs.dragging = false;
  // a pause before letting go means no flick
  if (performance.now() - rs.lastMove > 90) rs.velocity = 0;
  kick();
}

/** ◀◀ / ▶▶ while reading: the previous or next section heading. */
export function jumpSection(dir: 1 | -1) {
  const el = readEl();
  if (!el) return;
  const current = rs.raf ? rs.target : el.scrollTop;
  const tops = [...el.querySelectorAll('h2')].map((h) => Math.max(0, h.offsetTop - 28));
  let to =
    dir > 0 ? tops.find((y) => y > current + 6) : tops.reverse().find((y) => y < current - 6);
  if (to == null) to = dir > 0 ? el.scrollHeight : 0;
  scrollTo(to);
}

export function pageDown() {
  const el = readEl();
  if (el) scrollBy(el.clientHeight * 0.8);
}
