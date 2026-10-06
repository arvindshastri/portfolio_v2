import { getState } from '../store';

/**
 * The reading scroller for keys: arrow keys and page down (Space or Enter) ease toward a
 * target. Touch, trackpads and the mouse wheel over the article scroll it natively.
 */
const rs = { target: 0, pos: 0, raf: 0 };

/** The open article's scroller, if reading. */
export function readEl(): HTMLElement | null {
  return getState().zoomed ? document.querySelector<HTMLElement>('.reader .read') : null;
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
  if (!el) return;
  const max = el.scrollHeight - el.clientHeight;
  rs.target = Math.max(0, Math.min(max, rs.target));
  const d = rs.target - rs.pos;
  if (Math.abs(d) < 0.5) {
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
  const el = readEl();
  if (!el) return;
  sync();
  el.style.scrollBehavior = 'auto';
  rs.target = y;
  kick();
}

/** Stops easing (native scrolling, like a trackpad over the article, takes over). */
export function stopScroll() {
  cancelAnimationFrame(rs.raf);
  rs.raf = 0;
}

export function pageDown() {
  const el = readEl();
  if (el) scrollBy(el.clientHeight * 0.8);
}
