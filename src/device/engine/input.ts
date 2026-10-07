import * as actions from '../actions';
import { refs } from '../refs';
import { getState } from '../store';
import { ensureAudio } from './audio';
import * as reader from './reader';
import { fitDevice } from './fit';

/** Page-wide listeners: keyboard, mouse wheel, the device's tilt, resizing and history. */
export function attachGlobalInput(skipIntro: () => void): () => void {
  let wheelAcc = 0;
  let lastWheel = 0;

  // The wheel turns into menu steps only over the device, so only the device's listener may
  // cancel scrolling. A cancelable listener on the whole window made the browser run every
  // scroll event through this code first, which made trackpad scrolling in a reading page feel
  // jumpy (Edge on Windows); the window listener below is passive.
  const onDeviceWheel = (e: WheelEvent) => {
    const s = getState();
    if (s.photo !== null || s.zoomed) return;
    e.preventDefault();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
    const now = performance.now();
    // a mouse notch moves exactly one item
    if (Math.abs(dy) >= 50) {
      if (now - lastWheel > 25) {
        actions.step(Math.sign(dy) as 1 | -1);
        lastWheel = now;
      }
      wheelAcc = 0;
      return;
    }
    // trackpads: accumulate, at most one step every 70ms
    wheelAcc += dy;
    if (Math.abs(wheelAcc) >= 40 && now - lastWheel > 70) {
      actions.step(Math.sign(wheelAcc) as 1 | -1);
      lastWheel = now;
      wheelAcc = 0;
    }
  };

  // reading: the article scrolls natively; the wheel over the bar scrolls it too
  const onWheel = (e: WheelEvent) => {
    const s = getState();
    if (!s.zoomed || s.photo !== null) return;
    if ((e.target as Element).closest('.read')) return reader.stopScroll();
    reader.scrollBy(e.deltaY * (e.deltaMode === 1 ? 16 : 1));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if ((document.getElementById('plain') as HTMLDialogElement | null)?.open) return;
    ensureAudio();
    skipIntro();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        return actions.step(1);
      case 'ArrowUp':
        e.preventDefault();
        return actions.step(-1);
      case 'ArrowRight':
        return actions.arrowSide(1);
      case 'ArrowLeft':
        return actions.arrowSide(-1);
      case 'Enter':
        e.preventDefault();
        return actions.select();
      case 'Escape':
      case 'Backspace':
        e.preventDefault();
        return actions.pop();
      case ' ':
        if (e.repeat) return;
        e.preventDefault();
        return actions.select();
    }
  };

  /** How many pixels of the device's side show at the far edges of the window. */
  const SIDE_X = -6.5;
  const SIDE_Y = -5;
  // the device leans toward a mouse, but holds still while you use it
  const onPointerMove = (e: PointerEvent) => {
    const s = getState();
    const dev = refs.dev;
    if (!dev || s.zoomed || e.pointerType !== 'mouse' || e.buttons || s.guide) return;
    if ((e.target as Element).closest('.wheel')) return;
    dev.style.setProperty('--ty', `${(e.clientX / innerWidth - 0.5) * 12}deg`);
    dev.style.setProperty('--tx', `${-(e.clientY / innerHeight - 0.5) * 8}deg`);
    // the side of the body that turns toward you shows its thickness (see .dev's box-shadow)
    dev.style.setProperty('--sx', `${(e.clientX / innerWidth - 0.5) * SIDE_X}px`);
    dev.style.setProperty('--sy', `${(e.clientY / innerHeight - 0.5) * SIDE_Y}px`);
    // the board under the Clear finish shifts against the tilt, for depth
    dev.style.setProperty('--dx', `${(e.clientX / innerWidth - 0.5) * -5}px`);
    dev.style.setProperty('--dy', `${(e.clientY / innerHeight - 0.5) * -4}px`);
  };

  const onPointerDownCapture = (e: PointerEvent) => {
    if ((e.target as Element).closest('.read')) reader.stopScroll();
  };
  const onResize = () => fitDevice();
  const onPopState = (e: PopStateEvent) => actions.onHistory(e.state);

  const dev = refs.dev;
  dev?.addEventListener('wheel', onDeviceWheel, { passive: false });
  addEventListener('wheel', onWheel, { passive: true });
  addEventListener('keydown', onKeyDown);
  addEventListener('pointermove', onPointerMove);
  addEventListener('pointerdown', onPointerDownCapture, true);
  addEventListener('resize', onResize);
  addEventListener('popstate', onPopState);
  return () => {
    dev?.removeEventListener('wheel', onDeviceWheel);
    removeEventListener('wheel', onWheel);
    removeEventListener('keydown', onKeyDown);
    removeEventListener('pointermove', onPointerMove);
    removeEventListener('pointerdown', onPointerDownCapture, true);
    removeEventListener('resize', onResize);
    removeEventListener('popstate', onPopState);
  };
}
