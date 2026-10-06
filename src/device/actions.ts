import { SITE } from '@/data/site';
import { TRACKS } from '@/data/tracks';
import { applyThemeTokens, THEMES, themeById } from '@/data/themes';
import { click, vibe } from './engine/audio';
import * as brick from './engine/brick';
import * as music from './engine/music';
import * as reader from './engine/reader';
import { settle } from './engine/slide';
import { shrink } from './engine/reading';
import { frameEls, reducedMotion, refs } from './refs';
import { save } from './storage';
import { getState, newFrame, patchFrame, setState, top, type Enlarged, type Toast } from './store';
import type { DocRef, Frame, ScreenNode } from './types';

/*
 * Everything the controls do. Components render from the store; this module changes it,
 * plus the few things that are imperative by nature (body classes the CSS keys off, the zoom
 * camera, timers).
 */

const bodyClass = (name: string, on: boolean) => document.body.classList.toggle(name, on);

let slideSeq = 0;
let spun = false;
const timers: Record<string, number> = {};
const later = (name: string, ms: number, fn: () => void) => {
  clearTimeout(timers[name]);
  timers[name] = window.setTimeout(fn, ms);
};

/* ===================== navigation ===================== */

export function push(node: ScreenNode): Frame {
  const prev = top();
  const frame = newFrame(node);
  setState((s) => ({
    stack: [...s.stack, frame],
    slide: prev ? { seq: ++slideSeq, dir: 1, inId: frame.id, outId: prev.id } : null,
  }));
  click(2);
  return frame;
}

export function pop() {
  const s = getState();
  if (s.photo !== null) return closePhoto();
  if (s.busy) return;
  if (s.zoomed) return closeDoc();
  // already at the main menu: nowhere to go back to
  if (s.stack.length < 2) return;
  const leaving = top();
  const rest = s.stack.slice(0, -1);
  const back = rest[rest.length - 1]!;
  setState({
    stack: rest.map((f) => (f.id === back.id ? { ...f, hidden: false } : f)),
    exiting: [...s.exiting, leaving],
    slide: { seq: ++slideSeq, dir: -1, inId: back.id, outId: leaving.id },
  });
  click(2);
}

/** Called by the screen stack when a slide lands. */
export function slideLanded(dir: 1 | -1, inId: number, outId: number, interrupted: boolean) {
  if (dir > 0) {
    if (!interrupted && top()?.id === inId) patchFrame(outId, { hidden: true });
  } else {
    setState((s) => ({ exiting: s.exiting.filter((f) => f.id !== outId) }));
  }
}

/** Pops without animating (used mid-zoom, while the screen is blanked). */
function popNow() {
  const s = getState();
  if (s.stack.length < 2) return;
  const rest = s.stack.slice(0, -1);
  const back = rest[rest.length - 1]!;
  settle(frameEls.get(back.id));
  setState({
    stack: rest.map((f) => (f.id === back.id ? { ...f, hidden: false } : f)),
    slide: null,
  });
}

/** Back to the main menu from anywhere (the name in the top-left corner). */
export function home() {
  const s = getState();
  if (s.photo !== null) closePhoto();
  if (s.locked) return unlock();
  if (s.zoomed) {
    closeDoc();
    later('home', 700, toRoot);
  } else toRoot();
}

function toRoot() {
  const root = getState().stack[0]!;
  settle(frameEls.get(root.id));
  setState({ stack: [{ ...root, hidden: false }], exiting: [], slide: null });
}

/**
 * The end of a list, shown on the screen rather than by moving the device: a rubber band.
 * Whatever normally moves (the list with its highlight, or the row of covers) stretches a little
 * past the edge in the direction of the spin and eases back, without overshooting.
 */
