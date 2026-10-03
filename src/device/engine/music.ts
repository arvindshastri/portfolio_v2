import { TRACKS, type Song, type Track } from '@/data/tracks';
import { getState, setState } from '../store';
import { audioGraph, ensureAudio } from './audio';

/**
 * The music player. Tracks with a `src` play from a file; tracks with a `song` are lo-fi
 * generated live with Web Audio: a song form with sections, swing, fresh melodies per
 * section, drum fills, a filter that moves with the arrangement and a texture bed.
 */
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

let el: HTMLAudioElement | null = null;
let timer = 0;
/** 16th notes since the generated song started */
let step = 0;
let nextNote = 0;
let startedAt = 0;
let ending = 0;

const track = (): Track => TRACKS[getState().music.track]!;
const level = () => getState().music.vol * (track().src ? 0.9 : 0.55);

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
  const t = track();
  if (t.src) {
    ensureElement();
    if (el && !el.src.endsWith(t.src)) el.src = t.src;
    el?.play().catch(() => {});
  } else if (t.song) {
    const song = t.song;
    nextNote = g.ctx.currentTime + 0.08;
    startedAt = nextNote - step * stepLength(song);
    ensureBus();
    startBed(song);
    if (step % 64 !== 0) sectionStart(song, Math.floor(step / 64), nextNote);
    clearInterval(timer);
    timer = window.setInterval(() => schedule(song), 25);
  }
}

function stop(hard = false) {
  const g = audioGraph();
  if (!g) return;
  patch({ on: false });
  g.master.gain.setTargetAtTime(0, g.ctx.currentTime, 0.12);
  clearInterval(timer);
  clearTimeout(ending);
  stopBed();
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
  step = 0;
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
  const t = track();
  if (!g) return { elapsed: 0, total: null, progress: 0 };
  if (t.src && el) {
    const elapsed = el.currentTime || 0;
    const total = el.duration || null;
    return { elapsed, total, progress: total ? elapsed / total : 0 };
  }
  if (!t.song) return { elapsed: 0, total: null, progress: 0 };
  const total = t.song.form.length * 64 * stepLength(t.song);
  const at = getState().music.on ? g.ctx.currentTime : startedAt + step * stepLength(t.song);
  const elapsed = Math.max(0, Math.min(total, at - startedAt));
  return { elapsed, total, progress: elapsed / total };
}

/* ---------- the generated lo-fi songs ---------- */

const stepLength = (song: Song) => 60 / song.bpm / 4;

/** A small seeded random generator, so a song's melodies are the same every time it plays. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One melody note: when it starts in the bar (16ths), which chord tone, and how long. */
interface Note {
  at: number;
  tone: number;
  len: number;
}

let phrase: Note[][] = [];
let fx = Math.random;

/** A 1-bar figure: a few chord tones on a lo-fi rhythm. */
function figure(rand: () => number, density: number): Note[] {
  const slots = [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14];
  const notes: Note[] = [];
  let tone = Math.floor(rand() * 4);
  for (const at of slots) {
    if (rand() > density) continue;
    tone = Math.max(0, Math.min(6, tone + Math.floor(rand() * 5) - 2));
    notes.push({ at, tone, len: 1 + Math.floor(rand() * 3) });
  }
  if (!notes.length) notes.push({ at: 0, tone: 2, len: 4 });
  return notes;
}

/**
 * The melody for one section (4 bars). Each section letter has its own motif; bar 2 varies
 * it, bar 3 answers with something new, and bar 4 resolves on a long note.
 */
function writePhrase(song: Song, letter: string, index: number): Note[][] {
  const motif = seeded(song.seed * 131 + letter.charCodeAt(0));
  const vary = seeded(song.seed * 977 + index * 31);
  const density = song.melody === 'sparse' ? 0.32 : 0.24;
  const a = figure(motif, density);
  const b = a
    .filter(() => vary() > 0.2)
    .map((n) => ({ ...n, tone: Math.max(0, n.tone + (vary() < 0.5 ? 1 : -1)) }));
  const c = figure(vary, density * 0.9);
  const home = vary() < 0.5 ? 0 : 2;
  const d: Note[] =
    vary() < 0.5
      ? [
          { at: 0, tone: home + 2, len: 2 },
          { at: 2, tone: home, len: 10 },
        ]
      : [{ at: 0, tone: home, len: 8 + Math.floor(vary() * 4) }];
  return [a, b.length ? b : a, c, d];
}

