import { refs } from '../refs';

/** Room left under the zoomed screen for the docked dial. */
const DIAL_GAP = 16 + 30;
const TOP = 16;
/** Phones: how far the screen may stretch down into the device body while reading (device px). */
const MAX_GROW = 604 - 14 - 310 - 14;
let grow = 0;

/**
 * Pushes the camera into the screen. The screen's content layer is laid out at its final
 * on-screen size and scaled back down to the device's own size, so once the camera arrives
 * the article is real, full-size text (and the reflow happens while the screen is blanked).
 */
export function applyZoom() {
  const { zoomer, dev, lcd, lcdin, dial } = refs;
  if (!zoomer || !dev || !lcd || !lcdin || !dial) return;

  dev.style.transition = zoomer.style.transition = 'none';
  const previous = zoomer.style.transform;
  zoomer.style.transform = 'none';
  const screen = lcd.getBoundingClientRect();
  const origin = zoomer.getBoundingClientRect();
  zoomer.style.transform = previous;
  void zoomer.offsetWidth;
  dev.style.transition = zoomer.style.transition = '';

  // the device may be scaled down to fit (fitDevice), and may already be stretched
  const f = screen.width / lcd.clientWidth;
  const baseH = screen.height - grow * f;
  const lcdH = lcd.clientHeight - grow;

  const availH = innerHeight - (dial.offsetWidth + DIAL_GAP) - TOP;
  const k = Math.min((innerWidth * 0.94) / screen.width, availH / baseH);

  // phones are width-bound, which leaves a short screen over empty device body: the screen
  // stretches down into the body (like a taller display) so reading gets the height
  grow = innerWidth < 640 ? Math.min(MAX_GROW, Math.max(0, availH / k - baseH) / f) : 0;
  dev.style.setProperty('--zgrow', `${grow}px`);
  const height = baseH + grow * f;

  // lcdin: final on-screen size, scaled back to the (unscaled) device screen
  const s = (screen.width * k) / lcd.clientWidth;
  lcdin.style.width = `${lcd.clientWidth * s}px`;
  lcdin.style.height = `${(lcdH + grow) * s}px`;
  lcdin.style.transform = `scale(${1 / s})`;
  // the screen's corner radius at this zoom, so the status bar stays clear of it
  lcdin.style.setProperty('--zr', `${25 * s}px`);

  const ox = screen.left - origin.left + screen.width / 2;
  const oy = screen.top - origin.top + height / 2;
  zoomer.style.transformOrigin = `${ox}px ${oy}px`;
  zoomer.style.transform = `translate(${innerWidth / 2 - (origin.left + ox)}px,${
    TOP + availH / 2 - (origin.top + oy)
  }px) scale(${k})`;
}

export function resetZoom() {
  const { zoomer, lcdin, dev } = refs;
  if (!zoomer || !lcdin) return;
  grow = 0;
  dev?.style.removeProperty('--zgrow');
  lcdin.style.width = lcdin.style.height = lcdin.style.transform = '';
  lcdin.style.removeProperty('--zr');
  zoomer.style.transform = 'none';
}

/** Scales the device down to fit small windows. */
export function fitDevice() {
  const k = Math.min(1, (innerWidth - 24) / 380, (innerHeight - 210) / 604);
  if (refs.fit) refs.fit.style.transform = k < 1 ? `scale(${k})` : '';
}
