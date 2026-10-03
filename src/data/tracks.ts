/**
 * The Music playlist.
 *
 * To add your own music, put the audio file in public/music/ and add an entry with `src`:
 *   { name: 'Track title', artist: 'Artist', src: '/music/track.mp3', art: { gradient, label } }
 * Only use music you have the rights to publish. Entries with a `song` instead are lo-fi
 * tracks generated in the browser (see src/device/engine/music.ts).
 */
export type TrackArt = { photo: string } | { gradient: string; label: string };

/** Which instrument plays the chords. */
export type Keys = 'rhodes' | 'pad' | 'organ';
/** The drum kit and groove. */
export type Drums = 'boom' | 'brush' | 'half';
/** The background bed under everything. */
export type Texture = 'rain' | 'vinyl' | 'tape';

/**
 * A generated song. The form is a string of sections, each 4 bars long:
 * I intro (keys and texture), A verse, B the second progression, D breakdown (no drums,
 * melody up front), O outro (keys fading out). Melodies are written fresh for each section
 * from a seed, so repeats are related but never identical.
 */
export interface Song {
  bpm: number;
  /** 0 = straight 16ths, 0.33 = heavy swing */
  swing: number;
  form: string;
  /** progressions as MIDI chords, one chord per bar */
  A: number[][];
  B: number[][];
  keys: Keys;
  drums: Drums;
  texture: Texture;
  /** melody style: sparse phrases, a running arpeggio, or a walking bass with sparse phrases */
  melody: 'sparse' | 'arp' | 'walk';
  /** the lo-fi lowpass on the whole mix, in Hz */
  cut: number;
  seed: number;
}

export interface Track {
  name: string;
  artist?: string;
  src?: string;
  art: TrackArt;
  song?: Song;
}

export const TRACKS: Track[] = [
  {
    // melancholic: minor ninths, brushed drums, rain on the window
    name: 'Rain on the Window',
    artist: 'Kyle Anderson',
    art: { gradient: 'linear-gradient(160deg,#5f7d95,#1c2834)', label: 'Rain on<br>the Window' },
    song: {
      bpm: 72,
      swing: 0.18,
      form: 'IAABDBAO',
      A: [
        [50, 53, 57, 60, 64], // Dm9
        [55, 59, 62, 65, 69], // G9
        [48, 52, 55, 59, 62], // Cmaj9
        [57, 60, 64, 67], // Am7
      ],
      B: [
        [46, 50, 53, 57, 60], // Bbmaj9
        [45, 49, 52, 55, 59], // A7(9)
        [50, 53, 57, 60], // Dm7
        [52, 55, 58, 62], // Em7b5
      ],
      keys: 'rhodes',
      drums: 'brush',
      texture: 'rain',
      melody: 'sparse',
      cut: 2600,
      seed: 7,
    },
  },
  {
    // warm and hopeful: jazzy major sevenths, swung boom bap, a walking bass, vinyl crackle
    name: 'Sunday Coffee',
    art: { gradient: 'linear-gradient(160deg,#e0a35c,#6b3a1f)', label: 'Sunday<br>Coffee' },
    artist: 'Josh Green',
    song: {
      bpm: 86,
      swing: 0.28,
      form: 'IAABABDAO',
      A: [
        [53, 57, 60, 64], // Fmaj7
        [52, 55, 59, 62], // Em7
        [50, 53, 57, 60], // Dm7
        [55, 59, 62, 65], // G7
      ],
      B: [
        [58, 62, 65, 69], // Bbmaj7
        [57, 60, 64, 67], // Am7
        [55, 58, 62, 65], // Gm7
        [48, 52, 55, 58, 62], // C9
      ],
      keys: 'organ',
      drums: 'boom',
      texture: 'vinyl',
      melody: 'walk',
      cut: 3400,
      seed: 21,
    },
  },
  {
    // dreamy and nostalgic: lydian pads, a running arpeggio, half-time drums, tape hiss
    name: 'Night Drive',
    artist: 'Al Horford',
    art: { gradient: 'linear-gradient(160deg,#7b5ce0,#141031)', label: 'Night<br>Drive' },
    song: {
      bpm: 78,
      swing: 0.08,
      form: 'IAABBDBAO',
      A: [
        [48, 52, 55, 59, 66], // Cmaj7#11
        [45, 52, 55, 59], // Am(add9)
        [53, 57, 60, 64], // Fmaj7
        [55, 59, 62, 69], // G6/9
      ],
      B: [
        [52, 55, 59, 62], // Em7
        [53, 57, 60, 64, 67], // Fmaj9
        [50, 53, 57, 60, 64], // Dm9
        [55, 59, 62, 65], // G7
      ],
      keys: 'pad',
      drums: 'half',
      texture: 'tape',
      melody: 'arp',
      cut: 2200,
      seed: 3,
    },
  },
];
