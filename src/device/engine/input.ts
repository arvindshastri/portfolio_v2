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

  const onWheel = (e: WheelEvent) => {
    const s = getState();
    if (s.photo !== null) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
    // reading: scrolling anywhere scrolls the article (natively when over it)
    if (s.zoomed) {
      if ((e.target as Element).closest('.read')) return reader.stopScroll();
      e.preventDefault();
      reader.scrollBy(dy);
      return;
    }
    if (!(e.target as Element).closest('.dev')) return;
    e.preventDefault();
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

  // the device leans toward a mouse, but holds still while you use it
  const onPointerMove = (e: PointerEvent) => {
    const s = getState();
    const dev = refs.dev;
    if (!dev || s.zoomed || e.pointerType !== 'mouse' || e.buttons || s.guide) return;
    if ((e.target as Element).closest('.wheel')) return;
    dev.style.setProperty('--ty', `${(e.clientX / innerWidth - 0.5) * 12}deg`);
    dev.style.setProperty('--tx', `${-(e.clientY / innerHeight - 0.5) * 8}deg`);
    // the board under the Clear finish shifts against the tilt, for depth
    dev.style.setProperty('--dx', `${(e.clientX / innerWidth - 0.5) * -5}px`);
    dev.style.setProperty('--dy', `${(e.clientY / innerHeight - 0.5) * -4}px`);
  };

  const onPointerDownCapture = (e: PointerEvent) => {
    if ((e.target as Element).closest('.read')) reader.stopScroll();
  };
  const onResize = () => fitDevice();
  const onPopState = (e: PopStateEvent) => actions.onHistory(e.state);

  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('keydown', onKeyDown);
  addEventListener('pointermove', onPointerMove);
  addEventListener('pointerdown', onPointerDownCapture, true);
  addEventListener('resize', onResize);
  addEventListener('popstate', onPopState);
  return () => {
    removeEventListener('wheel', onWheel);
    removeEventListener('keydown', onKeyDown);
    removeEventListener('pointermove', onPointerMove);
    removeEventListener('pointerdown', onPointerDownCapture, true);
    removeEventListener('resize', onResize);
    removeEventListener('popstate', onPopState);
  };
}
