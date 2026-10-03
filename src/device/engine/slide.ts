import { reducedMotion } from '../refs';

const EASE = 'cubic-bezier(.16,1,.3,1)';

/**
 * Moving between screens. Forward and back are the same motion mirrored: 340ms ease-out-expo,
 * the incoming screen on top going forward, the outgoing screen on top going back, and the
 * screen underneath parallaxing 35%.
 *
 * Resolves with the outgoing animation once it lands, or null if a newer slide interrupted it.
 */
export function slide(
  inEl: HTMLElement,
  outEl: HTMLElement,
  dir: 1 | -1,
): Promise<Animation | null> {
  const timing = { duration: reducedMotion() ? 0 : 340, easing: EASE };
  // a stale slide must never come back and reassert its end position
  for (const el of [inEl, outEl]) el.getAnimations().forEach((a) => a.cancel());
  inEl.style.transform = outEl.style.transform = 'none';

  const incoming = inEl.animate(
    [{ transform: dir > 0 ? 'translateX(100%)' : 'translateX(-35%)' }, { transform: 'none' }],
    timing,
  );
  const outgoing = outEl.animate(
    [{ transform: 'none' }, { transform: dir > 0 ? 'translateX(-35%)' : 'translateX(100%)' }],
    { ...timing, fill: 'forwards' },
  );
  // in a throttled tab animations can stall; never leave a screen half-slid
  setTimeout(() => {
    for (const a of [incoming, outgoing]) if (a.playState === 'running') a.finish();
  }, timing.duration + 80);

  return outgoing.finished.then(
    () => outgoing,
    () => null,
  );
}

/** Clears any slide left on an element (used when screens change without animating). */
export function settle(el: HTMLElement | undefined) {
  if (!el) return;
  el.getAnimations().forEach((a) => a.cancel());
  el.style.transform = 'none';
}
