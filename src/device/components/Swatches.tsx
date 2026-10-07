import { THEMES } from '@/data/themes';
import { Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as actions from '../actions';
import { click } from '../engine/audio';
import { bind } from '../refs';
import { useDevice } from '../store';

/** How to earn each secret finish, shown by its locked chip. */
const HOW = { brick: 'Clear every brick in Brick', stack: 'Stack 30 high in Stack' };

/**
 * The device colors: small chips in each finish's own shell material, in a row at the bottom of
 * the page (placed in fit.ts). Hovering one shows its name as a tooltip. The secret finishes
 * sit at the end as locked chips until they're earned; tapping one says how to earn it. An
 * earned chip pops in under the device the moment it's won.
 */
export function Swatches() {
  const color = useDevice((s) => s.color);
  const unlocked = useDevice((s) => s.unlocked);
  const [hint, setHint] = useState({ text: '', on: false });
  const timer = useRef(0);
  // a finish earned just now: its chip arrives with a pop and a ring, once
  const seen = useRef(unlocked);
  const [fresh, setFresh] = useState<string | null>(null);
  useEffect(() => {
    const game = (Object.keys(unlocked) as (keyof typeof unlocked)[]).find(
      (g) => unlocked[g] && !seen.current[g],
    );
    seen.current = unlocked;
    if (!game) return;
    setFresh(THEMES.find((t) => t.secret === game)!.id);
    const id = window.setTimeout(() => setFresh(null), 1600);
    return () => clearTimeout(id);
  }, [unlocked]);
  const say = (text: string) => {
    setHint({ text, on: true });
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHint((h) => ({ ...h, on: false })), 2600);
  };
  return (
    <div className="swatches" ref={bind('swatches')}>
      <span className={`swhint${hint.on ? ' on' : ''}`} role="status">
        {hint.text}
      </span>
      <div className="chips" role="radiogroup" aria-label="Device color">
        {THEMES.map((t) =>
          t.secret && !unlocked[t.secret] ? (
            <button
              key={t.id}
              className="locked"
              aria-label={`Locked finish. ${HOW[t.secret]} to unlock it.`}
              title={`${HOW[t.secret]} to unlock`}
              onClick={() => {
                say(`${HOW[t.secret!]} to unlock`);
                click(1);
              }}
            >
              <Lock aria-hidden="true" strokeWidth={2.25} />
            </button>
          ) : (
            <button
              key={t.id}
              role="radio"
              aria-label={t.name}
              aria-checked={t.id === color}
              title={t.name}
              className={
                [t.id === color && 'on', t.id === fresh && 'fresh'].filter(Boolean).join(' ') ||
                undefined
              }
              style={
                {
                  '--c': t.swatch,
                  '--s1': t.tokens.shell,
                  '--s2': t.tokens.shell2,
                  '--e': t.tokens.edge,
                } as React.CSSProperties
              }
              onClick={() => {
                actions.setColor(t.id);
                click(1.5);
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}
