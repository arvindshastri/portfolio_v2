import { useEffect, useRef } from 'react';
import * as actions from '../actions';
import { attachWheel } from '../engine/wheel';
import { bind, refs } from '../refs';
import { useDevice } from '../store';
import { Callouts } from './Guide';
import { Screens } from './Screens';
import { Swatches } from './Swatches';

const clock = (d: Date) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;

/** The device and everything that moves with it (its floor shadow, guide callouts and swatches). */
export function Device() {
  return (
    <div className="stage">
      <div className="zoomer" ref={bind('zoomer')}>
        <div className="fit" ref={bind('fit')}>
          <div className="floor" ref={bind('floor')} />
          <div className="perspective" ref={bind('perspective')}>
            <div className="dev" ref={bind('dev')}>
              <Guts />
              <div className="screenwrap">
                <div className="lcd" ref={bind('lcd')}>
                  <div className="lcdin" ref={bind('lcdin')}>
                    <StatusBar />
                    <Screens />
                    <DeviceToast />
                    <Volume />
                    <LockScreen />
                    <div className="power" ref={bind('power')} />
                  </div>
                </div>
              </div>
              <Wheel />
            </div>
          </div>
          <Callouts />
          <Swatches />
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  const title = useDevice((s) => s.stack[s.stack.length - 1]?.node.title ?? 'Menu');
  const now = useDevice((s) => s.now);
  const { on, started } = useDevice((s) => s.music);
  const pill = useDevice((s) => s.pill);
  // the pill grows to fit its message, up to most of the screen's width
  const pillWidth = pill
    ? Math.min(
        (refs.lcd?.clientWidth ?? 320) * 0.78,
        (pill.app.length + pill.msg.length) * 6.3 + 42,
      )
    : 60;
  return (
    <div className="status">
      <span className="play">{on ? '▶' : started ? '❚❚' : ''}</span>
      <span className="ttl">{title}</span>
      <span className="tm">{clock(now)}</span>
      <div
        className={`pill${pill ? ' on' : ''}`}
        style={{ '--pw': `${pillWidth}px` } as React.CSSProperties}
      >
        <b>{pill?.app}</b>
        <span>{pill?.msg}</span>
      </div>
    </div>
  );
}

function LockScreen() {
  const locked = useDevice((s) => s.locked);
  const now = useDevice((s) => s.now);
  return (
    <div className={`lock${locked ? '' : ' open'}`} ref={bind('lock')}>
      <img className="wall" src={actions.getContent().lockWallpaper} alt="" />
      <div className="clk">{clock(now)}</div>
      <div className="dt">
        {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

function DeviceToast() {
  const toast = useDevice((s) => s.deviceToast);
  const last = useRef('');
  if (toast) last.current = toast;
  return <div className={`stoast${toast ? ' on' : ''}`}>{last.current}</div>;
}

function Volume() {
  const shown = useDevice((s) => s.volumeShown);
  const vol = useDevice((s) => s.music.vol);
  return (
    <div className={`vol${shown ? ' on' : ''}`}>
      VOL
      <div>
        <i style={{ width: `${vol * 100}%` }} />
      </div>
    </div>
  );
}

/** The click wheel: drag around it to spin, tap its quadrants, press or hold the center. */
function Wheel() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => attachWheel(ref.current!, true), []);
  return (
    <div
      className="wheel"
      id="wheel"
      ref={(el) => {
        ref.current = el;
        refs.wheel = el;
      }}
    >
      <span className="glow" />
      <span className="orb" />
      <WheelLabels />
      <button
        className="center"
        ref={bind('center')}
        aria-label="Select. Hold to peek."
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.classList.add('held');
          actions.centerDown();
        }}
        onPointerUp={(e) => e.currentTarget.classList.remove('held')}
        onPointerLeave={(e) => e.currentTarget.classList.remove('held')}
        onClick={actions.centerClick}
      />
    </div>
  );
}

export function WheelLabels() {
  return (
    <>
      <span className="lbl t">MENU</span>
      <span className="lbl l">◀◀</span>
      <span className="lbl r">▶▶</span>
      <span className="lbl b">▶ ❚❚</span>
    </>
  );
}

/** The docked dial: a smaller wheel under the zoomed screen while reading. */
export function Dial() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => attachWheel(ref.current!, false), []);
  return (
    <div
      className="dial"
      ref={(el) => {
        ref.current = el;
        refs.dial = el;
      }}
    >
      <span className="glow" />
      <WheelLabels />
      <button
        className="center"
        aria-label="Page down"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => actions.select()}
      />
    </div>
  );
}

/** The circuit board under the secret Clear finish. */
function Guts() {
  return (
    <div className="guts" aria-hidden="true">
      <div className="chip" style={{ left: 40, top: 340, width: 40, height: 40 }}>
        A16
      </div>
      <div className="chip" style={{ right: 36, top: 344, width: 34, height: 26 }}>
        MEM
      </div>
      <div className="chip" style={{ left: 44, bottom: 30, width: 30, height: 22 }}>
        DAC
      </div>
      <div className="chip" style={{ right: 44, bottom: 34, width: 26, height: 26 }}>
        BT
      </div>
      <div
        className="tr"
        style={{ left: 60, top: 380, width: 60, height: 110, borderRight: 0, borderBottom: 0 }}
      />
      <div
        className="tr"
        style={{ right: 52, top: 370, width: 44, height: 150, borderLeft: 0, borderTop: 0 }}
      />
      <div className="ring" />
      <div className="screw" style={{ left: 14, top: 14 }} />
      <div className="screw" style={{ right: 14, top: 14 }} />
      <div className="screw" style={{ left: 14, bottom: 14 }} />
      <div className="screw" style={{ right: 14, bottom: 14 }} />
    </div>
  );
}
