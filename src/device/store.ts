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

export type Peek = null | { kind: 'doc'; doc: DocRef } | { kind: 'photo'; index: number };

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
  zoomed: boolean;
  /** Input is ignored while a zoom is mid-flight. */
  busy: boolean;
  /** The screen is blanked for a moment so a reflow never shows. */
  redraw: boolean;

  color: string;
  dark: boolean;
  clicker: boolean;
  /** The secret Clear finish has been unlocked. */
  secret: boolean;

  peek: Peek;
  /** A peek opened by a press stays until the next input (holds close on release). */
  sticky: boolean;
  guide: boolean;

  pill: { app: string; msg: string } | null;
  deviceToast: string | null;
  pageToast: string | null;

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
  busy: false,
  redraw: false,
  color: load('color', 'silver'),
  dark: false,
  clicker: true,
  secret: load('secret', load('clear', false)),
  peek: null,
  sticky: false,
  guide: false,
  pill: null,
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
