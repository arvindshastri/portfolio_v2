import * as actions from '../actions';
import { click } from '../engine/audio';
import { bind } from '../refs';
import { useDevice } from '../store';

/** The device colors, under the device. The secret one appears once it's unlocked. */
export function Swatches() {
  const color = useDevice((s) => s.color);
  useDevice((s) => s.secret);
  return (
    <div className="swatches" role="radiogroup" aria-label="Device color" ref={bind('swatches')}>
      {actions.availableThemes().map((t) => (
        <button
          key={t.id}
          role="radio"
          aria-label={t.name}
          aria-checked={t.id === color}
          title={t.name}
          className={t.id === color ? 'on' : undefined}
          style={{ '--c': t.swatch } as React.CSSProperties}
          onClick={() => {
            actions.setColor(t.id);
            click(1.5);
          }}
        />
      ))}
    </div>
  );
}
