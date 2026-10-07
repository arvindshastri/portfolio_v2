import * as actions from '../actions';
import { click } from '../engine/audio';
import { bind } from '../refs';
import { useDevice } from '../store';

/**
 * The device colors: small chips in each finish's own shell material, in a row at the bottom of
 * the page (placed in fit.ts). Hovering one shows its name as a tooltip. The secret finish
 * appears once it's unlocked.
 */
export function Swatches() {
  const color = useDevice((s) => s.color);
  useDevice((s) => s.secret);
  return (
    <div className="swatches" ref={bind('swatches')}>
      <div className="chips" role="radiogroup" aria-label="Device color">
        {actions.availableThemes().map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-label={t.name}
            aria-checked={t.id === color}
            title={t.name}
            className={t.id === color ? 'on' : undefined}
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
        ))}
      </div>
    </div>
  );
}