function sectionStart(song: Song, index: number, at: number) {
  const letter = song.form[index]!;
  phrase = writePhrase(song, letter, index);
  fx = seeded(song.seed * 7 + index * 13);
  // the whole mix's lowpass follows the arrangement: it opens up through the intro, closes
  // for the breakdown and sinks away in the outro
  const f = bus!.filter.frequency;
  const len = 64 * stepLength(song);
  f.cancelScheduledValues(at);
  f.setValueAtTime(f.value, at);
  if (letter === 'I') {
    f.setValueAtTime(song.cut * 0.35, at);
    f.exponentialRampToValueAtTime(song.cut, at + len);
  } else if (letter === 'D') f.exponentialRampToValueAtTime(song.cut * 0.45, at + 1.5);
  else if (letter === 'O') f.exponentialRampToValueAtTime(song.cut * 0.2, at + len);
  else f.exponentialRampToValueAtTime(song.cut, at + 1);
}

function schedule(song: Song) {
  const g = audioGraph();
  if (!g) return;
  const total = song.form.length * 64;
  const len = stepLength(song);
  while (nextNote < g.ctx.currentTime + 0.15) {
    if (step >= total) {
      // the song is over: wait for its tail, then the next track
      clearInterval(timer);
      const wait = (nextNote - g.ctx.currentTime) * 1000 + 600;
      const playing = getState().music.track;
      ending = window.setTimeout(() => {
        if (getState().music.on && getState().music.track === playing) next();
      }, wait);
      return;
    }
    const section = Math.floor(step / 64);
    const bar = Math.floor(step / 16) % 4;
    const s = step % 16;
    if (step % 64 === 0) sectionStart(song, section, nextNote);
    const letter = song.form[section]!;
    const following = song.form[section + 1];
    const chords = letter === 'B' ? song.B : song.A;
    const chord = chords[bar]!;
    const nextChord = chords[(bar + 1) % 4]!;
    // swing pushes every off-beat 16th late; a little jitter keeps it human
    const at = nextNote + (s % 2 ? song.swing * len : 0) + (Math.random() - 0.5) * 0.008;
    const outro = letter === 'O' ? 1 - (bar * 16 + s) / 64 : 1;

    keys(song, chord, s, bar, at, len, outro, letter);
    if (letter !== 'I' && letter !== 'O') bassLine(song, chord, nextChord, s, at, len);
    else if (letter === 'O' && bar < 2 && s === 0) bass(chord[0]! - 12, at, len * 14, 0.7 * outro);
    drums(song, letter, following, bar, s, at);
    melody(song, letter, chord, bar, s, at, len);

    step++;
    nextNote += len;
  }
}

function keys(
  song: Song,
  chord: number[],
  s: number,
  bar: number,
  at: number,
  len: number,
  fade: number,
  letter: string,
) {
  const v = fade * (letter === 'D' ? 1.1 : 1);
  if (song.keys === 'pad') {
    if (s === 0) chord.forEach((n) => pad(n, at, len * 16, v));
  } else if (song.keys === 'organ') {
    if (s === 0) chord.forEach((n) => organ(n, at, len * 7, v));
    // the second half of the bar comes back in on the "and"
    if (s === 9 && letter !== 'I') chord.forEach((n) => organ(n, at, len * 6, v * 0.8));
  } else {
    // rhodes: a strummed chord, then an occasional comp hit
    if (s === 0) chord.forEach((n, i) => epiano(n, at + i * 0.012, len * 14, v));
    if (s === 10 && letter !== 'I' && fx() < 0.55)
      chord.slice(1).forEach((n, i) => epiano(n, at + i * 0.01, len * 5, v * 0.6));
  }
  if (song.melody === 'arp' && letter !== 'I') {
    // a running arpeggio: 8ths in the verse, 16ths in the B section, thinning in the outro
    const every = letter === 'B' || letter === 'D' ? 1 : 2;
    if (s % every === 0 && (letter !== 'O' || fx() < fade)) {
      const tones = upper(chord, 64);
      const order = [0, 1, 2, 3, 2, 1, 3, 4];
      const n = tones[order[(s / every + bar) % order.length]! % tones.length]!;
      pluck(n, at, len * 2, fade * (s % 4 === 0 ? 1 : 0.7));
    }
  }
}

/** Chord tones from `floor` upward, across two octaves, for melodies and arpeggios. */
function upper(chord: number[], floor: number): number[] {
  const tones: number[] = [];
  for (let octave = 0; tones.length < 8 && octave < 4; octave++)
    for (const n of chord) {
      const m = n + 12 * octave;
      if (m >= floor && !tones.includes(m)) tones.push(m);
    }
  return tones.sort((a, b) => a - b);
}

