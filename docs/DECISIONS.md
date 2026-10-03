# Decision Log

How the Pocket direction was chosen, what was tried and rejected, and what is settled. Read this before proposing new directions, so ideas already rejected aren't re-pitched. The exploration prototypes listed below were deleted once the direction was chosen (2026-10-02); this log is the record of them. The current build is [prototype/index.html](../prototype/index.html).

## 1. Starting point

Arvind's previous portfolio (`../Portfolio/portfolio`) is a multi-page React + shadcn site in a neo-brutalist style (hard shadows, thick borders, indigo accent, Space Grotesk). His verdict: "bland, generic, super AI-vibe-coded… too much and too little at the same time, nothing memorable… information scattered across several pages… doesn't showcase my taste."

Goals that came out of that:

- One page, easy to read and digest.
- A memorable signature interaction that persists across the site, plus subtle life everywhere.
- Equal appeal to software engineering and product/design hiring managers.
- Visitors should be able to **play and interact**.

## 2. Directions explored

| Round | Prototype                                     | Concept                                                                                                                                                                                     | Verdict                                                                                                                                                                            |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `a-xray.html`                                 | Swiss/editorial; press X to reveal a blueprint layer with live specs                                                                                                                        | **Liked:** smooth, elegant, the X-ray reveal and its animations, subtle colors. Wanted more character.                                                                             |
| 1     | `b-canvas.html`                               | Figma-style infinite canvas with a live "Arvind" cursor and comment pins                                                                                                                    | **Liked:** the live feel and cursor, design and engineering chops. **Disliked:** hard to navigate, no deep links or pages.                                                         |
| 1     | `c-transit.html`                              | Scroll-drawn shuttle route, split-flap type                                                                                                                                                 | **Disliked:** too literal about Trac (a Trac ad, not about him), laggy split-flap that "misspelled" his name, the yellow. Liked the project cards.                                 |
| 1     | `d-notebook.html`                             | Graph paper, margin notes, draw-anywhere pen                                                                                                                                                | **Liked:** drawing on the page. **Disliked:** basic fonts, highlights didn't land, too close to the old site.                                                                      |
| 2     | `e-restyle.html`                              | Visitor types a vibe, the site re-skins its tokens                                                                                                                                          | **Rejected firmly:** someone else already did a "generate in any style" portfolio. Do not re-pitch.                                                                                |
| 2     | `f-channels.html`                             | Original take on the Wii home screen: live tiles opening into pages                                                                                                                         | Not immersive enough, too far from how the Wii actually felt.                                                                                                                      |
| 2     | `g-room.html`                                 | three.js 3D room (Henry Heffernan-inspired)                                                                                                                                                 | Overdone; the 3D looked weaker than imagined. 2D pixel art floated as an alternative.                                                                                              |
| 3     | `h-dive.html`                                 | Infinite nested zoom, the last scene loops to the first                                                                                                                                     | Concept good, execution weak. Ranked 4th.                                                                                                                                          |
| 3     | `i-pack.html`                                 | Tear open a foil pack of holographic project cards; secret card                                                                                                                             | Great animations and satisfying; worth gamifying. Ranked 2nd.                                                                                                                      |
| 3     | `j-pocket.html`                               | An original click-wheel device holding the whole portfolio                                                                                                                                  | **"Instantly fell in love."** Ranked 1st. Problem: case studies unreadable on the small screen.                                                                                    |
| 3     | `k-walk.html`                                 | Pixel-art side-scroller walking past buildings                                                                                                                                              | Interesting but flat, and boring to walk through. Ranked 3rd.                                                                                                                      |
| 4     | `l-desk.html`                                 | A desk of usable objects (Pocket, pack, loupe, notebook, folders, lamp)                                                                                                                     | Too messy, doing too much.                                                                                                                                                         |
| 5     | `m-pocket-read.html`                          | Four reading modes: Zoom, Grow, Rotate, Peek                                                                                                                                                | **Kept:** Zoom and Peek. **Rejected:** Grow and Rotate, the READ button, and the mini wheel off to the side.                                                                       |
| 6     | `n-pocket2.html`                              | Bigger screen, open = zoom, finishes, page layouts, music, Brick                                                                                                                            | Liked Studio, Spec callouts, Classic and Modern, the size, Brick, music, the lock screen. Disliked Split view and the content-colored glow; unsure about the giant name and Clear. |
| 7     | `o-pocket3.html` (now `prototype/index.html`) | Device colors theme the page, entrance animation, playlist, photos, restyled case study                                                                                                     | Direction confirmed as solid; foundations "great".                                                                                                                                 |
| 14    | `prototype/index.html` (refinement)           | Fixed the back-navigation jerk, removed icon animations (kept pool + reflection), Lucide icons, reverted the wheel/dial flight, action markers only on highlight, instant light/dark switch | 2026-10-02.                                                                                                                                                                        |
| 13    | `prototype/index.html` (refinement)           | Mirrored screen slides, smooth wheel/dial crossfade, animated icon previews with reflection, Brick end cards                                                                                | 2026-10-02.                                                                                                                                                                        |
| 12    | `prototype/index.html` (refinement)           | Clear finish is the Brick reward again, icon-only menu previews, wheel-to-dial handoff, zoomed status bar fix at all sizes                                                                  | Arvind: "happy with the design and where we're at", 2026-10-02. Next: menu content.                                                                                                |
| 11    | `prototype/index.html` (refinement)           | Chrome enters with the screen power-on, icon previews on the main menu, eyebrows on job previews, photo thumbnails, single copy confirmation, stable menu text                              | Fourth refinement round, 2026-10-02.                                                                                                                                               |
| 10    | `prototype/index.html` (refinement)           | Menu reorder (Projects first), Sky replaces Plum, no status line or placard, no preview kickers or Ken Burns, smooth Brick paddle, real cover reflections                                   | Third refinement round, 2026-10-02.                                                                                                                                                |
| 9     | `prototype/index.html` (refinement)           | Designed previews, Plum and Rose Gold, cover flow animation, photo peek fit, unlock affordances, placard, name block                                                                        | Second refinement round, 12 points, 2026-10-02.                                                                                                                                    |
| 8     | `prototype/index.html` (refinement)           | 40/60 menu, modern-only colors with per-theme screens, full docked dial, physical details, Brick restyle                                                                                    | Refinements from Arvind's 16-point review on 2026-10-02. See §3.                                                                                                                   |

