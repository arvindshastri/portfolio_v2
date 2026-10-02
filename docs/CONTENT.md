# Content Guide

What lives on the device, how to write it, and how to add more. Strategy is in [PRODUCT.md](../PRODUCT.md), visuals in [DESIGN.md](../DESIGN.md), behavior in [INTERACTIONS.md](INTERACTIONS.md).

## 1. Facts about Arvind (source of truth)

- **Name:** Arvind Shastri. Product designer and software engineer.
- **Education:** B.Eng. Software Engineering (Co-op), McMaster University, Hamilton, Ontario (graduated 2025).
- **Trac** (2025 to now): Co-founder, Software Engineer. Real-time shuttle tracking for McMaster; 3,000+ commuters reached, 2,500+ weekly active users, B2B partnership with Attridge Transportation on 5 routes, built in Flutter and Firebase. Featured as a McMaster Engineering success story.
- **Ericsson** (2023 to 2024): Software Developer Co-op. React, Redux and TypeScript features for a hardware network design tool; led a MATLAB-to-React migration study with high-fidelity Figma prototypes.
- **CGI** (2022): Software Developer Co-op. Refactored a Java scheduling backend and cut redundant API calls; 40% faster scheduling.
- **Arbol** (2021): Front-End Developer Intern. 10+ reusable React and Bootstrap components for a funding platform MVP, with Figma prototyping.
- **Skills:** Dart, TypeScript, Python, JavaScript, Java, MATLAB, SQL; Flutter, Firebase, React, Redux; Figma, Android Studio, Git, Jira, CI/CD; user research, wireframing, prototyping, usability testing.

The previous portfolio (`../Portfolio/portfolio`) has the original case study copy and images for Trac Commuter, Trac Driver, Orderly and StudyFinder.

## 2. Screen map and content

| Screen | Content | Opens as |
|---|---|---|
| Lock | Static photo (`nyc.jpg`), time, date | Press to unlock |
| Menu | Work, About, Experience, Music, Photos, Extras, Settings, Contact, each with a preview | List |
| Work | Trac Commuter, Trac Driver, Orderly, StudyFinder | Zoomed article (hold to peek) |
| About | Intro, design skills, engineering skills, portrait | Zoomed article |
| Experience | Trac, Ericsson, CGI, Arbol | Zoomed article per role |
| Music | Playlist of tracks | Now Playing |
| Photos | Cover flow of personal photos with captions | Peek |
| Extras | Brick (more games later) | Game screen |
| Settings | Color, Screen, Clicker, Show controls | In place |
| Contact | Copy email, LinkedIn, GitHub, Résumé | Actions |

## 3. Case study template

Every project article uses the same building blocks, in roughly this order. Not every block is required; Trac Commuter uses all of them and is the reference.

| Block | Markup | Purpose |
|---|---|---|
| Header | `<header class="hero">` with `.kick`, `h1`, `.lead`, `dl.meta` | Kicker ("Case study · 2025"), title, a 1–2 sentence lead, then Role / Platform / Tools / Partner |
| Cover | `<figure class="bleed">` | Edge-to-edge cover image |
| Stats | `<div class="stats">` with 3 × `b` + `span` | Three real numbers. Never invent numbers |
| Section | `h2` + `p` | The story: problem, research, design, testing, build, reflection |
| Pull quote | `<blockquote class="pull">…<cite>` | One striking finding with its source |
| Split | `<div class="split">` with text left, `ul.checks` right | A finding plus a percentage checklist |
| Gallery | `<div class="gallery">` of `figure` + `figcaption` | Design iterations, stacked full width |
| Cards | `<div class="duo">` with `.card.good` and `.card` | "What worked" vs "What we changed" |
| Panel | `<figure class="panel">` | Final screens on a tinted panel |
| End | `<p class="end">press MENU to go back</p>` | Closing line |

Shorter pages (Trac Driver, Orderly, StudyFinder, About, roles) use the `short()` helper: header, optional cover, body, end line.

### Recommended story arc
1. **The problem**, with real data.
2. **What people asked for** (research).
3. **Design rounds**, with what changed and why.
4. **Testing:** what worked and what changed.
5. **Build and launch**, with outcomes.
6. **What I'd do next:** an honest reflection.

## 4. Voice

- First person, warm and direct. "I built", "we found", not "the team leveraged".
- Concrete over clever: real numbers, real decisions, real trade-offs.
- Short paragraphs. Leads are one or two sentences.
- No em dashes. Use commas, colons, parentheses or two sentences.
- No filler verbs (elevate, seamless, unleash, revolutionize).
- Instructions on the page are lowercase mono fragments: "spin to scroll · press the center to open · hold to peek".

## 5. How to add things

### A project
Add an entry to `PROJECTS` with `label`, `prev` (preview image via `img("file.jpg")`) and `html` (the article). Put images in `prototype/assets/`. Every project is automatically zoomable and peekable.

### A photo
Add `["file.jpg","Caption"]` to `PHOTOS`, the full image to `prototype/assets/`, and a 400px-max thumbnail with the same name to `prototype/assets/thumbs/` (cover flow uses the thumbnail, the peek uses the full image).

### A music track
1. Put the audio file in `prototype/assets/music/`.
2. Add to `TRACKS`: `{name:"Title", artist:"Artist", src:"assets/music/track.mp3", art:img("cover.jpg")}`.
3. Use only music you have the right to publish (your own, royalty-free, or licensed). Entries without `src` are generated placeholders; remove them once real tracks exist.

### A device color
Previews: projects need `cover`, `meta` ("2025 · iOS and Android") and a one-line `pitch`; the preview is built from those. Other previews are built in `ROOT` with `pvTx(kicker,title,text)`.

Arvind will specify what each menu preview shows; the current previews are placeholders built from existing content.

Add an entry to `COLORS` with an `id`, `name`, `screen` (`light` or `dark`, the display it ships with), a swatch color `c`, optional `secret:true`, and the full token set `v` (page, ink, mute, accent, sel, shell, shell2, wheel, wheel2, wink, btn, btn2, edge, floor, wglow, scrL, inkL, scrD, inkD). Every color is the same anodized modern device; keep the set at five or fewer. Check text contrast on the new page color and white text on `sel`.

## 6. Assets

`prototype/assets/` currently holds:
- Project images: Trac Commuter (cover, design v1 to v3, final results 1 and 2), Trac Driver (cover, final result), Orderly (cover), StudyFinder (cover).
- Personal: `arvind_portrait.jpg` (graduation photo), `nyc.jpg`, `sunset.jpg`, `spiderverse.jpg` (a drawing), `doctor_strange.jpg`, `logic.jpg`, `mac_wrld.jpg`, `cfest_banners.jpg`. Captions for the less obvious ones are guesses; confirm them.
- `resume.pdf`, copied from the previous portfolio. Confirm it's the latest version.
- `music/`, empty, ready for real tracks.

## 7. Open placeholders (must be replaced before launch)

- [ ] Email: `hello@arvindshastri.com` is a placeholder.
- [ ] LinkedIn and GitHub URLs point to the generic homepages.
- [ ] Trac Commuter "What I'd do next" reflection.
- [ ] Full case studies for Trac Driver, Orderly and StudyFinder (currently short).
- [ ] About page: personal intro beyond the one-liner.
- [ ] Experience pages: more detail per role.
- [ ] Photo captions (confirm "Logic", "McMaster", "Campus", "Doctor Strange").
- [ ] Real music tracks to replace the generated placeholders.
- [ ] Résumé PDF: confirm it's current.
