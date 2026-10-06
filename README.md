# Arvind Shastri · Portfolio

My portfolio, built as one object: an original click-wheel music device that holds everything. Spin the wheel to browse, press the center to open a project (the screen grows into a full-page article), and pick a device color that re-themes the whole page. There's music, photos and a small Brick game inside.

Live at [arvindshastri.com](https://arvindshastri.com).

## Stack

- **[Astro](https://astro.build)** builds static pages, one per case study (`/projects/<name>/`), with optimized images and link previews.
- **React + TypeScript** for the device, which runs as a single client-side component.
- **[Zustand](https://github.com/pmndrs/zustand)** holds the device's state, shared by the React components and the plain TypeScript modules that drive input, motion and audio.
- **MDX** for case studies, with a small set of article components (stats, pull quotes, galleries, cards).
- **Plain CSS** with OKLCH theme tokens. No UI framework, no animation library: motion is CSS transitions and the Web Animations API, sound is the Web Audio API.
- **[Lucide](https://lucide.dev)** icons, **Geist** and **Geist Mono** fonts (self-hosted via Fontsource).

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run check     # type check
npm run format    # prettier
```

## Where things are

```
src/
  content/
    projects/          one MDX file per case study (each gets its own URL)
    experience/        one Markdown file per role
    pages/about.mdx    the About page
  data/                device colors (themes.ts), photos, the music playlist, site links
  assets/              images used by the content
  components/          Astro: case-study components, the article templates, the text version
  device/              the device (React + TypeScript)
    Pocket.tsx           the root component
    store.ts             device state
    actions.ts           what every control does
    menu.ts              the menu tree
    engine/              wheel input, reading page, reading scroller, screen slides, audio, music, Brick
    components/          screens, previews, the guide, the page around the device
  pages/               index and /projects/[slug]
  styles/              tokens, page, device, screens, article
public/                résumé, favicon, music files
prototype/             the single-file prototype the site was designed in
docs/                  design and interaction specs, decisions, roadmap
```

## Editing content

- **A case study:** edit or add `src/content/projects/<name>.mdx`. The frontmatter sets the title, intro, facts row, cover and the menu preview text; the body is Markdown plus the components in `src/components/article/`. Images go in `src/assets/projects/<name>/`.
- **A role:** `src/content/experience/<company>.md`.
- **Photos, music, colors, links:** `src/data/`.

More detail in [docs/CONTENT.md](docs/CONTENT.md).

## Documentation

| File                                         | What's in it                                                    |
| -------------------------------------------- | --------------------------------------------------------------- |
| [PRODUCT.md](PRODUCT.md)                     | Who the site is for, purpose, personality, principles           |
| [DESIGN.md](DESIGN.md)                       | The visual system: themes, typography, elevation, components    |
| [docs/INTERACTIONS.md](docs/INTERACTIONS.md) | Controls, navigation, states, transitions, timings, audio       |
| [docs/CONTENT.md](docs/CONTENT.md)           | Facts, voice, and how to add projects, photos, music and colors |
| [docs/DECISIONS.md](docs/DECISIONS.md)       | Every direction explored, what was kept, what was rejected      |
| [docs/ROADMAP.md](docs/ROADMAP.md)           | What's next                                                     |
