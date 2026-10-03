import { useLayoutEffect, useRef, useState } from 'react';
import * as actions from '../actions';
import { reducedMotion, refs } from '../refs';
import { useDevice } from '../store';

/**
 * The controls guide: labeled callouts pointing at the device (first visit, and via ?).
 * Positions are measured from the live device so the leaders always land on their control.
 * On phones there's no room beside the device, so ? shows the same labels as a sheet.
 */
interface Callout {
  target: () => Element | null | undefined;
  /** Where on the target the leader lands, as fractions of its box. */
  fx: number;
  fy: number;
  side: 'l' | 'r';
  label: string;
  text: string;
}

const CALLOUTS: Callout[] = [
  {
    target: () => refs.lcd,
    fx: 0.03,
    fy: 0.42,
    side: 'l',
    label: 'Screen',
    text: 'press a project to dive in',
  },
  {
    target: () => refs.wheel?.querySelector('.t'),
    fx: -0.2,
    fy: 0.5,
    side: 'l',
    label: 'MENU',
    text: 'back out',
  },
  {
    target: () => refs.wheel,
    fx: 0.07,
    fy: 0.74,
    side: 'l',
    label: 'Spin',
    text: 'drag around the ring to scroll',
  },
  {
    target: () => refs.wheel?.querySelector('.r'),
    fx: 0.5,
    fy: -0.1,
    side: 'r',
    label: '◀◀ ▶▶',
    text: 'skip tracks, photos, sections',
  },
  {
    target: () => refs.center,
    fx: 0.62,
    fy: 0.99,
    side: 'r',
    label: 'Center',
    text: 'press to open, hold to peek',
  },
  {
    target: () => refs.wheel?.querySelector('.b'),
    fx: 0.75,
    fy: 0.5,
    side: 'r',
    label: 'Play',
    text: "there's music in here",
  },
];

/** How far past the device the labels sit. */
const GAP = 48;

interface Placed {
  x: number;
  y: number;
  width: number;
}

export function Callouts() {
  const on = useDevice((s) => s.guide);
  const [placed, setPlaced] = useState<Placed[] | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!on) return;
    const place = () => {
      const dev = refs.dev;
      if (!dev) return;
      // measure the device flat
      dev.style.transition = 'none';
      dev.style.setProperty('--tx', '0deg');
      dev.style.setProperty('--ty', '0deg');
      const box = dev.getBoundingClientRect();
      const w = dev.offsetWidth;
      const k = box.width / w;
      setPlaced(
        CALLOUTS.map((c) => {
          const r = c.target()!.getBoundingClientRect();
          const x = (r.left + r.width * c.fx - box.left) / k;
          const y = (r.top + r.height * c.fy - box.top) / k;
          return { x, y, width: c.side === 'l' ? x + GAP : w + GAP - x };
        }),
      );
      void dev.offsetWidth;
      dev.style.transition = '';
    };
    place();
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [on]);

  // the leader lines draw in, staggered
  useLayoutEffect(() => {
    if (!on || !placed || reducedMotion()) return;
    root.current?.querySelectorAll('.co i').forEach((line, i) =>
      line.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
        duration: 500,
        delay: i * 70,
        easing: 'cubic-bezier(.16,1,.3,1)',
        fill: 'backwards',
      }),
    );
  }, [on, placed]);

  return (
    <div className="callouts" ref={root}>
      {placed?.map((p, i) => {
        const c = CALLOUTS[i]!;
        const text = (
          <div>
            <b>{c.label}</b>
            <span>{c.text}</span>
          </div>
        );
        const line = <i style={{ width: p.width }} />;
        return (
          <div
            key={c.label}
            className={`co ${c.side}`}
            style={{ '--x': `${p.x}px`, top: p.y } as React.CSSProperties}
          >
            {c.side === 'l' ? (
              <>
                {text}
                {line}
              </>
            ) : (
              <>
                {line}
                {text}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend" aria-live="polite" onClick={() => actions.showGuide(false)}>
      {CALLOUTS.map((c) => (
        <div key={c.label}>
          <b>{c.label}</b>
          <span>{c.text}</span>
        </div>
      ))}
    </div>
  );
}
