import { TRACKS, type Track } from '@/data/tracks';
import { getState, setState } from '../store';
import { audioGraph, ensureAudio } from './audio';

/** The music player: plays the playlist's audio files through the device's audio output. */
let el: HTMLAudioElement | null = null;

const track = (): Track => TRACKS[getState().music.track]!;
const level = () => getState().music.vol * 0.9;

function patch(p: Partial<ReturnType<typeof getState>['music']>) {
  setState((s) => ({ music: { ...s.music, ...p } }));
}

function ensureElement() {
  const g = audioGraph();
  if (el || !g) return;
  el = new Audio();
  el.preload = 'auto';
  g.ctx.createMediaElementSource(el).connect(g.master);
  el.addEventListener('ended', next);
}

function next() {
  play((getState().music.track + 1) % TRACKS.length);
}

function start() {
  const g = audioGraph();
  if (!g) return;
  patch({ on: true, started: true });
  void g.ctx.resume();
  g.master.gain.cancelScheduledValues(g.ctx.currentTime);
  g.master.gain.setTargetAtTime(level(), g.ctx.currentTime, 0.2);
  ensureElement();
  const src = track().src;
  if (el && !el.src.endsWith(src)) el.src = src;
  el?.play().catch(() => {});
}

function stop(hard = false) {
  const g = audioGraph();
  if (!g) return;
  patch({ on: false });
  g.master.gain.setTargetAtTime(0, g.ctx.currentTime, 0.12);
  if (!el) return;
  if (hard) {
    el.pause();
    el.removeAttribute('src');
  } else {
    setTimeout(() => {
      if (!getState().music.on) el?.pause();
    }, 200);
  }
}

export function play(index: number) {
  if (!ensureAudio()) return;
  if (getState().music.on) stop(true);
  patch({ track: index });
  start();
}

export function toggle() {
  if (!ensureAudio()) return;
  if (getState().music.on) stop();
  else start();
}

export function setVolume(v: number) {
  const vol = Math.max(0, Math.min(1, v));
  patch({ vol });
  const g = audioGraph();
  if (g && getState().music.on) g.master.gain.setTargetAtTime(level(), g.ctx.currentTime, 0.05);
}

/** Playback position for Now Playing: elapsed seconds, total (if known) and progress 0..1. */
export function position(): { elapsed: number; total: number | null; progress: number } {
  if (!el) return { elapsed: 0, total: null, progress: 0 };
  const elapsed = el.currentTime || 0;
  const total = el.duration || null;
  return { elapsed, total, progress: total ? elapsed / total : 0 };
}
