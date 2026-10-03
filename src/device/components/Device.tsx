import { useEffect, useRef } from 'react';
import * as actions from '../actions';
import { attachWheel } from '../engine/wheel';
import { bind, refs } from '../refs';
import { useDevice } from '../store';
import { Callouts } from './Guide';
import { Screens } from './Screens';
import { Swatches } from './Swatches';
import { Toast } from './Toast';

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
  return (
    <div className="status">
      <span className="play">{on ? '▶' : started ? '❚❚' : ''}</span>
      <span className="ttl">{title}</span>
      <span className="tm">{clock(now)}</span>
    </div>
  );
}

function LockScreen() {
  const locked = useDevice((s) => s.locked);
  const now = useDevice((s) => s.now);
  return (
    <div className={`lock${locked ? '' : ' open'}`} ref={bind('lock')}>
      <div className="clk">{clock(now)}</div>
      <div className="dt">
        {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

function DeviceToast() {
  const toast = useDevice((s) => s.deviceToast);
  return <Toast toast={toast} className="stoast" />;
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

/**
 * What you see through the secret Clear finish: the board under a tinted, see-through shell.
 * It shifts a few pixels against the device's tilt, so it reads as sitting deeper inside.
 * (Coordinates are inside the shell, which is 340 × 584.)
 */
function Guts() {
  return (
    <div className="guts" aria-hidden="true">
      {/* the flex cable from the screen and its connector */}
      <div className="ribbon" style={{ left: 54, top: 296, width: 42, height: 52 }} />
      <div className="conn" style={{ left: 48, top: 344, width: 54, height: 10 }} />
      {/* the battery, behind the wheel */}
      <div className="battery" style={{ left: 92, top: 356, width: 156, height: 172 }}>
        Li-ion 3.8V
      </div>
      {/* the click wheel's sensor rings */}
      <div className="sensor" style={{ width: 232, height: 232, top: 331 }} />
      <div className="sensor solid" style={{ width: 196, height: 196, top: 349 }} />
      <div className="sensor solid" style={{ width: 104, height: 104, top: 395 }} />
      {/* chips, with a few tiny parts around them */}
      <div className="chip" style={{ left: 22, top: 374, width: 42, height: 42 }}>
        A16
      </div>
      <div className="chip" style={{ right: 20, top: 362, width: 36, height: 28 }}>
        MEM
      </div>
      <div className="chip" style={{ left: 30, bottom: 28, width: 30, height: 22 }}>
        DAC
      </div>
      <div className="chip" style={{ right: 30, bottom: 32, width: 26, height: 26 }}>
        BT
      </div>
      <div className="smd" style={{ right: 26, top: 398, width: 6, height: 3 }} />
      <div className="smd" style={{ right: 36, top: 398, width: 6, height: 3 }} />
      <div className="smd" style={{ right: 46, top: 398, width: 6, height: 3 }} />
      <div className="smd" style={{ left: 26, top: 424, width: 3, height: 6 }} />
      <div className="smd" style={{ left: 32, top: 424, width: 3, height: 6 }} />
      <div className="smd" style={{ left: 64, bottom: 34, width: 6, height: 3 }} />
      <div className="cap" style={{ right: 62, bottom: 30 }} />
      <div className="cap" style={{ left: 24, top: 336 }} />
      {/* gold traces */}
      <div
        className="tr"
        style={{ left: 42, top: 352, width: 20, height: 22, borderRight: 0, borderBottom: 0 }}
      />
      <div
        className="tr"
        style={{ left: 44, top: 416, width: 18, height: 128, borderRight: 0, borderTop: 0 }}
      />
      <div
        className="tr"
        style={{ right: 36, top: 390, width: 22, height: 160, borderLeft: 0, borderTop: 0 }}
      />
      {/* a status LED in the theme color */}
      <div className="led" style={{ right: 66, bottom: 52 }} />
      <div className="screw" style={{ left: 14, top: 14 }} />
      <div className="screw" style={{ right: 14, top: 14 }} />
      <div className="screw" style={{ left: 14, bottom: 14 }} />
      <div className="screw" style={{ right: 14, bottom: 14 }} />
    </div>
  );
}
