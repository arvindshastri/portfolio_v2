import { useLayoutEffect, useRef, useState } from 'react';
import { SITE } from '@/data/site';
import * as actions from '../actions';
import { bind } from '../refs';
import { useDevice } from '../store';
import { articleHtml } from './Screens';
import { Toast } from './Toast';

/** The name (which also takes you home), top left. */
export function Name() {
  return (
    <div className="name" ref={bind('name')}>
      <button onClick={actions.home} title="Back to the menu">
        {SITE.name}
      </button>
      <span className="role">{SITE.role}</span>
    </div>
  );
}

export function Links() {
  const toast = useDevice((s) => s.pageToast);
  return (
    <>
      <nav className="links" ref={bind('links')}>
        <a href={SITE.resume} target="_blank" rel="noopener">
          Résumé
        </a>
        <a
          href={`mailto:${SITE.email}`}
          onClick={(e) => {
            e.preventDefault();
            actions.copyEmail(false);
          }}
        >
          Contact
        </a>
      </nav>
      <Toast toast={toast} className="copied" />
    </>
  );
}

/** The only instruction on the page, and only if the visitor hasn't found the center button. */
export function Hint() {
  const show = useDevice((s) => s.locked && s.hintLate);
  return (
    <div className="foot" ref={bind('foot')}>
      <span className="hint" style={{ opacity: show ? 1 : 0 }}>
        press the center to unlock
      </span>
    </div>
  );
}

export function Corner() {
  return (
    <div className="corner" ref={bind('corner')}>
      <button
        className="sr"
        onClick={() => (document.getElementById('plain') as HTMLDialogElement).showModal()}
      >
        Text version of this site
      </button>
      <button
        className="q"
        aria-label="Show controls"
        onClick={() => actions.showGuide(!useDevice.getState().guide)}
      >
        ?
      </button>
    </div>
  );
}

/** Dims the page while reading or peeking; clicking it backs out. */
export function Veil() {
  return (
    <div
      className="veil"
      onClick={() => {
        const s = useDevice.getState();
        if (s.zoomed) actions.pop();
        else if (s.sticky) actions.closePeek();
      }}
    />
  );
}

/** Hold the center: a magnified look at a project or photo without opening it. */
export function Peek() {
  const peek = useDevice((s) => s.peek);
  const photos = actions.getContent().photos;
  // keep the last content while the panel animates closed
  const [shown, setShown] = useState(peek);
  if (peek && peek !== shown) setShown(peek);
  const panel = useRef<HTMLDivElement>(null);

  // a photo peek takes the photo's own shape, so the whole photo always shows
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    el.style.width = el.style.height = '';
    if (shown?.kind !== 'photo') return;
    const img = el.querySelector('img')!;
    const fit = () => {
      const ratio = img.naturalWidth / img.naturalHeight || 1;
      const maxW = Math.min(innerWidth * 0.92, 1100);
      const maxH = Math.min(innerHeight * 0.84, 900);
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    };
    if (img.complete && img.naturalWidth) fit();
    else img.onload = fit;
  }, [shown]);

  return (
    <div
      ref={panel}
      className={`peek${peek ? ' on' : ''}${shown?.kind === 'photo' ? ' photo' : ''}`}
    >
      {shown?.kind === 'photo' && (
        <div className="ph">
          <img src={photos[shown.index]!.full} alt={photos[shown.index]!.caption} />
          <span>{photos[shown.index]!.caption}</span>
        </div>
      )}
      {shown?.kind === 'doc' && (
        <div className="lcdin">
          <div className="screens" style={{ flex: 1 }}>
            <div className="scr">
              <div
                className="read"
                dangerouslySetInnerHTML={{ __html: articleHtml(shown.doc.key) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
