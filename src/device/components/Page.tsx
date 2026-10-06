import { useLayoutEffect, useRef, useState } from 'react';
import { SITE } from '@/data/site';
import * as actions from '../actions';
import { bind } from '../refs';
import { useDevice } from '../store';
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
