import { ArrowUpRight, Copy, LayoutList, Menu, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SITE } from '@/data/site';
import * as actions from '../actions';
import { click, ensureAudio } from '../engine/audio';
import { bind, reducedMotion, refs } from '../refs';
import { useDevice } from '../store';
import { Toast } from './Toast';

/** The name (which also takes you home), top left, over a line that cycles. */
export function Name() {
  return (
    <div className="name" ref={bind('name')}>
      <button onClick={actions.home} title="Back to the menu">
        {SITE.name}
      </button>
      <Lines />
    </div>
  );
}

/** First change once the entrance has settled, then one every few seconds. */
const LINES_START = 3600;
const LINES_EVERY = 4000;
/** The roll between lines (matches .role's animations). */
const ROLL = 340;

/**
 * The line under the name: once the device has arrived it rolls through SITE.lines once, the way
 * a row moves on the device, and rests on the first; tapping it rolls on to the next one.
 * Screen readers get every line at once.
 */
function Lines() {
  const lines = SITE.lines;
  const [state, setState] = useState({ i: 0, prev: -1, n: 0 });
  const auto = useRef(true);

  const next = () =>
    setState((s) => ({
      i: (s.i + 1) % lines.length,
      prev: reducedMotion() ? -1 : s.i,
      n: s.n + 1,
    }));

  // one pass on its own, ending back on the first line; a tap takes over
  useEffect(() => {
    let step = 0;
    let timer = window.setTimeout(function tick() {
      if (!auto.current) return;
      next();
      if (++step < lines.length) timer = window.setTimeout(tick, LINES_EVERY);
    }, LINES_START);
    return () => clearTimeout(timer);
  }, []);

  // the outgoing line leaves once it has rolled away
  useEffect(() => {
    if (state.prev < 0) return;
    const t = window.setTimeout(() => setState((s) => ({ ...s, prev: -1 })), ROLL);
    return () => clearTimeout(t);
  }, [state.n]);

  return (
    <span
      className="role lines"
      onClick={() => {
        auto.current = false;
        ensureAudio();
        click(0.6);
        next();
      }}
    >
      <span className="sr">{lines.join(', ')}</span>
      <span className="roll" aria-hidden>
        {state.prev >= 0 && (
          <span className="out" key={`o${state.n}`}>
            {lines[state.prev]}
          </span>
        )}
        <span className={state.n ? 'in' : undefined} key={`i${state.n}`}>
          {lines[state.i]}
        </span>
      </span>
    </span>
  );
}

export function Links() {
  const toast = useDevice((s) => s.pageToast);
  const sheet = useRef<HTMLElement>(null);
  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    actions.copyEmail(false);
  };

  // on phones the links are in a sheet under the name (see .sheet in page.css)
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const place = () => {
      const name = refs.name?.getBoundingClientRect();
      el.style.setProperty('--menu-top', `${(name?.bottom ?? 56) + 12}px`);
    };
    el.addEventListener('beforetoggle', place);
    return () => el.removeEventListener('beforetoggle', place);
  }, []);

  return (
    <>
      <nav className="links" ref={bind('links')}>
        <a href={SITE.resume} target="_blank" rel="noopener">
          Résumé
        </a>
        <a className="contact" href={`mailto:${SITE.email}`} onClick={copy}>
          Contact
        </a>
        <a className="switch" href="/simple/">
          <LayoutList aria-hidden />
          Simple view
        </a>
        <button className="burger" popoverTarget="page-menu" aria-label="Menu">
          <Menu className="open" aria-hidden />
          <X className="shut" aria-hidden />
        </button>
      </nav>
      <nav id="page-menu" className="sheet" popover="auto" ref={sheet} aria-label="Menu">
        <a href={SITE.resume} target="_blank" rel="noopener">
          Résumé
          <ArrowUpRight aria-hidden />
        </a>
        <a
          href={`mailto:${SITE.email}`}
          onClick={(e) => {
            copy(e);
            sheet.current?.hidePopover();
          }}
        >
          Contact
          <Copy aria-hidden />
        </a>
        <a href="/simple/">
          Simple view
          <LayoutList aria-hidden />
        </a>
      </nav>
      <Toast toast={toast} className="copied" />
    </>
  );
}

/** The only instruction on the page, and only if the visitor hasn't found the center button. */
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

/** Dims the page under an enlarged photo; clicking it closes the photo. */
export function Veil() {
  return (
    <div
      className="veil"
      onClick={() => {
        if (useDevice.getState().photo !== null) actions.closePhoto();
      }}
    />
  );
}

/**
 * An image enlarged over the page: a photo (press the center in Photos) or an image in an
 * article (tap it). The next input of any kind closes it. It opens at once on the image that is
 * already loaded (the cover flow's thumbnail, or the article's image), same shape, and the full
 * size fades in over it once decoded. Each image gets its own elements: the view used to swap
 * one image's source in place, which showed the previous photo until the new one arrived.
 */
export function EnlargedPhoto() {
  const image = useDevice((s) => s.photo);
  // keep the last image while the panel animates closed
  const [shown, setShown] = useState(image);
  if (image !== null && image !== shown) setShown(image);
  const panel = useRef<HTMLDivElement>(null);

  // the panel takes the image's own shape, so the whole image always shows
  useLayoutEffect(() => {
    const el = panel.current;
    const img = el?.querySelector<HTMLImageElement>('img.lo');
    if (!el || !img) return;
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
    <div ref={panel} className={`enlarged${image !== null ? ' on' : ''}`}>
      {shown && (
        <div className="ph" key={shown.full}>
          <img className="lo" src={shown.thumb} alt="" />
          <img
            className="hi"
            src={shown.full}
            alt={shown.alt}
            // already cached: show it at once; otherwise fade it in over the thumbnail
            ref={(img) => {
              if (img?.complete && img.naturalWidth) img.classList.add('in', 'now');
            }}
            onLoad={(e) => e.currentTarget.classList.add('in')}
          />
          {shown.caption && <span>{shown.caption}</span>}
        </div>
      )}
    </div>
  );
}
