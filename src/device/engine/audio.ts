import { getState } from '../store';

/**
 * One AudioContext for the whole device, created on the first touch (browsers block audio
 * before a user gesture). Everything musical routes through `master`, which feeds an analyser
 * for the Now Playing visualizer.
 */
interface Graph {
  ctx: AudioContext;
  noise: AudioBuffer;
  master: GainNode;
  analyser: AnalyserNode;
}

let graph: Graph | null = null;

export function ensureAudio(): Graph | null {
  if (graph) return graph;
  try {
    const ctx = new AudioContext();
    const noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const master = ctx.createGain();
    master.gain.value = 0;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    master.connect(analyser).connect(ctx.destination);
    graph = { ctx, noise, master, analyser };
  } catch {
    graph = null;
  }
  return graph;
}

export const audioGraph = () => graph;

/** The clicker: a 4ms burst of high-passed noise. `v` scales it (1 = a step, 2 = a select). */
export function click(v = 1) {
  if (!graph || !getState().clicker) return;
  const { ctx, noise } = graph;
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2400;
  gain.gain.setValueAtTime(0.22 * v, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
  src.buffer = noise;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + 0.012);
  vibe(4);
}

/** A short vibration on phones that support it, only after the visitor has interacted. */
export function vibe(ms: number) {
  if (!navigator.vibrate || !navigator.userActivation?.hasBeenActive) return;
  try {
    navigator.vibrate(ms);
  } catch {
    /* unsupported */
  }
}
