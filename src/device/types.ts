/** Content handed to the device by the Astro page (image URLs are already optimized). */
export interface ProjectInfo {
  slug: string;
  title: string;
  tagline: string;
  pitch: string;
  cover: string;
}
export interface JobInfo {
  slug: string;
  company: string;
  years: string;
  role: string;
  summary: string;
}
export interface PhotoInfo {
  thumb: string;
  full: string;
  caption: string;
}
export interface DeviceContent {
  projects: ProjectInfo[];
  jobs: JobInfo[];
  photos: PhotoInfo[];
  /** Optimized album art, keyed by photo id (see src/data/tracks.ts). */
  trackArt: Record<string, string>;
}

/**
 * A long-form page the device can open (zoom into) or peek at. `key` matches a
 * <template data-article> rendered by the page; `slug` is set for projects, which have URLs.
 */
export interface DocRef {
  key: string;
  title: string;
  slug?: string;
}

export type IconName =
  | 'projects'
  | 'experience'
  | 'about'
  | 'photos'
  | 'music'
  | 'extras'
  | 'settings'
  | 'mail'
  | 'linkedin'
  | 'github'
  | 'resume';

export type PreviewSpec =
  | { kind: 'icon'; icon: IconName; title?: string; sub?: string }
  | { kind: 'project'; project: ProjectInfo }
  | { kind: 'job'; job: JobInfo }
  | { kind: 'album'; track: number }
  | { kind: 'brick'; sub: string; kicker: string };

/** One row of a list screen. */
export interface Item {
  label: string;
  preview?: PreviewSpec | (() => PreviewSpec);
  /** Rows that act in place (settings, links) show a value instead of a chevron. */
  leaf?: boolean;
  /**
   * An icon on the highlighted row of a leaf: `link` opens something in a new tab, `chevron`
   * does something in place (copy email). Rows that open a screen always get the chevron.
   */
  mark?: 'link' | 'chevron';
  value?: () => string;
  /** Shows a sound icon while true (the playing track). */
  now?: () => boolean;
  go?: () => ScreenNode;
  act?: () => void;
  doc?: DocRef;
}

export type ScreenNode =
  | { type: 'list'; title: string; items: Item[] }
  | { type: 'doc'; title: string; doc: DocRef }
  | { type: 'np'; title: string }
  | { type: 'cf'; title: string }
  | { type: 'brick'; title: string };

/** A screen on the navigation stack. */
export interface Frame {
  id: number;
  node: ScreenNode;
  sel: number;
  /** Already nudged at the end of the list (the nudge happens once). */
  edge: boolean;
  /** Covered by the screen above it. */
  hidden: boolean;
}
