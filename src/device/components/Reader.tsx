import { ChevronLeft } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as actions from '../actions';
import { grow } from '../engine/reading';
import { bind, refs } from '../refs';
import { useDevice } from '../store';
import type { DocRef } from '../types';

/**
 * Reading: a project, role or About opens as a full-window page grown out of the device's
 * screen (see engine/reading.ts). A bar on top leads back to the list it came from; the article
 * scrolls natively.
 */
export function Reader() {
  const reading = useDevice((s) => s.reading);

  useLayoutEffect(() => {
    if (reading && refs.reader) grow(refs.reader);
  }, [reading?.doc.key]);

  if (!reading) return null;
  const { doc, back } = reading;
  return (
    <div className="reader" ref={bind('reader')} role="dialog" aria-label={doc.title}>
      <div className="rin">
        <header className="rbar">
          <button className="back" onClick={() => actions.pop()}>
            <ChevronLeft aria-hidden />
            {back}
          </button>
          <span className="rtitle">{doc.title}</span>
        </header>
        <Article doc={doc} />
      </div>
    </div>
  );
}

/** An article's HTML, rendered by the page into a <template> (see ArticleTemplates.astro). */
export function articleHtml(key: string): string {
  return (
    document.querySelector<HTMLTemplateElement>(`template[data-article="${key}"]`)?.innerHTML ?? ''
  );
}

function Article({ doc }: { doc: DocRef }) {
  const html = useMemo(() => articleHtml(doc.key), [doc.key]);
  const el = useRef<HTMLDivElement>(null);

  // live prototypes load only when they scroll near view (Figma embeds are heavy)
  useEffect(() => {
    const root = el.current;
    if (!root) return;
    let pending = [...root.querySelectorAll<HTMLElement>('.proto .frame[data-embed]')];
    if (!pending.length) return;
    const check = () => {
      const bottom = root.scrollTop + root.clientHeight + 400;
      pending = pending.filter((frame) => {
        if (frame.offsetTop > bottom) return true;
        const iframe = document.createElement('iframe');
        iframe.src = frame.dataset.embed!;
        iframe.title = frame.dataset.title ?? 'Prototype';
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
        return false;
      });
      if (!pending.length) root.removeEventListener('scroll', check);
    };
    root.addEventListener('scroll', check, { passive: true });
    check();
    return () => root.removeEventListener('scroll', check);
  }, [html]);

  return <div className="read" ref={el} dangerouslySetInnerHTML={{ __html: html }} />;
}