function hitEnd(f: Frame, d: 1 | -1) {
  if (reducedMotion()) return;
  const screen = frameEls.get(f.id);
  const list = screen?.querySelector<HTMLElement>('.list');
  // the highlight moves down a list, but the covers move left as you go forward
  const targets = list ? [list] : [...(screen?.querySelectorAll<HTMLElement>('.cf .it') ?? [])];
  const shift = list ? `0 ${d * 6}px` : `${-d * 10}px 0`;
  for (const el of targets)
    el.animate(
      [
        { translate: '0 0', easing: 'cubic-bezier(.3,.7,.4,1)' },
        { translate: shift, offset: 0.3, easing: 'cubic-bezier(.25,1,.5,1)' },
        { translate: '0 0' },
      ],
      { duration: 420 },
    );
}

/* ===================== input ===================== */

/** Any input dismisses the guide. */
function anyInput() {
  if (getState().guide) showGuide(false);
}

/** One step of the wheel (or an arrow key, or a mouse-wheel notch). */
export function step(d: 1 | -1) {
  const s = getState();
  if (s.photo !== null) return closePhoto();
  anyInput();
  if (!s.locked) {
    spun = true;
    refs.wheel?.classList.remove('teach');
  }
  if (s.locked || s.busy) return;
  const f = top();
  const n = f.node;
  if (n.type === 'list' || n.type === 'cf') {
    const count = n.type === 'list' ? n.items.length : getContent().photos.length;
    const next = Math.max(0, Math.min(count - 1, f.sel + d));
    if (next === f.sel) {
      if (!f.edge) {
        patchFrame(f.id, { edge: true });
        hitEnd(f, d);
      }
      return;
    }
    patchFrame(f.id, { sel: next, edge: false });
    click();
  } else if (n.type === 'doc') {
    reader.scrollBy(d * 110);
    click(0.6);
  } else if (n.type === 'np') {
    music.setVolume(s.music.vol + d * 0.08);
    showVolume();
    click();
  } else if (n.type === 'brick') {
    brick.steer(d * 46);
    click();
  }
}

/**
 * Tapping or clicking a row on the screen: the highlight moves to it, then it opens, exactly as
 * if it had been spun to and the center pressed. The short pause lets the highlight land first.
 */
export function tapRow(index: number) {
  const s = getState();
  if (s.photo !== null) return closePhoto();
  anyInput();
  if (s.locked) return unlock();
  if (s.busy) return;
  const f = top();
  if (f.node.type !== 'list' || index === f.sel) return select();
  patchFrame(f.id, { sel: index, edge: false });
  click();
  later('tap', reducedMotion() ? 0 : 140, () => {
    if (top().id === f.id) select();
  });
}

/** Photos: tapping a side cover brings it to the middle; tapping the middle one enlarges it. */
export function tapCover(index: number) {
  const s = getState();
  if (s.photo !== null) return closePhoto();
  anyInput();
  if (s.locked || s.busy) return;
  const f = top();
  if (f.node.type !== 'cf') return;
  if (index === f.sel) return enlargePhoto(index);
  patchFrame(f.id, { sel: index, edge: false });
  click();
}

/** The center button. */
export function select() {
  const s = getState();
  if (s.photo !== null) return closePhoto();
  anyInput();
  if (s.locked) return unlock();
  if (s.busy) return;
  const f = top();
  const n = f.node;
  if (n.type === 'np') return music.toggle();
  if (n.type === 'doc') {
    reader.pageDown();
    click();
    return;
  }
  if (n.type === 'brick') return brick.press();
  if (n.type === 'cf') return enlargePhoto(f.sel);
  if (n.type !== 'list') return;
  const item = n.items[f.sel]!;
  if (item.doc) return openDoc(item.doc);
  if (item.go) {
    push(item.go());
    return;
  }
  if (item.act) {
    item.act();
    click(2);
  }
}

export function playPause() {
  anyInput();
  if (getState().locked) return;
  music.toggle();
}

/** ◀◀ / ▶▶ on Now Playing skip tracks. Returns false when it isn't Now Playing. */
function skip(d: 1 | -1) {
  if (top().node.type !== 'np') return false;
  music.play((getState().music.track + d + TRACKS.length) % TRACKS.length);
  return true;
}

