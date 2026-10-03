/**
 * Device colors. Each one is a complete theme: picking a color re-themes the whole page, the
 * device's materials and the screen. `screen` is the display the device ships with.
 * `secret` themes stay hidden until unlocked (clear every brick in Brick).
 */
export type ThemeTokens = Record<
  | 'page'
  | 'ink'
  | 'mute'
  | 'accent'
  | 'sel'
  | 'shell'
  | 'shell2'
  | 'wheel'
  | 'wheel2'
  | 'wink'
  | 'btn'
  | 'btn2'
  | 'edge'
  | 'floor'
  | 'wglow'
  | 'scrL'
  | 'inkL'
  | 'scrD'
  | 'inkD',
  string
>;

export interface Theme {
  id: string;
  name: string;
  screen: 'light' | 'dark';
  swatch: string;
  secret?: boolean;
  finish?: 'clear';
  tokens: ThemeTokens;
}

export const THEMES: Theme[] = [
  {
    id: 'silver',
    name: 'Silver',
    screen: 'light',
    swatch: '#cfd2d7',
    tokens: {
      page: 'oklch(0.955 0.004 250)',
      ink: 'oklch(0.21 0.01 250)',
      mute: 'oklch(0.47 0.012 250)',
      accent: 'oklch(0.56 0.18 255)',
      sel: 'oklch(0.56 0.18 255)',
      shell: 'oklch(0.9 0.006 250)',
      shell2: 'oklch(0.76 0.01 250)',
      wheel: 'oklch(0.26 0.005 260)',
      wheel2: 'oklch(0.19 0.005 260)',
      wink: 'oklch(0.86 0.005 260)',
      btn: 'oklch(0.88 0.005 250)',
      btn2: 'oklch(0.74 0.008 250)',
      edge: 'rgba(255,255,255,.85)',
      floor: 'rgba(20,24,32,.28)',
      wglow: 'rgba(255,255,255,.07)',
      scrL: 'oklch(0.985 0.002 250)',
      inkL: 'oklch(0.2 0.01 250)',
      scrD: 'oklch(0.16 0.005 250)',
      inkD: 'oklch(0.94 0.004 250)',
    },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    screen: 'dark',
    swatch: '#4a4d53',
    tokens: {
      page: 'oklch(0.18 0.006 260)',
      ink: 'oklch(0.95 0.003 260)',
      mute: 'oklch(0.72 0.01 260)',
      accent: 'oklch(0.76 0.12 235)',
      sel: 'oklch(0.55 0.16 250)',
      shell: 'oklch(0.44 0.006 260)',
      shell2: 'oklch(0.31 0.006 260)',
      wheel: 'oklch(0.2 0.004 260)',
      wheel2: 'oklch(0.14 0.004 260)',
      wink: 'oklch(0.82 0.005 260)',
      btn: 'oklch(0.42 0.006 260)',
      btn2: 'oklch(0.3 0.006 260)',
      edge: 'rgba(255,255,255,.28)',
      floor: 'rgba(0,0,0,.6)',
      wglow: 'rgba(255,255,255,.06)',
      scrL: 'oklch(0.985 0.002 260)',
      inkL: 'oklch(0.2 0.006 260)',
      scrD: 'oklch(0.15 0.004 260)',
      inkD: 'oklch(0.94 0.003 260)',
    },
  },
  {
    id: 'sky',
    name: 'Sky',
    screen: 'light',
    swatch: '#a9c8e4',
    tokens: {
      page: 'oklch(0.95 0.016 235)',
      ink: 'oklch(0.24 0.03 245)',
      mute: 'oklch(0.46 0.04 245)',
      accent: 'oklch(0.52 0.14 245)',
      sel: 'oklch(0.55 0.14 245)',
      shell: 'oklch(0.86 0.045 235)',
      shell2: 'oklch(0.74 0.065 238)',
      wheel: 'oklch(0.985 0.006 235)',
      wheel2: 'oklch(0.92 0.018 235)',
      wink: 'oklch(0.52 0.08 240)',
      btn: 'oklch(0.85 0.045 235)',
      btn2: 'oklch(0.74 0.065 238)',
      edge: 'rgba(255,255,255,.8)',
      floor: 'rgba(20,40,70,.25)',
      wglow: 'rgba(20,50,90,.05)',
      scrL: 'oklch(0.985 0.004 235)',
      inkL: 'oklch(0.22 0.02 240)',
      scrD: 'oklch(0.16 0.015 240)',
      inkD: 'oklch(0.94 0.01 235)',
    },
  },
  {
    id: 'rosegold',
    name: 'Rose Gold',
    screen: 'light',
    swatch: '#e3b9a8',
    tokens: {
      page: 'oklch(0.95 0.014 25)',
      ink: 'oklch(0.26 0.03 30)',
      mute: 'oklch(0.47 0.04 30)',
      accent: 'oklch(0.55 0.12 30)',
      sel: 'oklch(0.56 0.12 32)',
      shell: 'oklch(0.87 0.042 42)',
      shell2: 'oklch(0.74 0.062 36)',
      wheel: 'oklch(0.985 0.006 40)',
      wheel2: 'oklch(0.92 0.018 40)',
      wink: 'oklch(0.55 0.07 35)',
      btn: 'oklch(0.86 0.042 42)',
      btn2: 'oklch(0.74 0.062 36)',
      edge: 'rgba(255,255,255,.8)',
      floor: 'rgba(70,35,25,.25)',
      wglow: 'rgba(90,40,20,.05)',
      scrL: 'oklch(0.985 0.004 30)',
      inkL: 'oklch(0.22 0.02 30)',
      scrD: 'oklch(0.17 0.012 30)',
      inkD: 'oklch(0.94 0.01 30)',
    },
  },
  {
    id: 'clear',
    name: 'Clear',
    screen: 'dark',
    secret: true,
    finish: 'clear',
    swatch: 'conic-gradient(#9fe3c9,#c9a24a,#9fe3c9)',
    tokens: {
      page: 'oklch(0.2 0.02 190)',
      ink: 'oklch(0.95 0.01 190)',
      mute: 'oklch(0.76 0.03 190)',
      accent: 'oklch(0.8 0.12 175)',
      sel: 'oklch(0.52 0.11 185)',
      shell: 'rgba(120,200,190,.16)',
      shell2: 'rgba(14,26,28,.42)',
      wheel: 'rgba(30,44,46,.62)',
      wheel2: 'rgba(8,14,15,.8)',
      wink: 'oklch(0.85 0.02 190)',
      btn: 'rgba(255,255,255,.3)',
      btn2: 'rgba(255,255,255,.12)',
      edge: 'rgba(255,255,255,.45)',
      floor: 'rgba(0,0,0,.55)',
      wglow: 'rgba(255,255,255,.06)',
      scrL: 'oklch(0.985 0.004 190)',
      inkL: 'oklch(0.22 0.02 190)',
      scrD: 'oklch(0.15 0.012 190)',
      inkD: 'oklch(0.94 0.01 190)',
    },
  },
];

export const themeById = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0]!;

/** Writes a theme onto <body>: its tokens, its finish and its screen. */
export function applyThemeTokens(theme: Theme, body: HTMLElement = document.body) {
  body.dataset.finish = theme.finish ?? 'modern';
  for (const [key, value] of Object.entries(theme.tokens))
    body.style.setProperty(`--${key}`, value);
}
