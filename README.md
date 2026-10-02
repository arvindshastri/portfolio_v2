# Arvind Shastri · Portfolio V2 ("Pocket")

A one-page portfolio that lives inside an original click-wheel music device. Visitors spin the wheel, press the center to open projects (the camera zooms into the screen and the case study reflows into a full article), hold the center to peek, and pick a device color that re-themes the whole page. There's music, photos and a small Brick game inside.

## Status

Design exploration is done; the direction is chosen. The current reference build is a single-file prototype: [`prototype/index.html`](prototype/index.html). The next step is porting it to a production build (see [docs/ROADMAP.md](docs/ROADMAP.md)).

## Run the prototype

```bash
python -m http.server 5510 --directory prototype
```

Then open http://localhost:5510.

## Documentation

| File | What's in it |
|---|---|
| [PRODUCT.md](PRODUCT.md) | Who the site is for, purpose, personality, anti-references, principles |
| [DESIGN.md](DESIGN.md) | The visual system: themes, typography, elevation, components, do's and don'ts |
| [docs/INTERACTIONS.md](docs/INTERACTIONS.md) | Controls, navigation tree, states, transitions, timings, audio, accessibility |
| [docs/CONTENT.md](docs/CONTENT.md) | Facts, screen map, case study template, voice, how to add projects, photos, music and colors, open placeholders |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Every direction explored, the verdicts, settled decisions, and things never to re-pitch |
| [docs/ROADMAP.md](docs/ROADMAP.md) | What's left before launch and the recommended production stack |

## Folder layout

```
PRODUCT.md, DESIGN.md, README.md
docs/                design and project documentation
prototype/
  index.html         the current build (single file)
  assets/            images, resume.pdf, music/
```