/** ◀◀ / ▶▶: tracks on Now Playing, sections while reading, a step elsewhere. */
export function side(d: 1 | -1) {
  if (skip(d)) return;
  step(d);
}

/** A tap on the ring, by angle: MENU at the top, play at the bottom, ◀◀ ▶▶ at the sides. */
export function ringTap(angle: number) {
  if (angle > -135 && angle < -45) pop();
  else if (angle > 45 && angle < 135) playPause();
  else if (angle > -45 && angle < 45) side(1);
  else side(-1);
}

/** Arrow keys left/right only mean something on Now Playing and in Photos. */
export function arrowSide(d: 1 | -1) {
  if (!skip(d) && top().node.type === 'cf') step(d);
}

/* ===================== reading: a full-window page ===================== */

/** Opens an article as a page grown out of the screen (see Reader and engine/reading.ts). */
export function openDoc(doc: DocRef) {
  const s = getState();
  if (s.zoomed || s.busy) return;
  const prev = top();
  const frame = newFrame({ type: 'doc', title: doc.title, doc });
  setState((st) => ({
    stack: [...st.stack.map((f) => (f.id === prev.id ? { ...f, hidden: true } : f)), frame],
    slide: null,
    zoomed: true,
    busy: true,
    reading: { doc, back: prev.node.title },
  }));
  bodyClass('zoomed', true);
  click(2);
  urlOpen(doc);
  later('read', reducedMotion() ? 0 : 620, () => setState({ busy: false }));
}

/** Shrinks the page back into the screen, which already shows the list again underneath. */
function zoomOut(andPop: boolean) {
  if (!getState().zoomed) return;
  setState({ zoomed: false, busy: true });
  if (andPop) popNow();
  bodyClass('zoomed', false);
  click(2);
  void shrink(refs.reader).then(() => setState({ reading: null, busy: false }));
}

/** MENU while reading. Project pages have URLs, so going back also goes back in history. */
function closeDoc() {
  if (history.state?.doc || history.state?.reading) {
    history.back(); // the popstate handler zooms out
    return;
  }
  zoomOut(true);
  urlReset();
}

/* ===================== project URLs ===================== */

const TITLE = SITE.name;

/**
 * Every reading page gets a history entry, so the browser's back button (and Android's back
 * gesture) closes it instead of leaving the site. Only projects change the address.
 */
function urlOpen(doc: DocRef) {
  document.title = `${doc.title} · ${TITLE}`;
  if (!doc.slug) return history.pushState({ reading: true }, '', location.pathname);
  const path = `/projects/${doc.slug}/`;
  if (location.pathname !== path) history.pushState({ doc: doc.slug }, '', path);
}

function urlReset() {
  document.title = TITLE;
  if (location.pathname !== '/') history.replaceState(null, '', '/');
}

/** Browser back/forward. */
export function onHistory(state: { doc?: string; reading?: boolean } | null) {
  // back with an image enlarged only closes the image (its entry sits on top of the page's)
  if (getState().photo !== null) return hidePhoto();
  if (state?.doc) {
    const project = getContent().projects.find((p) => p.slug === state.doc);
    if (project && !getState().zoomed) openDoc(projectDoc(project.slug, project.title));
  } else if (getState().zoomed) {
    zoomOut(true);
    document.title = TITLE;
  }
}

export const projectDoc = (slug: string, title: string): DocRef => ({
  key: `project:${slug}`,
  title,
  slug,
});

/* ===================== photos: press to enlarge ===================== */

/** Enlarges an image over the page (see EnlargedPhoto); the next input of any kind closes it. */
function enlarge(image: Enlarged) {
  setState({ photo: image });
  bodyClass('photo-open', true);
  click(2);
  vibe(12);
  // while reading, the back button (or Android's back gesture) closes the image, not the page
  if (getState().zoomed) history.pushState({ ...history.state, image: true }, '', location.href);
}

