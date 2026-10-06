import * as actions from '../actions';
import { getState, top } from '../store';
import { click, ensureAudio } from './audio';
import * as brick from './brick';

/** Degrees of rotation per menu step. */
const STEP = 18;

/**
 * Makes an element behave like a click wheel. Dragging around it spins (steps, scrolls, steers);
 * a press that barely moves is a tap on the quadrant under the finger. With `rock`, the wheel
 * tilts a few degrees toward where it's pressed. Returns a cleanup function.
 */
export function attachWheel(el: HTMLElement, rock: boolean): () => void {
  let drag: { angle: number; acc: number; moved: number; ticks: number } | null = null;

  const angleOf = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    return (
      (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) /
      Math.PI
    );
  };
  const tilt = (angle: number | null) => {
    if (!rock) return;
    const t = angle == null ? null : (angle * Math.PI) / 180;
    el.style.setProperty('--wx', t == null ? '0deg' : `${(-Math.sin(t) * 3).toFixed(2)}deg`);
    el.style.setProperty('--wy', t == null ? '0deg' : `${(Math.cos(t) * 3).toFixed(2)}deg`);
  };

  const onMove = (e: PointerEvent) => {
    // the sheen follows the pointer
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
    if (!drag) return;

    const a = angleOf(e);
    let d = a - drag.angle;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    drag.angle = a;
    drag.moved += Math.abs(d);
    if (drag.moved > 8) tilt(null);

    const s = getState();
    // Brick: the paddle follows the wheel continuously
    if (!s.locked && top()?.node.type === 'brick') {
      brick.steer(d * 4.2);
      if ((drag.ticks += Math.abs(d)) > 18) {
        drag.ticks = 0;
        click(0.6);
      }
      return;
    }
    drag.acc += d;
    while (drag.acc >= STEP) {
      actions.step(1);
      drag.acc -= STEP;
    }
    while (drag.acc <= -STEP) {
      actions.step(-1);
      drag.acc += STEP;
    }
  };

  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('.center')) return;
    el.setPointerCapture(e.pointerId);
    drag = { angle: angleOf(e), acc: 0, moved: 0, ticks: 0 };
    el.classList.add('drag');
    ensureAudio();
    tilt(drag.angle);
  };

  const onEnd = (e: PointerEvent) => {
    el.classList.remove('drag');
    tilt(null);
    if (drag && drag.moved < 8 && e.type === 'pointerup') actions.ringTap(angleOf(e));
    drag = null;
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onEnd);
  el.addEventListener('pointercancel', onEnd);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointerup', onEnd);
    el.removeEventListener('pointercancel', onEnd);
  };
}
