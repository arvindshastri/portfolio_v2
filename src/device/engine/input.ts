import * as actions from '../actions';
import { refs } from '../refs';
import { getState } from '../store';
import { ensureAudio } from './audio';
import * as reader from './reader';
import { fitDevice } from './zoom';

/** Page-wide listeners: keyboard, mouse wheel, the device's tilt, resizing and history. */
export function attachGlobalInput(skipIntro: () => void): () => void {
  let wheelAcc = 0;
  let lastWheel = 0;

  const onWheel = (e: WheelEvent) => {
    const s = getState();
    if (s.peek) return;
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
        if (actions.peekTarget()) actions.openPeek();
        else actions.select();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const s = getState();
    if (e.key === ' ' && s.peek && !s.sticky) actions.closePeek();
  };

  // the device leans toward a mouse, but holds still while you use it
  const onPointerMove = (e: PointerEvent) => {
    const s = getState();
    const dev = refs.dev;
    if (!dev || s.zoomed || e.pointerType !== 'mouse' || e.buttons || s.guide) return;
    if ((e.target as Element).closest('.wheel')) return;
    dev.style.setProperty('--ty', `${(e.clientX / innerWidth - 0.5) * 12}deg`);
    dev.style.setProperty('--tx', `${-(e.clientY / innerHeight - 0.5) * 8}deg`);
  };

  const onPointerDownCapture = (e: PointerEvent) => {
    if ((e.target as Element).closest('.read')) reader.stopScroll();
  };
  const onPointerUp = () => actions.pointerReleased();
  const onResize = () => {
    if (getState().zoomed) actions.relayout();
    else fitDevice();
  };
  const onPopState = (e: PopStateEvent) => actions.onHistory(e.state);

  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('keydown', onKeyDown);
  addEventListener('keyup', onKeyUp);
  addEventListener('pointermove', onPointerMove);
  addEventListener('pointerdown', onPointerDownCapture, true);
  addEventListener('pointerup', onPointerUp);
  addEventListener('resize', onResize);
  addEventListener('popstate', onPopState);
  return () => {
    removeEventListener('wheel', onWheel);
    removeEventListener('keydown', onKeyDown);
    removeEventListener('keyup', onKeyUp);
    removeEventListener('pointermove', onPointerMove);
    removeEventListener('pointerdown', onPointerDownCapture, true);
    removeEventListener('pointerup', onPointerUp);
    removeEventListener('resize', onResize);
    removeEventListener('popstate', onPopState);
  };
}
