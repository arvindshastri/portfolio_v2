import type { Game } from '@/data/themes';
import { create } from 'zustand';
import type { DocRef, Frame, ScreenNode } from './types';
import { load } from './storage';

export interface MusicState {
  on: boolean;
  /** Something has been played at least once (the status bar shows ❚❚ instead of nothing). */
  started: boolean;
  track: number;
  vol: number;
}

/** A short message: on the device screen, or by the page links. */
export interface Toast {
  icon: 'copied';
  text: string;
}

/** An enlarged image: shown at once from `thumb` (already loaded), then `full` once decoded. */
export interface Enlarged {
  thumb: string;
  full: string;
  alt: string;
  caption: string;
}

/** A screen transition in progress: the stack renders it, then reports back when it lands. */
export interface Slide {
  seq: number;
  dir: 1 | -1;
  inId: number;
  outId: number;
}

export interface DeviceState {
  stack: Frame[];
  /** Screens popped off the stack that are still sliding out. */
  exiting: Frame[];
  slide: Slide | null;

  locked: boolean;
  /** Reading: an article is open as a full-window page. */
  zoomed: boolean;
  /** The article on the reading page, and the list it came from (kept while the page closes). */
  reading: { doc: DocRef; back: string } | null;
  /** Input is ignored while a zoom is mid-flight. */
  busy: boolean;
  /** The screen is blanked for a moment so a reflow never shows. */

  color: string;
  dark: boolean;
  clicker: boolean;
  /** Which games' secret finishes have been earned (Brick: Clear, Stack: Red). */
  unlocked: Record<Game, boolean>;

  /** The image enlarged over the page (a photo, or an image in an article), until the next input. */
  photo: Enlarged | null;
  guide: boolean;

  deviceToast: Toast | null;
  pageToast: Toast | null;

  music: MusicState;
  volumeShown: boolean;

  /** The unlock hint is allowed to show (the visitor hasn't found the button for a while). */
  hintLate: boolean;
  now: Date;
}

let nextFrameId = 1;
export const newFrame = (node: ScreenNode, sel = 0): Frame => ({
  id: nextFrameId++,
  node,
  sel,
  edge: false,
  hidden: false,
});

export const useDevice = create<DeviceState>()(() => ({
  stack: [],
  exiting: [],
  slide: null,
  locked: true,
  zoomed: false,
  reading: null,
  busy: false,
  color: load('color', 'silver'),
  dark: false,
  clicker: true,
  unlocked: { brick: load('secret', load('clear', false)), stack: load('red', false) },
  photo: null,
  guide: false,
  deviceToast: null,
  pageToast: null,
  music: { on: false, started: false, track: 0, vol: 0.55 },
  volumeShown: false,
  hintLate: false,
  now: new Date(),
}));

export const getState = useDevice.getState;
export const setState = useDevice.setState;

/** The screen currently on top. */
export const top = (): Frame => {
  const { stack } = getState();
  return stack[stack.length - 1]!;
};

/** Updates one frame on the stack. */
export function patchFrame(id: number, patch: Partial<Frame>) {
  setState((s) => ({ stack: s.stack.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
}
