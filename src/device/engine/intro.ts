import { reducedMotion, refs } from '../refs';

/**
 * The entrance: the device rises into place, the screen powers on, and the name, links and ?
 * arrive with it. Everything is visible by default; these animations only enhance it
 * (fill: backwards), so the page is complete even if they never run. Any input skips ahead.
 */
let running: Animation[] = [];

export function playIntro() {
  if (reducedMotion()) return;
  const ease = 'cubic-bezier(.16,1,.3,1)';
  const a = (
    el: Element | null | undefined,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    if (el) running.push(el.animate(keyframes, { easing: ease, fill: 'backwards', ...options }));
  };

  // name, links and ? arrive together, as the screen powers on
  for (const el of [refs.name, refs.links, refs.corner])
    a(
      el,
      [
        { opacity: 0, filter: 'blur(4px)' },
        { opacity: 1, filter: 'blur(0)' },
      ],
      { duration: 800, delay: 1150 },
    );
  a(
    refs.perspective,
    [
      { opacity: 0, transform: 'translateY(70px) scale(.94)', filter: 'blur(10px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' },
    ],
    { duration: 1100, delay: 180 },
  );
  a(
    refs.floor,
    [
      { opacity: 0, transform: 'scaleX(.4)' },
      { opacity: 1, transform: 'none' },
    ],
    {
      duration: 1100,
      delay: 260,
    },
  );
  a(
    refs.power,
    [
      { opacity: 1 },
      { opacity: 1, offset: 0.55 },
      { opacity: 0, offset: 0.7 },
      { opacity: 0.25, offset: 0.78 },
      { opacity: 0 },
    ],
    { duration: 1500, delay: 400, easing: 'linear' },
  );
  a(refs.lock, [{ filter: 'brightness(2.4)' }, { filter: 'brightness(1)' }], {
    duration: 700,
    delay: 1150,
  });
  refs.swatches?.querySelectorAll('button').forEach((b, i) =>
    a(
      b,
      [
        { opacity: 0, transform: 'scale(.4)' },
        { opacity: 1, transform: 'none' },
      ],
      {
        duration: 500,
        delay: 1250 + i * 55,
      },
    ),
  );
}

export function skipIntro() {
  for (const anim of running) {
    try {
      anim.finish();
    } catch {
      /* already done */
    }
  }
  running = [];
}
