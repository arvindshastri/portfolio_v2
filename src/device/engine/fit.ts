import { refs } from '../refs';

/**
 * How far the ? (and so the color chips' row, centered on it) sits from the bottom of the page:
 * the same as the name and the links from the top.
 */
const BOTTOM = 24;
/** The ? is 28px, so the row's center sits this far up. */
const ROW_CENTER = BOTTOM + 14;

/** Scales the device down to fit small windows, then places the color chips and the ?. */
export function fitDevice() {
  const k = Math.min(1, (innerWidth - 24) / 380, (innerHeight - 210) / 604);
  const { fit, swatches } = refs;
  if (fit) fit.style.transform = k < 1 ? `scale(${k})` : '';
  if (!fit || !swatches) return;

  // the chips' row sits at the bottom of the page, but never closer to the device than its
  // usual gap (the chips live inside the scaled device box, so this is in its units)
  swatches.style.top = '';
  const box = fit.getBoundingClientRect();
  const natural = swatches.offsetTop;
  const atBottom = (innerHeight - ROW_CENTER - box.top) / k - swatches.offsetHeight / 2;
  if (atBottom > natural) swatches.style.top = `${atBottom}px`;

  // the ? lines up with the chips, wherever they ended up (see .corner)
  const chips = swatches.getBoundingClientRect();
  document.documentElement.style.setProperty(
    '--chips-y',
    `${innerHeight - (chips.top + chips.height / 2)}px`,
  );
}
