/**
 * The Music playlist. To add a track, put the audio file in public/music/ and add an entry.
 * Only use music you have the rights to publish.
 */
export type TrackArt = { photo: string } | { gradient: string; label: string };

export interface Track {
  name: string;
  artist?: string;
  src: string;
  art: TrackArt;
}

export const TRACKS: Track[] = [
  // recorded tracks (Pixabay Content License: free to use, no attribution required)
  {
    name: 'Paper Lanterns',
    artist: 'Leberch',
    src: '/music/lofi-hip-hop.mp3',
    art: { gradient: 'linear-gradient(160deg,#f2a25c,#a3262e)', label: 'Paper<br>Lanterns' },
  },
  {
    name: 'Once in Paris',
    artist: 'pumpupthemind',
    src: '/music/once-in-paris.mp3',
    art: { gradient: 'linear-gradient(160deg,#7fcf9f,#1f4a7a)', label: 'Once in<br>Paris' },
  },
  {
    name: 'Glass House',
    artist: 'Monume',
    src: '/music/soft-background.mp3',
    art: { gradient: 'linear-gradient(160deg,#c4a8ec,#3b2466)', label: 'Glass<br>House' },
  },
];
