# Content Guide

What lives on the device, how to write it, and how to add more. Strategy is in [PRODUCT.md](../PRODUCT.md), visuals in [DESIGN.md](../DESIGN.md), behavior in [INTERACTIONS.md](INTERACTIONS.md).

## 1. Facts about Arvind (source of truth)

- **Name:** Arvind Shastri. Product designer and software engineer.
- **Education:** B.Eng. Software Engineering (Co-op), McMaster University, Hamilton, Ontario (graduated 2025).
- **Trac** (June 2025 to now): Co-founder, Software Engineer. Real-time shuttle tracking for McMaster; 4,000+ users reached, 2,500+ weekly active users, 6 buses, B2B partnership with Attridge Transportation on 5 routes, built in Flutter and Firebase. Featured as a McMaster Engineering success story.
- **Ericsson** (May 2023 to August 2024, Ottawa): Software Developer Co-op. React, Redux and TypeScript features for EIP, an enterprise network design platform (50+ issues across 4 releases); Python/OpenCV CAD processing 10% faster; Nightwatch.js E2E suite 15% faster; led a team of 3 scoping a MATLAB-to-React migration with 6 Figma prototypes, PoC 2 weeks early.
- **CGI** (May to August 2022, remote): Software Developer Co-op. Java/JSP scheduling app: automated event workflows (40% faster turnaround), multi-attribute filtering (60% faster search), HTML/CSS feedback components, parallelized REST calls (50% faster loads).
- **Arbol** (May to August 2021, remote): Front-End Developer Intern. 10+ reusable React and Bootstrap card components for a funding platform MVP, 2 Figma mockups from QA feedback, 3 WordPress templates.
- **Skills:** Dart, TypeScript, Python, JavaScript, Java, MATLAB, SQL; Flutter, Firebase, React, Redux; Figma, Android Studio, Git, Jira, CI/CD; user research, wireframing, prototyping, usability testing.

The previous portfolio (`../Portfolio/portfolio`) has the original case study copy and images for Trac Commuter, Trac Driver, Orderly and StudyFinder.

## 2. Screen map and content

| Screen     | Content                                                                                    | Opens as              |
| ---------- | ------------------------------------------------------------------------------------------ | --------------------- |
| Lock       | Static photo (`nyc.jpg`), time, date                                                       | Press to unlock       |
| Menu       | Projects, Experience, About, Photos, Music, Extras, Settings, Contact, each with a preview | List                  |
| Projects   | Trac Commuter, Trac Driver, Orderly, StudyFinder                                           | Reading page          |
| About      | Intro, design skills, engineering skills, portrait                                         | Reading page          |
| Experience | Trac, Ericsson, CGI, Arbol                                                                 | Reading page per role |
| Music      | Playlist of tracks                                                                         | Now Playing           |
| Photos     | Cover flow of personal photos with captions                                                | Enlarged on press     |
| Extras     | Brick, Stack                                                                               | Game screen           |
| Settings   | Color, Screen, Clicker, Show controls                                                      | In place              |
| Contact    | Copy email, LinkedIn, GitHub, Résumé                                                       | Actions               |

## 3. Case study template

Every project article uses the same building blocks, in roughly this order. Not every block is required; Trac Commuter uses all of them and is the reference.

| Block      | Markup                                                         | Purpose                                                                                          |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Header     | `<header class="hero">` with `.kick`, `h1`, `.lead`, `dl.meta` | Kicker ("Case study · 2025"), title, a 1–2 sentence lead, then Role / Platform / Tools / Partner |
| Cover      | `<figure class="bleed">`                                       | Cover image, at the text column's width                                                          |
| Stats      | `<div class="stats">` with 3 × `b` + `span`                    | Three real numbers. Never invent numbers                                                         |
| Section    | `h2` + `p`                                                     | The story: problem, research, design, testing, build, reflection                                 |
| Pull quote | `<blockquote class="pull">…<cite>`                             | One striking finding with its source                                                             |
| Split      | `<div class="split">` with text left, `ul.checks` right        | A finding plus a percentage checklist                                                            |
| Gallery    | `<div class="gallery">` of `figure` + `figcaption`             | Design iterations, stacked full width                                                            |
| Cards      | `<div class="duo">` with `.card.good` and `.card`              | "What worked" vs "What we changed"                                                               |
| Panel      | `<figure class="panel">`                                       | Final screens on a tinted panel                                                                  |

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
- Instructions on the page are lowercase mono fragments: "spin to scroll · press the center to open".

## 5. How to add things

### A project

