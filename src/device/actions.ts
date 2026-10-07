import { SITE } from '@/data/site';
import { TRACKS } from '@/data/tracks';
import { applyThemeTokens, THEMES, themeById, type Game } from '@/data/themes';
import { click, vibe } from './engine/audio';
import * as brick from './engine/brick';
import * as stack from './engine/stack';
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
  // forward redoes it: Now Playing directly, anything else by choosing the same row again
  remember(node.type === 'np' ? { np: true } : { via: prev?.sel });
  click(2);
  return frame;
}

/** MENU, Esc and the on-screen back buttons: one step back, the same as the browser's back. */
export function pop() {
  const s = getState();
  if (s.photo !== null) return closePhoto();
  if (s.busy) return;
  if (s.zoomed) return back(() => closeReading());
  // already at the main menu: nowhere to go back to
  if (s.stack.length < 2) return;
  back(popScreen);
}

/** Slides back to the screen below. */
function popScreen() {
  const s = getState();
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
  if (s.locked) return unlock();
  // every step has a history entry: going back past all of them unwinds the device too
  if (level > 0) return history.go(-level);
  if (s.photo !== null) hidePhoto();
  if (s.zoomed) {
    closeReading();
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
  const band = (el: HTMLElement, rest: Keyframe, out: Keyframe) =>
    el.animate(
      [
        { ...rest, easing: 'cubic-bezier(.3,.7,.4,1)' },
        { ...out, offset: 0.3, easing: 'cubic-bezier(.25,1,.5,1)' },
        rest,
      ],
      { duration: 420 },
    );
  // the highlight moves down a list. The list moves by plain `transform` and has no layer of its
  // own otherwise: on phones, a list kept on its own layer could stop being drawn after its screen
  // had been hidden behind another one, and the rubber band was the moment it vanished.
  if (list) return void band(list, { transform: 'none' }, { transform: `translateY(${d * 6}px)` });
  // the covers move left as you go forward (`translate`, so it adds to each cover's own transform)
  for (const el of screen?.querySelectorAll<HTMLElement>('.cf .it') ?? [])
    band(el, { translate: '0 0' }, { translate: `${-d * 10}px 0` });
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
  if (n.type === 'stack') return stack.press();
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

/**
 * ◀◀ / ▶▶ skip tracks on Now Playing, and on any list while music is playing (like the real
 * thing). Returns false when they don't.
 */
function skip(d: 1 | -1) {
  const type = top().node.type;
  if (type !== 'np' && !(type === 'list' && getState().music.on)) return false;
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
  document.title = `${doc.title} · ${TITLE}`;
  // only projects change the address
  remember({ doc }, doc.slug ? `/projects/${doc.slug}/` : undefined);
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

/** Closes the reading page, back to the list it came from. */
function closeReading() {
  zoomOut(true);
  document.title = TITLE;
  if (location.pathname !== '/' && level === 0) history.replaceState(null, '', '/');
}

/* ===================== history: back undoes one step ===================== */

const TITLE = SITE.name;

/**
 * Every step deeper on the device (a screen, a reading page, an enlarged image) gets a history
 * entry that records how deep it is, so the browser's back button and Android's back gesture undo
 * exactly one step, like MENU. MENU and the on-screen back buttons also go back through history,
 * so the two can never disagree; the history handler (`onHistory`) does the undoing. Only
 * projects change the address.
 */
let level = 0;
/** Set while redoing a step for the forward button, which already has its entry. */
let replaying = false;

/** What an entry needs to redo its step when the forward button returns to it. */
interface Step {
  /** A screen opened from this row of the list below it. */
  via?: number;
  np?: boolean;
  doc?: DocRef;
  image?: Enlarged;
}

function remember(step: Step = {}, url = location.pathname) {
  if (replaying) return;
  level += 1;
  history.pushState({ ...step, level }, '', url);
}

/** One step back through history, or directly when the step has no entry. */
function back(direct: () => void) {
  if (level > 0) history.back();
  else direct();
}

/** A page opened straight into a project: Menu, then Projects, then the project, as if navigated. */
export function startAtProject() {
  history.replaceState(null, '', '/');
  remember();
}

/** Browser back/forward. */
export function onHistory(state: (Step & { level?: number }) | null) {
  const target = state?.level ?? 0;
  if (target > level) {
    // forward: redo the step this entry records (one at a time, as the button goes)
    if (target === level + 1 && state) redo(state);
    level = target;
    return;
  }
  if (target === level) return;
  // back: undo the steps above the entry we landed on, top first
  let steps = level - target;
  level = target;
  if (getState().photo !== null && steps > 0) {
    hidePhoto();
    steps--;
  }
  if (getState().zoomed && steps > 0) {
    zoomOut(true);
    document.title = TITLE;
    steps--;
  }
  if (steps === 1) popScreen();
  else if (steps > 1) popScreens(steps);
}

function redo(step: Step) {
  replaying = true;
  try {
    if (step.image) return enlarge(step.image);
    if (step.doc) return openDoc(step.doc);
    if (step.np) return void push({ type: 'np', title: 'Now Playing' });
    const f = top();
    const item = step.via != null && f.node.type === 'list' ? f.node.items[step.via] : null;
    if (item?.go) {
      patchFrame(f.id, { sel: step.via! });
      push(item.go());
    }
  } finally {
    replaying = false;
  }
}

/** Several screens at once (the name, or a long jump back): no slide. */
function popScreens(n: number) {
  const s = getState();
  const rest = s.stack.slice(0, Math.max(1, s.stack.length - n));
  const back = rest[rest.length - 1]!;
  settle(frameEls.get(back.id));
  setState({
    stack: rest.map((f) => (f.id === back.id ? { ...f, hidden: false } : f)),
    exiting: [],
    slide: null,
  });
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
  remember({ image });
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
  back(hidePhoto);
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
}

/**
 * If the visitor is still on the lock screen after a few seconds, a notification says how to
 * unlock.
 */
export function scheduleHint() {
  setTimeout(() => setState({ hintLate: true }), reducedMotion() ? 3000 : 8000);
}

/** A toast at the bottom of the device screen. */
function deviceToast(toast: Toast, ms = 1800) {
  setState({ deviceToast: toast });
  later('deviceToast', ms, () => setState({ deviceToast: null }));
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
  if (theme.secret && !s.unlocked[theme.secret]) theme = THEMES[0]!;
  setState({ color: theme.id });
  save('color', theme.id);
  applyThemeTokens(theme);
  setDark(theme.screen === 'dark');
}

export function setDark(on: boolean) {
  setState({ dark: on });
  bodyClass('dark', on);
}

export const availableThemes = () =>
  THEMES.filter((t) => !t.secret || getState().unlocked[t.secret]);

export function nextColor() {
  const list = availableThemes();
  const i = list.findIndex((t) => t.id === getState().color);
  setColor(list[(i + 1) % list.length]!.id);
}

/** Clearing Brick unlocks Clear; stacking 30 high unlocks Red. Returns true the first time. */
export function unlockSecret(game: Game) {
  const { unlocked } = getState();
  if (unlocked[game]) return false;
  setState({ unlocked: { ...unlocked, [game]: true } });
  save(game === 'brick' ? 'secret' : 'red', true);
  return true;
}

/* ===================== content ===================== */

let content: import('./types').DeviceContent;
export const setContent = (c: import('./types').DeviceContent) => (content = c);
export const getContent = () => content;