function bassLine(
  song: Song,
  chord: number[],
  nextChord: number[],
  s: number,
  at: number,
  len: number,
) {
  const root = chord[0]! - 12;
  if (song.melody === 'walk') {
    // a walking line: root, two chord tones, then a step into the next chord
    if (s % 4 !== 0) return;
    const beat = s / 4;
    const target = nextChord[0]! - 12;
    const notes = [root, chord[1]! - 12, chord[2]! - 12, target + (target > root ? -1 : 1)];
    bass(notes[beat]!, at, len * 3.5, 0.85);
  } else if (song.drums === 'half') {
    if (s === 0) bass(root, at, len * 10, 1);
    if (s === 11) bass(root + 7, at, len * 4, 0.6);
  } else {
    if (s === 0) bass(root, at, len * 6, 1);
    if (s === 7 && fx() < 0.6) bass(root, at, len * 2, 0.55);
    if (s === 10) bass(fx() < 0.5 ? root + 7 : root, at, len * 4, 0.75);
  }
}

function drums(
  song: Song,
  letter: string,
  following: string | undefined,
  bar: number,
  s: number,
  at: number,
) {
  if (letter === 'O' || letter === 'D') {
    // the breakdown keeps only a soft hat, so the groove doesn't disappear
    if (letter === 'D' && s % 4 === 2) hat(at, 0.012);
    return;
  }
  if (letter === 'I') {
    // the intro's last bar teases the hats in
    if (bar === 3 && s % 2 === 0) hat(at, 0.006 + s * 0.0012);
    return;
  }
  const lastBar = bar === 3;
  // drop out right before the breakdown, a fill before any other change of section
  if (lastBar && following === 'D' && s >= 12) return;
  if (lastBar && s >= 12 && following !== undefined && following !== letter) {
    snare(at, 0.1 + (s - 12) * 0.05, song.drums === 'brush');
    return;
  }
  if (song.drums === 'boom') {
    if (s === 0 || s === 10 || (s === 7 && fx() < 0.4)) kick(at, s === 0 ? 0.55 : 0.4);
    if (s === 4 || s === 12) snare(at, 0.32, false);
    if (s % 2 === 0) hat(at, s % 4 === 0 ? 0.04 : 0.026);
    else if (fx() < 0.18) hat(at, 0.012);
    if ((s === 3 || s === 13) && fx() < 0.25) snare(at, 0.05, false);
  } else if (song.drums === 'brush') {
    if (s === 0 || (s === 9 && fx() < 0.7)) kick(at, 0.32);
    if (s === 4 || s === 12) snare(at, 0.22, true);
    if (s % 4 === 2) hat(at, 0.018);
  } else {
    // half time: one backbeat per bar, an open hat at the end
    if (s === 0 || (s === 11 && fx() < 0.6) || (s === 6 && fx() < 0.2)) kick(at, 0.5);
    if (s === 8) snare(at, 0.3, false);
    if (s % 2 === 0 && s !== 14) hat(at, 0.022);
    if (s === 14) hat(at, 0.03, true);
  }
}

function melody(
  song: Song,
  letter: string,
  chord: number[],
  bar: number,
  s: number,
  at: number,
  len: number,
) {
  if (letter === 'I' || letter === 'O') return;
  // the arpeggio song only sings over the B section and the breakdown
  if (song.melody === 'arp' && letter === 'A') return;
  const tones = upper(chord, song.melody === 'walk' ? 67 : 69);
  for (const n of phrase[bar] ?? [])
    if (n.at === s) lead(tones[Math.min(n.tone, tones.length - 1)]!, at, n.len * len, song);
}

/* ---------- the mix ---------- */

let bus: { input: GainNode; filter: BiquadFilterNode } | null = null;
let bed: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
let crackle: AudioBuffer | null = null;

/** Everything musical goes through one warm lowpass, the "lo-fi" in lo-fi. */
function ensureBus() {
  const g = audioGraph();
  if (!g || bus) return;
  const input = g.ctx.createGain();
  const filter = g.ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.6;
  input.connect(filter).connect(g.master);
  bus = { input, filter };
}

/** The texture under the song: rain, vinyl crackle or tape hiss. */
function startBed(song: Song) {
  const g = audioGraph();
  if (!g) return;
  stopBed();
  const { ctx } = g;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.loop = true;
  if (song.texture === 'vinyl') {
    if (!crackle) {
      crackle = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const d = crackle.getChannelData(0);
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * 0.04 + (Math.random() < 0.0006 ? Math.random() - 0.5 : 0);
    }
    src.buffer = crackle;
    filter.type = 'highpass';
    filter.frequency.value = 900;
  } else {
    src.buffer = g.noise;
    filter.type = song.texture === 'rain' ? 'bandpass' : 'lowpass';
    filter.frequency.value = song.texture === 'rain' ? 1600 : 4200;
    filter.Q.value = 0.4;
  }
  const target = { vinyl: 0.45, rain: 0.05, tape: 0.012 }[song.texture];
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.5);
  src.connect(filter).connect(gain).connect(g.master);
  src.start();
  bed = { src, gain };
}