Add `src/content/projects/<name>.mdx`. The file name becomes its URL (`/projects/<name>/`). Frontmatter:

- `title`, `order` (position in the Projects list), `kicker` ("Case study · 2025"), `lead` (the intro paragraph)
- `tagline` ("2025 · iOS and Android") and `pitch` (one line): the menu preview
- `cover` (relative path to an image) and `coverAlt`
- `facts`: optional list of `{ label, value }` for the row under the intro (Role, Platform, Tools...)

The body is Markdown. Headings (`##`) become sections; with 3 or more, the article gets a Contents list. These components are available without importing: `<Stats>`, `<Note>`, `<PullQuote>`, `<Split>`, `<Gallery>`, `<Figure>` (with `variant="bleed"` or `"panel"`), `<Duo>` + `<Card>`, `<Tags groups>` (labeled tag groups), `<Philosophy label title>` (an inverted statement block), `<PrototypeLink href label>` (a live Figma embed; paste the normal figma.com/proto share link). Images go in `src/assets/projects/<name>/` and are imported at the top of the file; Astro resizes and converts them at build time. Every project is automatically zoomable, peekable and linkable.

### A role

Add `src/content/experience/<company>.md` with `company`, `role`, `period`, `years` (short, for the preview), `order`, `summary` (the preview text, up to about 12 lines), and optional `tools` and `skills` lists (shown as tags at the bottom). The body is a Markdown bullet list: the résumé bullets, in order.

### A photo

Put the image in `src/assets/photos/`, import it in `src/data/photos.ts` and add `{ id, image, caption }`. Thumbnails for cover flow and the full-size enlarged photo are generated automatically.

### A music track

1. Put the audio file in `public/music/`.
2. Add to `TRACKS` in `src/data/tracks.ts`: `{ name: 'Title', artist: 'Artist', src: '/music/track.mp3', art: { photo: '<photo id>' }, ... }`.
3. Use only music you have the right to publish (your own, royalty-free, or licensed).

### A device color

Add a theme to `THEMES` in `src/data/themes.ts`: `id`, `name`, `screen` (`light` or `dark`, the display it ships with), a `swatch` color, optional `secret: true`, and the full token set. Every public color is the same anodized modern device; keep the set at five or fewer. Check text contrast on the new page color and white text on `sel`.

### Menu previews

Main-menu previews are Lucide icons, set in `src/device/menu.ts`. Project and role previews are built from their frontmatter. Arvind will specify what each menu preview should show; the current ones are placeholders built from existing content.

## 6. Assets

- `src/assets/projects/`: every image from the old portfolio's case studies, one folder per project.
- `src/assets/photos/`: `nyc.jpg`, `spiderverse.jpg` (a drawing), `doctor_strange.jpg`, `logic.jpg`, `mac_wrld.jpg`. Captions for the less obvious ones are guesses; confirm them.
- `public/resume.pdf`, copied from the previous portfolio. Confirm it's the latest version.
- `public/music/`: three Pixabay tracks (Pixabay Content License, no attribution required).

## 7. Open placeholders (must be replaced before launch)

- [x] Email, LinkedIn and GitHub: taken from the old portfolio (arvind.shastri@outlook.com, linkedin.com/in/arvind-shastri, github.com/arvindshastri). Confirm they're current.
- [ ] Case studies: drafted from the old portfolio's pages (lightly tightened, no em dashes). Review the wording.
- [ ] About and Experience: drafted from the old portfolio. Review.
- [ ] A reflection section for Trac Commuter ("What I'd do next"), if wanted.
- [ ] Photo captions (confirm "Logic", "McMaster", "Campus", "Doctor Strange").
- [ ] Artists are the real Pixabay creators; two titles are made up (Paper Lanterns by Leberch, Glasshouse by Monume), Once in Paris by Pumpupthemind is real; rename them in `src/data/tracks.ts` if you like.
- [ ] Résumé PDF: confirm it's current.

## Search and link previews

- The site description (`SITE.description` in `src/data/site.ts`) is what Google shows under the name and what link previews show under the title. Project pages use their own lead and cover.
- `public/og.png` (1200 × 630) is the home page's link-preview image: the site itself in Silver, with the name large on the left. It's a screenshot, so retake it if the device or the name block changes.
- Icons: `favicon.ico` (16, 32, 48px, which Google's search results use), `favicon.svg`, `icon-192.png`, `icon-512.png` and `apple-touch-icon.png` (180px on the Silver page tone, since iOS drops transparency), all from the device favicon.
- Every page carries a schema.org `Person` (name, role, McMaster, LinkedIn, GitHub) so search engines know whose site it is.
