import { refs } from '../refs';

/** Scales the device down to fit small windows. */
export function fitDevice() {
  const k = Math.min(1, (innerWidth - 24) / 380, (innerHeight - 210) / 604);
  if (refs.fit) refs.fit.style.transform = k < 1 ? `scale(${k})` : '';
}