/** Photos: the photo at `index`. */
export function enlargePhoto(index: number) {
  const p = getContent().photos[index]!;
  enlarge({ thumb: p.thumb, full: p.full, alt: p.caption, caption: p.caption });
}

/** An image in an article: shown from what's on the page, then its largest size. */
export function enlargeImage(img: HTMLImageElement) {
  const sizes = (img.srcset || '')
    .split(',')
    .map((c) => c.trim().split(/\s+/))
    .filter(([url]) => url)
    .map(([url, w]) => ({ url: url!, w: parseInt(w ?? '0') }));
  const largest = sizes.sort((a, b) => b.w - a.w)[0]?.url ?? img.currentSrc ?? img.src;
  const caption = img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() ?? '';
  enlarge({ thumb: img.currentSrc || img.src, full: largest, alt: img.alt, caption });
}

export function closePhoto() {
  if (history.state?.image) return history.back(); // the history handler closes it
  hidePhoto();
}

function hidePhoto() {
  setState({ photo: null });
  bodyClass('photo-open', false);
}

/* ===================== lock screen, hints, toasts ===================== */

export function unlock() {
  setState({ locked: false });
  bodyClass('locked', false);
  click(2);
  vibe(15);
  teachSpin();
}

/** After unlocking, if the wheel hasn't been spun, a highlight runs around the ring. */
function teachSpin() {
  for (const t of [2600, 11000])
    setTimeout(() => {
      const w = refs.wheel;
      if (spun || getState().zoomed || !w) return;
      w.classList.remove('teach');
      void w.offsetWidth;
      w.classList.add('teach');
    }, t);
}

/** The lock screen nudges the center button; only if that doesn't land does text appear. */
export function scheduleHint() {
  setTimeout(() => setState({ hintLate: true }), reducedMotion() ? 3000 : 12000);
}

/** A toast at the bottom of the device screen. */
function deviceToast(toast: Toast, ms = 1800) {
  setState({ deviceToast: toast });
  later('deviceToast', ms, () => setState({ deviceToast: null }));
}

/** The one-time reward for clearing Brick. */
export function announceUnlock() {
  deviceToast({ icon: 'unlocked', text: 'Clear finish unlocked' }, 3600);
  click(1);
  vibe(8);
}

function showVolume() {
  setState({ volumeShown: true });
  later('vol', 1100, () => setState({ volumeShown: false }));
}

export function showGuide(on: boolean) {
  setState({ guide: on });
  bodyClass('guide', on);
}

export function copyEmail(onDevice: boolean) {
  const email = SITE.email;
  void navigator.clipboard?.writeText(email).catch(() => {});
  const toast: Toast = { icon: 'copied', text: `Copied ${email}` };
  if (onDevice) deviceToast(toast);
  else {
    setState({ pageToast: toast });
    later('pageToast', 1800, () => setState({ pageToast: null }));
  }
  vibe(10);
}

/* ===================== colors ===================== */

export function setColor(id: string) {
  const s = getState();
  let theme = themeById(id);
  if (theme.secret && !s.secret) theme = THEMES[0]!;
  setState({ color: theme.id });
  save('color', theme.id);
  applyThemeTokens(theme);
  setDark(theme.screen === 'dark');
}

export function setDark(on: boolean) {
  setState({ dark: on });
  bodyClass('dark', on);
}

export const availableThemes = () => THEMES.filter((t) => !t.secret || getState().secret);

export function nextColor() {
  const list = availableThemes();
  const i = list.findIndex((t) => t.id === getState().color);
  setColor(list[(i + 1) % list.length]!.id);
}

/** Clearing Brick unlocks the Clear finish. Returns true the first time. */
export function unlockSecret() {
  if (getState().secret) return false;
  setState({ secret: true });
  save('secret', true);
  announceUnlock();
  return true;
}

/* ===================== content ===================== */

let content: import('./types').DeviceContent;
export const setContent = (c: import('./types').DeviceContent) => (content = c);
export const getContent = () => content;
