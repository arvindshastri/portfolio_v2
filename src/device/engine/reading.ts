import { reducedMotion, refs } from '../refs';

const EASE = 'cubic-bezier(.16,1,.3,1)';

/**
 * Reading is a full-window page. Opening grows it out of the device's screen: the page is clipped
 * to the screen's exact outline (position, size and rounded corners) and the clip opens to the
 * whole window, then the article fades in, already laid out at its final size. Closing is the
 * mirror: the article fades, and the page shrinks back into the screen.
 */
function screenClip(): string {
  const { lcd, dev } = refs;
  if (!lcd) return 'inset(0 round 0px)';
  // measure the screen square-on: the device's lean toward the pointer is dropped for this
  if (dev) {
    dev.style.transition = 'none';
    dev.style.setProperty('--tx', '0deg');
    dev.style.setProperty('--ty', '0deg');
    dev.style.setProperty('--sx', '0px');
    dev.style.setProperty('--sy', '0px');
  }
  const r = lcd.getBoundingClientRect();
  if (dev) {
    void dev.offsetWidth;
    dev.style.transition = '';
  }
  const radius = 25 * (r.width / lcd.offsetWidth);
  return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${radius}px)`;
}

const FULL = 'inset(0px 0px 0px 0px round 0px)';

export function grow(el: HTMLElement) {
  if (reducedMotion()) return;
  el.animate([{ clipPath: screenClip() }, { clipPath: FULL }], { duration: 620, easing: EASE });
  // the content cascades in while the page is still opening: the bar, then the article's first
  // blocks one after another (individual `translate`, so blocks keep any transform of their own)
  el.querySelector('.rbar')?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 400,
    delay: 200,
    easing: EASE,
    fill: 'backwards',
  });
  // the header's parts (kicker, title, lead, facts) arrive one by one, then the blocks below
  [...el.querySelectorAll('.read > .hero > *, .read > :not(.hero)')]
    .slice(0, 9)
    .forEach((block, i) =>
      block.animate(
        [
          { opacity: 0, translate: '0 18px' },
          { opacity: 1, translate: '0 0' },
        ],
        { duration: 560, delay: 220 + i * 50, easing: EASE, fill: 'backwards' },
      ),
    );
}

/** Resolves once the page is back inside the screen. */
export function shrink(el: HTMLElement | null | undefined): Promise<void> {
  if (!el || reducedMotion()) return Promise.resolve();
  // the content settles back and fades as the page starts to close
  el.querySelector('.rin')?.animate(
    [
      { opacity: 1, translate: '0 0', scale: '1' },
      { opacity: 0, translate: '0 10px', scale: '0.985' },
    ],
    { duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
  );
  const anim = el.animate([{ clipPath: FULL }, { clipPath: screenClip() }], {
    duration: 520,
    delay: 70,
    easing: EASE,
    fill: 'forwards',
  });
  // as it settles into the screen, the page dissolves into the list that is back underneath,
  // so the list fades in rather than appearing when the page goes
  el.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 300,
    delay: 290,
    easing: 'ease-out',
    fill: 'forwards',
  });
  // a throttled tab can stall animations; never leave the page half-closed
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 900));
  return Promise.race([anim.finished.then(() => undefined), timeout]);
}
