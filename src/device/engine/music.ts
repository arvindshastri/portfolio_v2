import { TRACKS, type Track } from '@/data/tracks';
import { getState, setState } from '../store';
import { audioGraph, ensureAudio } from './audio';

/**
 * The music player. Tracks with a `src` play from a file; the rest are generated live with
 * Web Audio (pads, bass, kick, hats and plucks) as placeholders.
 */
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

let el: HTMLAudioElement | null = null;
let timer = 0;
let beat = 0;
let nextNote = 0;
let startedAt = 0;

const track = (): Track => TRACKS[getState().music.track]!;
const level = () => getState().music.vol * (track().src ? 0.9 : 0.5);

function patch(p: Partial<ReturnType<typeof getState>['music']>) {
  setState((s) => ({ music: { ...s.music, ...p } }));
}

function ensureElement() {
  const g = audioGraph();
  if (el || !g) return;
  el = new Audio();
  el.preload = 'auto';
  g.ctx.createMediaElementSource(el).connect(g.master);
  el.addEventListener('ended', () => play((getState().music.track + 1) % TRACKS.length));
}

function start() {
  const g = audioGraph();
  if (!g) return;
  patch({ on: true, started: true });
  void g.ctx.resume();
  g.master.gain.cancelScheduledValues(g.ctx.currentTime);
  g.master.gain.setTargetAtTime(level(), g.ctx.currentTime, 0.2);
  const t = track();
  if (t.src) {
    ensureElement();
    if (el && !el.src.endsWith(t.src)) el.src = t.src;
    el?.play().catch(() => {});
  } else {
    nextNote = g.ctx.currentTime + 0.05;
    startedAt = g.ctx.currentTime;
    clearInterval(timer);
    timer = window.setInterval(schedule, 25);
  }
}

function stop(hard = false) {
  const g = audioGraph();
  if (!g) return;
  patch({ on: false });
  g.master.gain.setTargetAtTime(0, g.ctx.currentTime, 0.12);
  clearInterval(timer);
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
  beat = 0;
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
  const g = audioGraph();
  if (!g) return { elapsed: 0, total: null, progress: 0 };
  if (track().src && el) {
    const elapsed = el.currentTime || 0;
    const total = el.duration || null;
    return { elapsed, total, progress: total ? elapsed / total : 0 };
  }
  const elapsed = getState().music.on ? Math.floor(g.ctx.currentTime - startedAt) : 0;
  return { elapsed, total: null, progress: (elapsed % 120) / 120 };
}

/* ---------- the generated placeholder tracks ---------- */

function schedule() {
  const g = audioGraph();
  if (!g) return;
  const t = track();
  const stepLength = 60 / t.bpm / 2;
  while (nextNote < g.ctx.currentTime + 0.12) {
    const b = beat % 32;
    const at = nextNote;
    const chord = t.chords[Math.floor(b / 8) % 4]!;
    if (b % 8 === 0) pad(chord, at, stepLength * 8, t);
    if (t.bpm > 66) {
      if (b % 4 === 0) kick(at);
      if (b % 4 === 2) hat(at, 0.05);
      if (b % 2 === 1) hat(at, 0.018);
    } else if (b % 8 === 0) kick(at, 0.3);
    if (b % 8 === 0 || b % 8 === 5) bass(hz(chord[0]! - 12), at, stepLength * 2);
    if (t.bpm < 75 && b % 2 === 0 && Math.random() < 0.35)
      pluck(hz(chord[Math.floor(Math.random() * 4)]! + 12), at);
    beat++;
    nextNote += stepLength;
  }
}

function pad(chord: number[], at: number, length: number, t: Track) {
  const { ctx, master } = audioGraph()!;
  for (const note of chord) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lowpass = ctx.createBiquadFilter();
    osc.type = t.wave;
    osc.frequency.value = hz(note);
    osc.detune.value = Math.random() * 10 - 5;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = t.cut;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(t.wave === 'sawtooth' ? 0.025 : 0.05, at + 0.25);
    gain.gain.linearRampToValueAtTime(0, at + length);
    osc.connect(lowpass).connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + length + 0.05);
  }
}

function pluck(freq: number, at: number) {
  const { ctx, master } = audioGraph()!;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.06, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.6);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + 0.62);
}

function bass(freq: number, at: number, length: number) {
  const { ctx, master } = audioGraph()!;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.18, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + length);
}

function kick(at: number, v = 0.5) {
  const { ctx, master } = audioGraph()!;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(110, at);
  osc.frequency.exponentialRampToValueAtTime(42, at + 0.15);
  gain.gain.setValueAtTime(v, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.25);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + 0.26);
}

function hat(at: number, v: number) {
  const { ctx, master, noise } = audioGraph()!;
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  src.buffer = noise;
  gain.gain.setValueAtTime(v, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
  src.connect(filter).connect(gain).connect(master);
  src.start(at);
  src.stop(at + 0.06);
}
