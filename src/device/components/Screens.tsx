import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { TRACKS } from '@/data/tracks';
import * as actions from '../actions';
import { audioGraph } from '../engine/audio';
import * as brick from '../engine/brick';
import * as music from '../engine/music';
import { slide } from '../engine/slide';
import { frameEls } from '../refs';
import { useDevice } from '../store';
import type { DocRef, Frame } from '../types';
import { ListScreen } from './ListScreen';
import { AlbumArt } from './Preview';

/**
 * The navigation stack. Every screen stays mounted while it's on the stack (hidden when covered),
 * and screens popped off stay mounted until they've slid away.
 */
export function Screens() {
  const stack = useDevice((s) => s.stack);
  const exiting = useDevice((s) => s.exiting);
  const transition = useDevice((s) => s.slide);
  const redraw = useDevice((s) => s.redraw);

  useLayoutEffect(() => {
    if (!transition) return;
    const { dir, inId, outId } = transition;
    const inEl = frameEls.get(inId);
    const outEl = frameEls.get(outId);
    if (!inEl || !outEl) return;
    void slide(inEl, outEl, dir).then((out) => {
      // forward: the covered screen is hidden next, so its parked position can go.
      // back: the leaving screen holds its off-screen position until it unmounts.
      if (dir > 0) out?.cancel();
      actions.slideLanded(dir, inId, outId, !out);
    });
  }, [transition?.seq]);

  // going back, the screen leaving sits on top of the one returning
  return (
    <div className={`screens${redraw ? ' redraw' : ''}`}>
      {[...stack, ...exiting].map((frame) => (
        <Screen key={frame.id} frame={frame} />
      ))}
    </div>
  );
}

function Screen({ frame }: { frame: Frame }) {
  const register = (el: HTMLDivElement | null) => {
    if (el) frameEls.set(frame.id, el);
    else frameEls.delete(frame.id);
  };
  const { node } = frame;
  return (
    <div ref={register} className={`scr${frame.hidden ? ' gone' : ''}`}>
      {node.type === 'list' && <ListScreen frame={frame} node={node} />}
      {node.type === 'doc' && <Article doc={node.doc} />}
      {node.type === 'np' && <NowPlaying />}
      {node.type === 'cf' && <CoverFlow sel={frame.sel} />}
      {node.type === 'brick' && <BrickScreen />}
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

  // live prototypes load only when they scroll near view (Figma embeds are heavy). This checks
  // scroll positions rather than using IntersectionObserver, which misfires inside the scaled screen.
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

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`;

function NowPlaying() {
  const { track, on } = useDevice((s) => s.music);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLElement>(null);
  const elapsed = useRef<HTMLSpanElement>(null);
  const remaining = useRef<HTMLSpanElement>(null);
  const t = TRACKS[track]!;

  // the visualizer and the progress bar update every frame, outside React
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = canvas.current;
      const g = audioGraph();
      if (c && g) {
        const x = c.getContext('2d')!;
        const bins = new Uint8Array(g.analyser.frequencyBinCount);
        g.analyser.getByteFrequencyData(bins);
        x.clearRect(0, 0, c.width, c.height);
        const n = 40;
        const w = c.width / n;
        x.fillStyle = getComputedStyle(document.body).getPropertyValue('--sel');
        for (let i = 0; i < n; i++) {
          const v = on ? (bins[i + 2] ?? 0) / 255 : 0;
          const h = Math.max(4, v * c.height);
          x.globalAlpha = 0.35 + v * 0.65;
          x.beginPath();
          x.roundRect(i * w + 2, c.height - h, w - 4, h, 3);
          x.fill();
        }
        const pos = music.position();
        if (elapsed.current) elapsed.current.textContent = formatTime(pos.elapsed);
        if (remaining.current && pos.total)
          remaining.current.textContent = `-${formatTime(pos.total - pos.elapsed)}`;
        if (bar.current) bar.current.style.width = `${pos.progress * 100}%`;
      }
      if (on) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [on, track]);

  return (
    <div className="np">
      <div className="row">
        <div className="art">
          <AlbumArt track={track} />
        </div>
        <div>
          <span>
            {track + 1} of {TRACKS.length}
          </span>
          <b>{t.name}</b>
          <span>{t.artist ?? 'Arvind Shastri'}</span>
          <span>{on ? 'Playing' : 'Paused'}</span>
        </div>
      </div>
      <canvas ref={canvas} width={600} height={104} />
      <div className="bar">
        <i ref={bar} />
      </div>
      <div className="meta">
        <span ref={elapsed}>0:00</span>
        <span ref={remaining}>{t.src ? '' : `${t.bpm} bpm`}</span>
      </div>
    </div>
  );
}

/** Photos: the covers move to their new positions (CSS transitions), nothing re-mounts. */
function CoverFlow({ sel }: { sel: number }) {
  const photos = actions.getContent().photos;
  return (
    <div className="cf">
      {photos.map((p, i) => {
        const o = i - sel;
        const a = Math.abs(o);
        const sign = Math.sign(o);
        const style: React.CSSProperties = {
          transform: `translateX(${o === 0 ? 0 : sign * (70 + a * 34)}px) translateZ(${o === 0 ? 50 : -40 - a * 6}px) rotateY(${-sign * 64}deg)`,
          zIndex: 20 - a,
          opacity: a > 3 ? 0 : 1,
          filter: `brightness(${o === 0 ? 1 : 0.72})`,
        };
        return (
          <div className="it" style={style} key={p.thumb}>
            <img
              src={p.thumb}
              alt={p.caption}
              decoding="sync"
              style={{ objectPosition: '50% 25%' }}
            />
            <img
              className="rf"
              src={p.thumb}
              alt=""
              decoding="sync"
              style={{ objectPosition: '50% 25%' }}
            />
          </div>
        );
      })}
      <div className="cap">
        {photos[sel]!.caption}
        <small>
          {sel + 1} of {photos.length}
        </small>
      </div>
    </div>
  );
}

function BrickScreen() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    brick.start(canvas.current!, actions.unlockSecret);
    return brick.stop;
  }, []);
  return <canvas ref={canvas} className="brick" width={656} height={560} />;
}
