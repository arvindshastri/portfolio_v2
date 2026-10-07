import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import * as actions from '../actions';
import { reducedMotion, refs } from '../refs';
import { useDevice } from '../store';
import { Skip } from './Icons';

/**
 * The controls guide, opened by ?: labeled callouts pointing at the device on wide screens, and
 * the same labels and words as a sheet on phones, where there's no room beside the device.
 * Positions are measured from the live device so the leaders always land on their control.
 * While it's open, a dot sweeps around the wheel to show what spinning means (see .spindemo).
 */
interface Callout {
  target: () => Element | null | undefined;
  /** Where on the target the leader lands, as fractions of its box. */
  fx: number;
  fy: number;
  side: 'l' | 'r';
  /** How far the label sits above (−) or below (+) its control: the leader angles to get there. */
  shift?: number;
  label: ReactNode;
  /** One or two short lines. */
  text: string[];
}

const CALLOUTS: Callout[] = [
  {
    target: () => refs.lcd,
    fx: 0.03,
    fy: 0.42,
    side: 'l',
    label: 'Screen',
    text: ["It's a touch screen", 'Tap to open, swipe to scroll'],
  },
  {
    target: () => refs.wheel?.querySelector('.t'),
    fx: -0.2,
    fy: 0.5,
    side: 'l',
    label: 'MENU',
    text: ['Go back'],
  },
  {
    target: () => refs.wheel,
    fx: 0.16,
    fy: 0.7,
    side: 'l',
    label: 'Spin',
    text: ['Drag around the wheel to scroll'],
  },
  {
    target: () => refs.wheel?.querySelector('.r'),
    // just right of the marks, so the dot doesn't sit on them
    fx: 1.35,
    fy: 0.5,
    side: 'r',
    shift: -30,
    label: (
      <span className="marks">
        <Skip back />
        <Skip />
      </span>
    ),
    text: ['Previous and next', 'Skips tracks while music plays'],
  },
  {
    target: () => refs.center,
    fx: 0.5,
    fy: 0.5,
    side: 'r',
    // the button is level with ◀◀ ▶▶, so its label drops below theirs
    shift: 34,
    label: 'Center',
    text: ["Open what's selected"],
  },
  {
    target: () => refs.wheel?.querySelector('.b'),
    fx: 0.5,
    // just under the play/pause marks, so the dot doesn't cover them
    fy: 1.55,
    side: 'r',
    shift: 40,
    label: 'Play',
    text: ['Play or pause music'],
  },
];

/** How far past the device the labels sit. */
const GAP = 48;
/** Where the angled part of a leader ends and the level part begins, past the device's edge. */
const ELBOW = 14;

interface Placed {
  /** The dot, on the control. */
  x: number;
  y: number;
  /** The label's height (the leader runs level into it). */
  ly: number;
}

export function Callouts() {
  const on = useDevice((s) => s.guide);
  const [placed, setPlaced] = useState<{ w: number; h: number; at: Placed[] } | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!on) return;
    const place = () => {
      const dev = refs.dev;
      if (!dev) return;
      // measure the device flat, without disturbing its current tilt
      dev.style.transition = 'none';
      dev.style.transform = 'none';
      const box = dev.getBoundingClientRect();
      const w = dev.offsetWidth;
      const k = box.width / w;
      setPlaced({
        w,
        h: dev.offsetHeight,
        at: CALLOUTS.map((c) => {
          const r = c.target()!.getBoundingClientRect();
          const x = (r.left + r.width * c.fx - box.left) / k;
          const y = (r.top + r.height * c.fy - box.top) / k;
          return { x, y, ly: y + (c.shift ?? 0) };
        }),
      });
      dev.style.transform = '';
      void dev.offsetWidth;
      dev.style.transition = '';
      // then let it ease flat, in step with the callouts fading in
      for (const v of ['--tx', '--ty']) dev.style.setProperty(v, '0deg');
      for (const v of ['--dx', '--dy', '--sx', '--sy']) dev.style.setProperty(v, '0px');
    };
    place();
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [on]);

  // the leader lines draw in from their dots, staggered
  useLayoutEffect(() => {
    if (!on || !placed || reducedMotion()) return;
    root.current?.querySelectorAll('.leaders path').forEach((line, i) =>
      line.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: 500,
        delay: Math.floor(i / 2) * 70,
        easing: 'cubic-bezier(.16,1,.3,1)',
        fill: 'backwards',
      }),
    );
  }, [on, placed]);

  return (
    <div className="callouts" ref={root}>
      {placed && (
        <svg
          className="leaders"
          width={placed.w}
          height={placed.h}
          viewBox={`0 0 ${placed.w} ${placed.h}`}
        >
          {placed.at.map((p, i) => {
            const left = CALLOUTS[i]!.side === 'l';
            // out from the dot to just past the device's edge (angled when the label sits higher
            // or lower than its control), then level to the label
            const elbow = left ? -ELBOW : placed.w + ELBOW;
            const end = left ? -GAP + 10 : placed.w + GAP - 10;
            const d = `M${p.x} ${p.y} L${elbow} ${p.ly} L${end} ${p.ly}`;
            return (
              <g key={i}>
                {/* a page-colored halo keeps the line readable where it crosses a dark wheel */}
                <path className="halo" d={d} pathLength={1} strokeDasharray="1 1" />
                <path d={d} pathLength={1} strokeDasharray="1 1" />
                <circle cx={p.x} cy={p.y} r={3.5} />
              </g>
            );
          })}
        </svg>
      )}
      {placed?.at.map((p, i) => {
        const c = CALLOUTS[i]!;
        return (
          <div key={c.text[0]} className={`co ${c.side}`} style={{ top: p.ly }}>
            <b>{c.label}</b>
            {c.text.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** The sheet reads top to bottom as how you'd use it: touch, move, open, back, then the rest. */
const SHEET_ORDER = ['Screen', 'Spin', 'Center', 'MENU', 'skip', 'Play'];
const sheetKey = (c: Callout) => (typeof c.label === 'string' ? c.label : 'skip');
const SHEET = [...CALLOUTS].sort(
  (a, b) => SHEET_ORDER.indexOf(sheetKey(a)) - SHEET_ORDER.indexOf(sheetKey(b)),
);

export function Legend() {
  const on = useDevice((s) => s.guide);
  return (
    <div
      className="legend"
      aria-live="polite"
      aria-hidden={!on}
      onClick={() => actions.showGuide(false)}
    >
      {SHEET.map((c) => (
        <div key={c.text[0]}>
          <b>{c.label}</b>
          <p>
            {c.text.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}
