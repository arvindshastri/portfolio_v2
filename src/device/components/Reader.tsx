import { ChevronDown, ChevronLeft } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as actions from '../actions';
import * as reader from '../engine/reader';
import { grow } from '../engine/reading';
import { bind, refs } from '../refs';
import { useDevice } from '../store';
import type { DocRef } from '../types';

interface Section {
  id: string;
  title: string;
}

/** Where the reader is: the section being read, and whether the inline Contents has scrolled away. */
interface Progress {
  active: number;
  past: boolean;
}

/**
 * Reading: a project, role or About opens as a full-window page grown out of the device's
 * screen (see engine/reading.ts). A bar on top leads back to the list it came from; once the
 * article's Contents has scrolled away, the bar also shows the current section and opens the
 * Contents as a menu. The article scrolls natively.
 */
export function Reader() {
  const reading = useDevice((s) => s.reading);
  const [sections, setSections] = useState<Section[]>([]);
  const [progress, setProgress] = useState<Progress>({ active: 0, past: false });

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
          {sections.length > 0 && (
            <SectionMenu sections={sections} active={progress.active} shown={progress.past} />
          )}
        </header>
        <Article
          key={doc.key}
          doc={doc}
          onSections={setSections}
          onProgress={(next) =>
            setProgress((p) => (p.active === next.active && p.past === next.past ? p : next))
          }
        />
      </div>
    </div>
  );
}

/** The current section in the bar; it opens the Contents as a menu. */
function SectionMenu({
  sections,
  active,
  shown,
}: {
  sections: Section[];
  active: number;
  shown: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  if (open && !shown) setOpen(false);

  // Esc closes the menu (not the page); so does a tap anywhere else
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    addEventListener('keydown', onKey, true);
    addEventListener('pointerdown', onDown, true);
    return () => {
      removeEventListener('keydown', onKey, true);
      removeEventListener('pointerdown', onDown, true);
    };
  }, [open]);

  const current = sections[active]!;
  return (
    <div className={`secmenu${shown ? ' on' : ''}${open ? ' open' : ''}`} ref={root}>
      <button
        className="current"
        aria-expanded={open}
        aria-label={`Contents, now reading ${current.title}`}
        tabIndex={shown ? 0 : -1}
        onClick={() => setOpen(!open)}
      >
        <span className="n">{pad(active)}</span>
        <span className="of">/{pad(sections.length - 1)}</span>
        <span className="t">{current.title}</span>
        <ChevronDown aria-hidden />
      </button>
      <nav className="drop" aria-label="Contents">
        <ol>
          {sections.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={i === active ? 'now' : undefined}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setOpen(false);
                  goTo(s.id);
                }}
              >
                <span>{pad(i)}</span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

/** An article's HTML, rendered by the page into a <template> (see ArticleTemplates.astro). */
export function articleHtml(key: string): string {
  return (
    document.querySelector<HTMLTemplateElement>(`template[data-article="${key}"]`)?.innerHTML ?? ''
  );
}

/** Articles with this many sections get a Contents list. */
const MIN_SECTIONS = 3;

const pad = (i: number) => String(i + 1).padStart(2, '0');
const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Where a heading sits in the scroller (headings can be nested inside components). */
const headingTop = (read: HTMLElement, h: Element) =>
  h.getBoundingClientRect().top - read.getBoundingClientRect().top + read.scrollTop;

/** Eases the page to a section and moves focus there, for keyboard and screen reader users. */
function goTo(id: string) {
  const read = reader.readEl();
  const h = read?.querySelector<HTMLElement>(`h2[id="${id}"]`);
  if (!read || !h) return;
  reader.scrollTo(Math.max(0, headingTop(read, h) - 24));
  h.tabIndex = -1;
  h.focus({ preventScroll: true });
}

function Article({
  doc,
  onSections,
  onProgress,
}: {
  doc: DocRef;
  onSections: (sections: Section[]) => void;
  onProgress: (progress: Progress) => void;
}) {
  const html = useMemo(() => articleHtml(doc.key), [doc.key]);
  const el = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<Section[]>([]);

  // Contents, like the old case studies: a numbered list just before the first section, built
  // from the article's headings (inserted into the article HTML, so it scrolls with it)
  useLayoutEffect(() => {
    const read = el.current;
    if (!read) return;
    const found = [...read.querySelectorAll<HTMLElement>('h2[id]')].map((h) => ({
      id: h.id,
      title: h.textContent ?? '',
    }));
    const list = found.length >= MIN_SECTIONS ? found : [];
    setSections(list);
    onSections(list);
    if (!list.length) return;
    let first: Element = read.querySelector('h2[id]')!;
    while (first.parentElement && first.parentElement !== read) first = first.parentElement;
    const nav = document.createElement('nav');
    nav.className = 'contents';
    nav.setAttribute('aria-label', 'Contents');
    nav.innerHTML = `<p class="clabel">Contents</p><ol>${list
      .map(
        (s, i) =>
          `<li><button type="button" data-section="${s.id}"><span>${pad(i)}</span>${escape(s.title)}</button></li>`,
      )
      .join('')}</ol>`;
    read.insertBefore(nav, first);
    return () => nav.remove();
  }, [html]);

  // which section is being read, and whether the inline Contents has scrolled away
  useEffect(() => {
    const read = el.current;
    if (!read || !sections.length) return;
    const nav = read.querySelector('.contents');
    const heads = sections.map((s) => read.querySelector(`h2[id="${s.id}"]`));
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = read.scrollTop + read.clientHeight * 0.3;
      let active = 0;
      heads.forEach((h, i) => {
        if (h && headingTop(read, h) <= line) active = i;
      });
      const past = !!nav && nav.getBoundingClientRect().bottom < read.getBoundingClientRect().top;
      onProgress({ active, past });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    read.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      read.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [sections]);

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

  return (
    <div
      className="read"
      ref={el}
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(e) => {
        const id = (e.target as Element).closest<HTMLElement>('[data-section]')?.dataset.section;
        if (id) goTo(id);
      }}
    />
  );
}
