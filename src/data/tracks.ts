/**
 * The Music playlist.
 *
 * To add your own music, put the audio file in public/music/ and add an entry with `src`:
 *   { name: 'Track title', artist: 'Artist', src: '/music/track.mp3', art: { photo: 'nyc' } }
 * Only use music you have the rights to publish. Entries without `src` are generated in the
 * browser as placeholders, from the bpm, waveform, filter cutoff and chord progression below.
 */
export type TrackArt = { photo: string } | { gradient: string; label: string };

export interface Track {
  name: string;
  artist?: string;
  src?: string;
  art: TrackArt;
  bpm: number;
  wave: OscillatorType;
  cut: number;
  chords: number[][];
}

export const TRACKS: Track[] = [
  {
    name: 'Shipping Season',
    art: { gradient: 'linear-gradient(160deg,#3fb6a8,#0f3b4a)', label: 'Shipping<br>Season' },
    bpm: 80,
    wave: 'triangle',
    cut: 1100,
    chords: [
      [65, 69, 72, 76],
      [64, 67, 71, 74],
      [62, 65, 69, 72],
      [60, 64, 67, 71],
    ],
  },
  {
    name: 'Late Night Commit',
    art: { photo: 'nyc' },
    bpm: 70,
    wave: 'sine',
    cut: 900,
    chords: [
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [60, 64, 67, 71],
      [55, 59, 62, 64],
    ],
  },
  {
    name: 'Campus Loop',
    art: { photo: 'mac' },
    bpm: 96,
    wave: 'sawtooth',
    cut: 700,
    chords: [
      [60, 64, 67, 72],
      [55, 59, 62, 67],
      [57, 60, 64, 69],
      [53, 57, 60, 65],
    ],
  },
  {
    name: 'Figma at 2am',
    art: { gradient: 'linear-gradient(160deg,#6a55e0,#1b1448)', label: 'Figma<br>at 2am' },
    bpm: 62,
    wave: 'sine',
    cut: 1400,
    chords: [
      [62, 66, 69, 73],
      [59, 62, 66, 69],
      [55, 59, 62, 66],
      [57, 62, 64, 67],
    ],
  },
  {
    name: 'Golden Hour',
    art: { gradient: 'linear-gradient(160deg,#ffb23f,#d8452a)', label: 'Golden<br>Hour' },
    bpm: 88,
    wave: 'triangle',
    cut: 1250,
    chords: [
      [63, 67, 70, 74],
      [60, 63, 67, 70],
      [56, 60, 63, 67],
      [58, 62, 65, 68],
    ],
  },
];