function stopBed() {
  const g = audioGraph();
  if (!g || !bed) return;
  const { src, gain } = bed;
  gain.gain.setTargetAtTime(0, g.ctx.currentTime, 0.1);
  src.stop(g.ctx.currentTime + 0.5);
  bed = null;
}

/* ---------- instruments ---------- */

/** A voice: an oscillator through its own envelope into the bus. */
function voice(
  type: OscillatorType,
  midi: number,
  at: number,
  peak: number,
  attack: number,
  length: number,
  detune = 0,
) {
  const { ctx } = audioGraph()!;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = hz(midi);
  // tape wobble: every note is a few cents off
  osc.detune.value = detune + (Math.random() - 0.5) * 9;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0008, at + length);
  osc.connect(gain).connect(bus!.input);
  osc.start(at);
  osc.stop(at + length + 0.05);
  return osc;
}

function epiano(midi: number, at: number, length: number, v: number) {
  const vel = v * (0.85 + Math.random() * 0.3);
  voice('sine', midi, at, 0.05 * vel, 0.006, length);
  voice('sine', midi + 12, at, 0.012 * vel, 0.004, length * 0.35);
  voice('triangle', midi + 24, at, 0.006 * vel, 0.002, 0.12);
}

function organ(midi: number, at: number, length: number, v: number) {
  voice('triangle', midi, at, 0.032 * v, 0.03, length);
  voice('sine', midi + 12, at, 0.012 * v, 0.03, length * 0.8);
}

function pad(midi: number, at: number, length: number, v: number) {
  voice('sawtooth', midi, at, 0.012 * v, length * 0.35, length * 1.1, -7);
  voice('sawtooth', midi, at, 0.012 * v, length * 0.35, length * 1.1, 7);
  voice('sine', midi - 12, at, 0.02 * v, length * 0.3, length);
}

function pluck(midi: number, at: number, length: number, v: number) {
  voice('triangle', midi, at, 0.03 * v, 0.004, Math.max(0.25, length));
}

function lead(midi: number, at: number, length: number, song: Song) {
  const ring = Math.max(0.3, length * 1.4);
  if (song.keys === 'rhodes') {
    voice('sine', midi, at, 0.06, 0.008, ring);
    voice('sine', midi + 12, at, 0.01, 0.004, ring * 0.4);
  } else {
    voice(song.keys === 'pad' ? 'sine' : 'triangle', midi, at, 0.045, 0.02, ring);
  }
}

function bass(midi: number, at: number, length: number, v: number) {
  voice('sine', midi, at, 0.2 * v, 0.01, length);
  voice('triangle', midi, at, 0.04 * v, 0.01, length * 0.6);
}

function kick(at: number, v = 0.5) {
  const { ctx } = audioGraph()!;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(120, at);
  osc.frequency.exponentialRampToValueAtTime(44, at + 0.14);
  gain.gain.setValueAtTime(v, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.3);
  osc.connect(gain).connect(bus!.input);
  osc.start(at);
  osc.stop(at + 0.31);
}

/** A snare: a noise burst over a short tone. Brushed snares are softer and longer. */
function snare(at: number, v: number, brush: boolean) {
  const { ctx, noise } = audioGraph()!;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = noise;
  filter.type = 'bandpass';
  filter.frequency.value = brush ? 2600 : 1800;
  filter.Q.value = brush ? 0.4 : 0.8;
  const length = brush ? 0.32 : 0.16;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(v, at + (brush ? 0.03 : 0.002));
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  src.connect(filter).connect(gain).connect(bus!.input);
  src.start(at, Math.random() * 0.3);
  src.stop(at + length + 0.02);
  if (!brush) {
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.frequency.setValueAtTime(190, at);
    body.frequency.exponentialRampToValueAtTime(140, at + 0.08);
    bodyGain.gain.setValueAtTime(v * 0.5, at);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, at + 0.1);
    body.connect(bodyGain).connect(bus!.input);
    body.start(at);
    body.stop(at + 0.11);
  }
}

function hat(at: number, v: number, open = false) {
  const { ctx, noise } = audioGraph()!;
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  src.buffer = noise;
  const length = open ? 0.22 : 0.045;
  gain.gain.setValueAtTime(v, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  src.connect(filter).connect(gain).connect(bus!.input);
  src.start(at, Math.random() * 0.3);
  src.stop(at + length + 0.01);
}