## 3. Settled decisions

### Concept

- **The Pocket is the site.** One original click-wheel device, centered on a page whose color comes from the device.
- Inspired by click-wheel players, never a literal iPod clone.
- No desk, room or scene around it. Studio layout only (the Split layout was dropped).

### Controls and reading

- **Center button unlocks.** No hold switch: it adds friction before the real content.
- **Press = open (zoom into the screen); hold = peek.** No READ button.
- **Screen redraw** on zoom in and out (blank, reflow, reveal) so text never visibly reflows and no small preview flashes.
- While zoomed, a **smaller full wheel docks at the bottom center**, fully visible with all four labels (round 8: the half-hidden dial looked awkward and was hard to spin). No mini wheel at the side, no top hint.
- **No ◀◀ / ▶▶ "next project"** while reading. While reading they jump between section headings; elsewhere they skip tracks and photos.
- **Scrolling while zoomed** works from anywhere on the page (mouse wheel/trackpad), not only over the article. The dial scroll is eased and keeps momentum.
- The zoomed article fills the screen glass exactly (fixed in round 8: it used to be laid out too small when the device was scaled down to fit the window).
- Case studies stay **long-form**.
- Photos and Contact do **not** zoom. Photos peek; Contact is a small on-device list.
- At the end of a list, the device nudges **once, subtly**. No repeated shaking.

### Status bar and notifications

- Status bar: play/pause icon left, **screen title** center, time right. No name, padlock or unread dot.
- **No recurring notifications.** The only messages are toasts: the email-copied confirmation and the one-off "Clear finish unlocked" (the status-bar pill was replaced by a toast on 2026-10-02). Device events never notify outside the device.
- **Clear finish, richer:** a tinted see-through shell showing the board (flex cable, chips, battery, sensor rings, an accent LED), with the board drifting against the tilt for depth.

### Look

