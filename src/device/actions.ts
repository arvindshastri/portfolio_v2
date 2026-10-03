import { SITE } from '@/data/site';
import { TRACKS } from '@/data/tracks';
import { applyThemeTokens, THEMES, themeById } from '@/data/themes';
import { click, ensureAudio, vibe } from './engine/audio';
import * as brick from './engine/brick';
import * as music from './engine/music';
import * as reader from './engine/reader';
import { settle } from './engine/slide';
import { applyZoom, resetZoom } from './engine/zoom';
import { frameEls, reducedMotion, refs } from './refs';
import { save } from './storage';
import { getState, newFrame, patchFrame, setState, top, type Toast } from './store';
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
  if (s.sticky) return closePeek();
  if (s.busy) return;
  if (s.zoomed) return closeDoc();
  if (s.stack.length < 2) return bump();
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
  if (s.sticky) closePeek();
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

export function bump() {
  refs.dev?.animate([{ translate: '0 0' }, { translate: '0 -2px' }, { translate: '0 0' }], {
    duration: 220,
    easing: 'cubic-bezier(.25,1,.5,1)',
  });
}

/* ===================== input ===================== */

/** Any input dismisses the guide. */
function anyInput() {
  if (getState().guide) showGuide(false);
}

/** One step of the wheel (or an arrow key, or a mouse-wheel notch). */
export function step(d: 1 | -1) {
  const s = getState();
  if (s.sticky) return closePeek();
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
        bump();
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

/** The center button. */
export function select() {
  const s = getState();
  if (s.sticky) return closePeek();
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
  if (n.type === 'cf') return openPeek(true);
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
  if (top().node.type === 'doc') {
    reader.jumpSection(d);
    click();
    return;
  }
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

/* ===================== reading: zoom into the screen ===================== */

export function openDoc(doc: DocRef) {
  const s = getState();
  if (s.zoomed || s.busy) return;
  setState({ busy: true, redraw: true });
  click(2);
  setTimeout(() => {
    const prev = top();
    const frame = newFrame({ type: 'doc', title: doc.title, doc });
    setState((st) => ({
      stack: [...st.stack.map((f) => (f.id === prev.id ? { ...f, hidden: true } : f)), frame],
      slide: null,
    }));
    zoomIn(true);
    if (doc.slug) urlOpen(doc);
  }, 140);
}

function zoomIn(already: boolean) {
  if (getState().zoomed) return;
  setState({ zoomed: true, busy: true, redraw: true }); // 1. the display blanks
  setTimeout(
    () => {
      // 2. reflow and camera push while it's blank
      bodyClass('zoomed', true);
      refs.dev?.style.setProperty('--tx', '0deg');
      refs.dev?.style.setProperty('--ty', '0deg');
      applyZoom();
    },
    already ? 0 : 140,
  );
  setTimeout(() => setState({ redraw: false, busy: false }), already ? 440 : 560); // 3. redraw at the new size
}

function zoomOut(andPop: boolean) {
  if (!getState().zoomed) return;
  setState({ zoomed: false, busy: true, redraw: true });
  setTimeout(() => {
    if (andPop) popNow();
    bodyClass('zoomed', false);
    resetZoom();
  }, 140);
  setTimeout(() => setState({ redraw: false, busy: false }), 620);
  click(2);
}

/** MENU while reading. Project pages have URLs, so going back also goes back in history. */
function closeDoc() {
  if (history.state?.doc) {
    history.back(); // the popstate handler zooms out
    return;
  }
  zoomOut(true);
  urlReset();
}

export function relayout() {
  if (getState().zoomed) applyZoom();
}

/* ===================== project URLs ===================== */

const TITLE = SITE.name;

function urlOpen(doc: DocRef) {
  document.title = `${doc.title} · ${TITLE}`;
  const path = `/projects/${doc.slug}/`;
  if (location.pathname !== path) history.pushState({ doc: doc.slug }, '', path);
}

function urlReset() {
  document.title = TITLE;
  if (location.pathname !== '/') history.replaceState(null, '', '/');
}

/** Browser back/forward. */
export function onHistory(state: { doc?: string } | null) {
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

/* ===================== peek: hold the center ===================== */

export function peekTarget() {
  const s = getState();
  if (s.locked) return null;
  const f = top();
  if (f.node.type === 'cf') return { kind: 'photo' as const, index: f.sel };
  if (f.node.type !== 'list') return null;
  const item = f.node.items[f.sel]!;
  return item.doc ? { kind: 'doc' as const, doc: item.doc } : null;
}

export function openPeek(sticky = false) {
  const target = peekTarget();
  if (!target) return;
  setState({ peek: target, sticky });
  bodyClass('peeking', true);
  click(2);
  vibe(12);
}

export function closePeek() {
  setState({ peek: null, sticky: false });
  bodyClass('peeking', false);
}

let holdTimer = 0;
let held = false;

/** Center button pressed: hold for 320ms to peek. */
export function centerDown() {
  ensureAudio();
  held = false;
  holdTimer = window.setTimeout(() => {
    if (peekTarget()) {
      held = true;
      openPeek();
    }
  }, 320);
}

/** Any pointer released: a held peek closes. */
export function pointerReleased() {
  clearTimeout(holdTimer);
  const s = getState();
  if (s.peek && !s.sticky) closePeek();
}

export function centerClick() {
  if (held) {
    held = false;
    return;
  }
  if (getState().sticky) return closePeek();
  select();
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