- **Device color themes the whole page** (bring-back of a v1 feature he loved).
- **Modern finish only** (round 8). Classic and Clear finishes are gone. Four public colors, five max, in this order: Silver, Graphite, Sky, Rose Gold (always last). Moss (round 9) and Plum (round 10) were rejected; Blush became Rose Gold.
- **Each theme picks the screen:** light or dark. Graphite and Clear ship with the dark screen. Settings → Screen can still flip it.
- **Clear** (see-through shell, dark screen) is the secret fifth finish, unlocked by clearing Brick (round 12; Cobalt was a temporary stand-in).
- No giant background name, no content-colored glow.
- Name and "designer + engineer" top-left stays. Résumé and Contact links stay outside the device.
- **Menu split 47/53** (list/preview; round 9: 40/60 made too many titles scroll). The marquee runs once each way, not on a loop. The `›` chevron only shows on the highlighted row; the highlight slides between rows.
- **Wheel hover** is a faint sheen in the wheel's own material, not an accent-blue glow. The center hold ring uses the wheel ink, not blue.
- **Physical details (subtle):** recessed screen with a lit lower lip, backlight falloff at the screen edges, wheel recess, the wheel rocks toward the finger, a tight contact shadow.
- The device tilt holds still while you use the wheel (round 8: it moved while spinning).
- Spec-style callouts as a first-visit guide plus a `?` button. Callouts are positioned from the live device so they always point at the right control. On phones `?` shows a legend sheet.
- **No unlock text by default** (round 9): the center button nudges itself on the lock screen; text appears only after 12 seconds. A ring highlight teaches spinning.
- **Previews are designed**, never bare cropped photos (round 9).
- **Mouse wheel:** one notch = one item.
- **Photo peek** always shows the whole photo. **Cover flow** animates between photos.
- **Room:** a soft studio light falloff only. The placard was tried and removed (round 10); still no glows, no giant name.
- **Name block:** name = home button, plus the role line. The "now building" status line was tried and removed (round 10).
- **Menu order:** Projects (renamed from Work), Experience, About, Photos, Music, Extras, Settings, Contact.
- **Previews:** main menu = a big Lucide icon alone, no title or eyebrow, on a soft color pool with a reflection. No icon animation (round 14). Use library icons, don't hand-draw.
- **Wheel ↔ dial:** the simple fade-out / rise-in. The flying hand-off was reverted (round 14).
- **Light/dark screen switch is instant** across the whole screen (round 14: a partial transition read as a flicker). Second level (projects, jobs) keeps the mono eyebrow. Images never drift or zoom. Arvind will specify each preview's content.
- **Entrance:** name, links and `?` arrive together with the screen power-on; swatches keep their stagger.
- **Copy confirmation** appears once: on the device when copied from the device, on the page when copied from the page.
- **Photo peek caption:** title only.
- **No contextual hint line.** The only line under the device is "press the center to unlock" on the lock screen (round 8: the per-screen hint duplicated the guide).
- Lock screen: one static photo with time and date. No screensaver, no note, no idle relock.
- Fonts: Geist (interface and reading), Geist Mono (labels). Literata was the reading font until 2026-10-02; Arvind felt a serif went against the device, and picked all-Geist over Mona Sans, Schibsted Grotesk, IBM Plex Sans and Atkinson Hyperlegible.
- No end line on articles ("press MENU to go back" removed 2026-10-02): MENU is labeled, the guide explains it, and back/Esc work.

### Features

- **Keep:** lock screen, Brick, the music player with a playlist, Photos (cover flow), Settings (Color, Screen, Clicker, Show controls), entrance animation.
- **Brick** is styled from the theme: bricks in the selection color fading by row, ink paddle, three lives, a score out of 40.
- **Cut:** Shuffle, the Messages inbox idea, Haptics setting (vibration stays on silently where supported), the wheel-as-instrument idea, "Arvind's Rotation" (can't play real songs), the back-of-device idea (parked: too much work for now), the visible "Text version" button (kept for screen readers only).
- **Music:** Arvind wants to add his own tracks. The player supports audio files; the generated tracks are placeholders.
- **Contact:** copy the email with visual confirmation; no `mailto:`. Résumé opens the PDF in a new tab.

### Production stack (2026-10-02)

- **Astro + React + TypeScript**, chosen so each case study is its own file and its own page (`/projects/<name>/`), while the device stays one React component. Zustand for shared state; plain CSS with the theme tokens (no Tailwind); no animation library.
- Case studies are **MDX** with a small set of article components. Content was brought over from the old portfolio as drafts.
- Only projects get URLs. About and each role are their own files but open inside the device.
- A direct project link plays the entrance, skips the lock screen and opens straight into the case study. The address bar follows the device, and the browser's back button zooms out.
- The prototype stays in the repo as the design reference.

## 4. Things to never re-pitch

- Regenerate-the-site-in-any-style (Restyle).
- A 3D room or a desk scene as the main site.
- A hold switch to unlock.
- Grow or Rotate reading modes, a READ button.
- Content-colored background glows; a giant name behind the device.
- Recurring or out-of-device notifications.
- A Classic (glossy) finish; Clear as a public option; more than five device colors.
- A per-screen instruction line under the device.

## 5. How Arvind likes to work

- Brainstorm in text first, then mock up. Detailed mockups of concepts that don't click are wasted effort.
- Wants honest pushback and opinions, not agreement.
- Wants to see options side by side, then reacts with specific, numbered feedback.
- Asked that installed design skills (impeccable, taste-skill, frontend-design, etc.) be used.
