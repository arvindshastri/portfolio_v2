---
name: Arvind Shastri · Pocket
description: A one-page portfolio that lives inside an original click-wheel device.
colors:
  page: 'oklch(0.955 0.004 250)'
  ink: 'oklch(0.21 0.01 250)'
  mute: 'oklch(0.47 0.012 250)'
  accent: 'oklch(0.56 0.18 255)'
  selection: 'oklch(0.56 0.18 255)'
  screen: 'oklch(0.985 0.002 250)'
  screen-ink: 'oklch(0.2 0.01 250)'
  screen-dark: 'oklch(0.16 0.005 250)'
  screen-ink-dark: 'oklch(0.94 0.004 250)'
  bezel: '#060607'
  shell-light: 'oklch(0.9 0.006 250)'
  shell-dark: 'oklch(0.76 0.01 250)'
  wheel: 'oklch(0.26 0.005 260)'
  wheel-ink: 'oklch(0.86 0.005 260)'
  swatch-silver: '#cfd2d7'
  swatch-graphite: '#4a4d53'
  swatch-sky: '#a9c8e4'
  swatch-rosegold: '#e3b9a8'
  swatch-clear: 'conic-gradient(#9fe3c9, #c9a24a, #9fe3c9)'
typography:
  page-name:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: '18px'
    fontWeight: 700
    letterSpacing: '-0.02em'
  label:
    fontFamily: 'Geist Mono, monospace'
    fontSize: '12.5px'
    fontWeight: 500
  ui-list:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: '14.5px'
    fontWeight: 500
  ui-status:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: '11.5px'
    fontWeight: 600
  lock-clock:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: '66px'
    fontWeight: 300
    lineHeight: 1
    letterSpacing: '-0.04em'
  article-display:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: 'clamp(44px, 7.5cqi, 72px)'
    fontSizeNarrow: '30px'
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: '-0.035em'
  article-headline:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: 'clamp(26px, 3.6cqi, 34px)'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.025em'
  article-lead:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: 'clamp(19px, 2.4cqi, 23px)'
    fontWeight: 400
    lineHeight: 1.5
  article-body:
    fontFamily: 'Geist, system-ui, sans-serif'
    fontSize: '18px'
    fontSizeNarrow: '15.5px'
    fontWeight: 400
    lineHeight: 1.72
rounded:
  row: '9px'
  preview: '12px'
  card: '14px'
  panel: '16px'
  screen: '25px'
  screen-frame: '32px'
  device: '46px'
  pill: '999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '14px'
  lg: '28px'
  xl: '64px'
  page-gutter: '26px'
components:
  list-row:
    textColor: '{colors.screen-ink}'
    typography: '{typography.ui-list}'
    rounded: '{rounded.row}'
    height: '32px'
    padding: '0 10px'
  list-row-selected:
    backgroundColor: '{colors.selection}'
    textColor: '#ffffff'
    rounded: '{rounded.row}'
    height: '32px'
  page-link:
    textColor: '{colors.ink}'
    typography: '{typography.label}'
  swatch:
    size: '20px'
    rounded: '{rounded.pill}'
  screen-toast:
    backgroundColor: '#0b0b0c'
    textColor: '#ffffff'
    rounded: '{rounded.pill}'
    padding: '7px 12px'
  article-card:
    rounded: '{rounded.card}'
    padding: '26px 28px'
  article-panel:
    rounded: '{rounded.panel}'
    padding: 'clamp(18px, 3cqi, 36px)'
---

# Design System: Arvind Shastri · Pocket

## 1. Overview

**Creative North Star: "The Object in Your Hand"**

The entire portfolio is one physical object: an original click-wheel music device, called the Pocket, sitting alone on a quiet colored surface. Visitors do not browse a website. They pick the device up, spin the wheel, press the center, and the device answers with clicks, slides and a screen that powers on. Everything that matters lives on the screen; everything around the device is the room it sits in (the page color). There is no instruction text by default: on the lock screen the center button presses itself every few seconds, and after unlocking a highlight runs around the ring until the wheel is spun. A text line appears only if the visitor still hasn't unlocked after 9 seconds. `?` labels everything.

The system is restrained around the object and generous on it. The page has almost nothing on it: a name top-left, two links top-right, color swatches under the device, and a `?`. All personality goes into the device's materials, its sounds and the craft of its screens. When something needs real reading (a case study), the camera pushes into the screen and the content reflows into a full editorial article, so reading is never a squint.

This system explicitly rejects generic AI-generated portfolios (centered hero over a gradient, three equal cards, an eyebrow label above every section, cream backgrounds), the neo-brutalist card stack of Arvind's previous site, busy concept scenes where the gimmick hides the work, and a literal iPod clone. The device is inspired by click-wheel players, never a replica.

**Key Characteristics:**

- One hero object, centered, with the page acting as its room.
- The device color re-themes the whole page: background, text, accent and on-screen selection.
- Tactile feedback everywhere on the device (click sound, press scale, the wheel rocking under the finger, a faint sheen) and almost none off it.
- One type family: Geist for the device and the case studies alike, with Geist Mono for labels.
- Motion is one choreographed entrance plus physical state changes. No scroll-triggered fade-ins.

## 2. Colors

A tinted-neutral room per device color, each with a single accent; the device itself carries the saturated color.

Every device color is a complete theme, and every public color is the same modern, anodized device. The one exception is the secret Clear finish. Each theme also decides whether the device ships with a light or a dark screen. The frontmatter lists the default Silver theme; the full set lives in `src/data/themes.ts`. All theme values are authored in OKLCH.

| Theme                                      | Screen | Page                   | Ink                   | Accent               | Screen selection     |
| ------------------------------------------ | ------ | ---------------------- | --------------------- | -------------------- | -------------------- |
| Silver (default)                           | Light  | oklch(0.955 0.004 250) | oklch(0.21 0.01 250)  | oklch(0.56 0.18 255) | oklch(0.56 0.18 255) |
| Graphite                                   | Dark   | oklch(0.18 0.006 260)  | oklch(0.95 0.003 260) | oklch(0.76 0.12 235) | oklch(0.55 0.16 250) |
| Sky                                        | Light  | oklch(0.95 0.016 235)  | oklch(0.24 0.03 245)  | oklch(0.52 0.14 245) | oklch(0.55 0.14 245) |
| Rose Gold (always last)                    | Light  | oklch(0.95 0.014 25)   | oklch(0.26 0.03 30)   | oklch(0.55 0.12 30)  | oklch(0.56 0.12 32)  |
| Clear (secret, unlocked by clearing Brick) | Dark   | oklch(0.2 0.02 190)    | oklch(0.95 0.01 190)  | oklch(0.8 0.12 175)  | oklch(0.52 0.11 185) |

Four colors are public; five is the ceiling. Light-bodied devices (Silver, Sky, Rose Gold) pair a dark or white wheel with their shell; Graphite, the one dark body, uses a dark wheel and the dark screen. Rose Gold is a copper-pink metal (shell hue 36 to 42) on a pink-white room (hue 25), which keeps it out of the cream band.

### Primary

- **Signal Blue** (oklch(0.56 0.18 255)): the Silver theme's accent and on-screen selection. Used for the selected list row, the visualizer bars, Brick's bricks and ball, page focus rings and the article kicker. It never fills large page areas.

### Neutral

- **Cool Silver Room** (oklch(0.955 0.004 250)): default page background. A near-white with a whisper of blue, never warm.
- **Graphite Ink** (oklch(0.21 0.01 250)): page text and the name.
- **Slate Mute** (oklch(0.47 0.012 250)): secondary page text (role line, hints, callout descriptions). Passes 4.5:1 on the page.
- **Screen** (`scrL`/`inkL` light, `scrD`/`inkD` dark): the LCD, tinted very slightly toward each theme's hue. The theme picks light or dark; Settings → Screen can flip it until the next color change.
- **Wheel Ink** (`wink`): the wheel labels, and also the center button's focus ring, so they match the device's material instead of a fixed blue.
- **Wheel Sheen** (`wglow`): a 5 to 7% white (dark wheels) or tinted (light wheels) highlight under the pointer. Never the accent.
- **Bezel Black** (#060607): the glass frame around the screen.

### Named Rules

**The Device Paints the Room Rule.** The page background, ink, accent and on-screen selection always come from the selected device color. Nothing on the page may hard-code a color outside the theme tokens, and no content-driven glows or gradients may tint the room.

**The One Accent Rule.** Each theme has exactly one accent. It marks selection, focus and progress. It is never used decoratively and never covers more than about 10% of the visible page.

**The No Cream Rule.** Light rooms are true off-whites (chroma 0 to 0.006) or clearly hued tints (Rose Gold's room is pink-white, hue 25, not sand). Warm beige, sand and parchment backgrounds are prohibited.

## 3. Typography

**Interface Font:** Geist (with system-ui, sans-serif)
**Reading Font:** Geist as well (the `--font-read` token), weighted for long reading
**Label/Mono Font:** Geist Mono (with monospace)

**Character:** Geist is the device's firmware: clean, compact, slightly technical, used for every menu, status bar and page label. Case studies are set in Geist too, so opening a project feels like the device's own software rather than a different site: heavier, tightly tracked headings (600) over relaxed body text. A serif (Literata) was used first and dropped because it fought the device's character.

### Hierarchy

- **Article Display** (Geist 600, clamp(44px, 7.5cqi, 72px), 1.04, -0.035em): case study titles, only on the reading page.
- **Article Headline** (Geist 600, clamp(26px, 3.6cqi, 34px), 1.15, -0.025em): section headings inside articles.
- **Article Lead** (Geist 400, clamp(19px, 2.4cqi, 23px), 1.5): the one-paragraph intro under a title.
- **Article Body** (Geist 400, 18px, 1.7): reading text. Column capped at 680px.
- **Narrow article sizes** (screen under 560px wide, i.e. phones): title 30px, lead 16.5px, headings 21px, body 15.5px/1.62 (narrow headings 600). Articles only ever appear on the reading page, so these are real reading sizes, never miniature ones.
- **Lock Clock** (Geist 300, 66px, 1, -0.04em, tabular numerals): the lock screen time.
- **UI List** (Geist 500, 14.5px): menu rows on the device.
- **UI Status** (Geist 600, 11.5px): the device's status bar.
- **Page Name** (Geist 700, 18px, -0.02em): "Arvind Shastri" top-left.
- **Label** (Geist Mono 500, 12.5px): the role line, the instruction hint, meta labels, captions and the article kicker.

Sizes inside articles use container query units (`cqi`) against the reading page's width.

### Named Rules

**The One Voice Rule.** Geist sets both the device and the content; hierarchy comes from weight, size and tracking, not a second family. Reading text keeps its own token (`--font-read`) and sizes. Geist Mono is the only other voice.

**The Mono Is for Instructions Rule.** Geist Mono is reserved for instructions, metadata and captions. It is never used for headings or body copy, and never as shorthand for "technical".

**The Letter-Spacing Floor Rule.** Display tracking never goes tighter than -0.04em.

## 4. Elevation

The page is flat; only the device has depth, and it has it the way a real object does: a body shadow, a soft blurred floor shadow beneath it, and specular highlights on its material. Depth on the screen comes from tonal layering and the screen-glass reflection, not drop shadows.

### Shadow Vocabulary

- **Device body** (`box-shadow: inset 0 0 0 1px var(--edge), inset 0 2px 0 var(--edge), inset 0 -3px 8px rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.14), 0 40px 60px -34px rgba(10,14,20,.45)`): a machined edge highlight, a tight contact shadow and one grounded drop shadow.
- **Screen recess** (`inset 0 1px 2px rgba(0,0,0,.7), 0 1px 0 var(--edge)` on the glass frame): the screen sits below the shell; the lower lip catches light.
- **Backlight falloff** (`inset 0 0 18px rgba(0,0,0,.09)` inside the LCD): the edges of the display are a touch dimmer than the middle.
- **Wheel recess** (`0 0 0 1px rgba(0,0,0,.2), 0 1.5px 0 1px var(--edge)`): the wheel sits in a shallow well.
- **Floor** (300 by 40px ellipse, theme `--floor` color, `filter: blur(18px)`): grounds the device on the surface. Hidden while reading.
- **Screen glass** (linear-gradient 150deg from rgba(255,255,255,.2) to transparent at 38%): a reflection that shifts with the device tilt.
- **Enlarged photo** (`box-shadow: 0 0 0 8px #0d0e10, 0 40px 80px -30px rgba(0,0,0,.55)`): the photo panel, framed like the bezel.

### Named Rules

**The Grounded Object Rule.** The device always sits on the surface (floor shadow) and tilts slightly toward the pointer (at most 12deg Y, 8deg X). It never floats, bounces or spins.

**The Flat Room Rule.** Nothing on the page outside the device casts a shadow. Links, swatches and hints are flat. The room itself may have light: a fixed radial falloff (transparent at the center, `rgba(0,0,0,.07)` at the corners) like a studio sweep lit from above the device. It is never colored by content.

## 5. Components

### The Pocket (signature component)

Tactile, precise and quiet: an object first, a UI second.

- **Body:** 360 by 604px, 46px corner radius. Anodized aluminum in every color: a gradient between the theme's two shell tones, faint grain, a 1px machined edge highlight. The secret **Clear** finish is a teal-tinted, see-through shell with a polished rim and sharper gloss. Through it you see the board: the amber flex cable from the screen, chips with pin-1 dots and tiny parts, gold traces, screws, the wheel's copper sensor rings, the battery behind a smoky see-through wheel, and a status LED breathing in the accent color. The board drifts a few pixels against the device's tilt, so it reads as sitting deeper than the shell. Dark screen; no grain.
- **Screen:** inset 13px, 310px tall glass frame (32px radius, bezel black, 7px padding) holding the 25px-radius LCD. Content lays out in a container (`container-type: inline-size`).
- **Wheel:** 222px diameter, centered 346px from the top. Labels: MENU (top) in Geist 650 11px, tracked 0.1em; the transport marks ◀◀ (left), ▶▶ (right) and ▶ ❚❚ (bottom) are Lucide `Play` and `Pause` icons, filled, at 12px, with each skip mark made of two nested play triangles (rewind mirrored). All in the theme's wheel ink. All four sit at the same inset from the rim, measured to the drawn ink (about 17.5px), and are optically centered; MENU gets 0.1em of left padding to cancel the tracking after its last letter. Never text glyphs: Geist lacks them, so phones drew them from mismatched fallback fonts (a heavy, oversized pause; an emoji play). A faint sheen (`wglow`) follows the pointer. Pressing the ring rocks the wheel 3deg toward the finger (perspective 600px) until it's released or starts spinning. Spinning registers one step every 18 degrees.
- **Center button:** 82px, the shell material. Scales to 0.96 and its shadow turns inward when pressed. There is no hold action.

### Status Bar

- Three columns (`1fr auto 1fr`, so the title stays centered): the current screen title centered, the time on the right with tabular numerals. The play state is a filled Lucide `Play` icon while playing, `Pause` when paused, empty if never played.
- **On the main menu** the play state sits on the left. **Below it** the left side is a back button: Lucide `ChevronLeft` (13px, 2.6 stroke) and the name of the screen it returns to, Geist 500 in the accent color (`kick`), its hit area running to the screen's edge; the play state moves to the right, beside the time.
- 28px tall.

### List Rows and Preview Pane

- **Rows:** 32px tall, Geist 500 14.5px. Markers are Lucide icons, never text glyphs, and appear only on the highlighted row (they fade and slide in): `ChevronRight` (15px, 2.4 stroke) on rows that open a screen and on Copy email; `ExternalLink` (13px, 2.2 stroke) on LinkedIn, GitHub and Résumé, which open in a new tab. Settings rows always show their value (On, Off, Light, Dark) at 55% opacity, 90% when highlighted. The playing track shows a Lucide `AudioLines` icon (13px, 70%) after its name. Long labels truncate with an ellipsis; on the highlighted row they scroll across once and back after a 1.4s pause, then rest.
- **Selected:** one highlight bar (9px radius, the theme's selection color, white text) that slides between rows in 150ms (ease-out-quart).
- **Preview pane:** the right 53% of list screens (the list takes 47%), 12px radius, on a tinted panel (`scrInk` at 5% over `scr`). **Main menu:** one big line icon on its own (1.5px stroke in the selection color, up to 118px), no title, no eyebrow, over a soft pool of the selection color (13%) with a faint cover-flow reflection beneath. Icons are static (no draw-in or idle motion; tried and removed) and come from **Lucide** (lucide.dev, ISC), inlined, 1.6px stroke. Icons: layers (Projects), briefcase (Experience), person (About), photo (Photos), note (Music), game pad (Extras), sliders (Settings), envelope (Contact). **Second level:** projects show their cover, a mono eyebrow (year, platform) in the selection color, title and pitch; jobs show the same eyebrow (years), role and summary; tracks show album art with title and artist directly beneath, centered as one group; Contact rows use Lucide icons (mail, LinkedIn, GitHub, file-text); the ↗ marker is 17px; Brick shows a mini game board. Images never drift or zoom. Arvind will specify final preview content.
- **Screen transitions:** new screens slide in from the right over 340ms (ease-out-expo); the previous screen parallaxes 35% left, then hides.

### Lock Screen

- A stock-style gradient wallpaper tinted by each theme's `wall` and `wall2` tokens (a light glow top-left, a deep pool bottom-right, over the dark `wall2` end: near-black for most themes, mid steel gray for Silver), so it follows the device color; no photo. Silver and Graphite use neutral steel and charcoal tints; the other themes use their accent. The time in Lock Clock style, the date below. Nothing else. The page hint below the device says "press the center to unlock". Unlocking slides the lock screen up.

### Reading Page (case studies, roles, About)

- **The page:** full window, in the screen's colors (`scr`, `scrInk`). It grows out of the device's screen: a clip from the screen's exact outline and corner radius to the whole window, 620ms ease-out-expo, and the content cascades in while it opens: the bar fades in, then the header's parts and the blocks below each fade and rise 18px, 50ms apart. Closing: the content settles back and fades (220ms) as the page shrinks into the screen (520ms), and the page dissolves into the list as it settles (300ms crossfade).
- **Bar:** 52px (56px at 560px wide and up), a hairline under it (`scrInk` at 9%). `‹` Lucide `ChevronLeft` (20px, 2.2 stroke) and the parent list's name in the accent color (`kick`), Geist 500 15px, with a 9% tint on hover; the title centered in Geist 600, truncated. No play/pause or time.
- **Contents:** a numbered list before the first section, between hairlines (`scrInk` at 10%): mono label "Contents" at 55%, rows in Geist 500 15.5px (16px wide) at 80% with a mono number in the accent color; two columns from 560px, read down then across (CSS columns). In the bar, the current section (mono number in the accent color, title at 85%, a `ChevronDown` that turns over when open) opens the same list as a menu: 320px max, 14px radius, hairline border, a soft shadow, the current row in 600.
- **Scrollbar:** visible and thin, in `scrInk` at 25%, unlike the device's screen.

Editorial and calm; the content is the hero.

- **Column:** 680px max, centered, with fluid gutters clamp(28px, 8cqi, 96px). **Every block shares this one width** (2026-10-06): pull quotes, splits, cards, galleries, image panels, prototypes and the cover all sit in the 680px column, so the page reads as one calm column. Images can be enlarged for detail.
- **Header:** accent-colored mono kicker, Article Display title, Article Lead, then a four-column meta row (Role, Platform, Tools, Partner) between hairlines.
- **Stats:** three or four large Geist 600 numbers (tabular) with mono captions, closed by a hairline (four shrink slightly; 2×2 on phones).
- **Pull quote:** centered Geist 500 (upright) on a 9% accent tint, 16px radius, with a mono citation.
- **Split:** heading and paragraph left, a checklist of large accent percentages right.
- **Gallery:** stacked full-width images with mono captions, 10px radius and a 1px hairline ring.
- **Cards:** two side by side, 14px radius, 26 by 28px padding; the positive card uses a 10% accent tint, the other a 5% ink tint.
- **Panels:** final screens on a 8% accent tint, 16px radius.
- **Role pages:** kicker (dates), company as the title, role as the lead, then the résumé bullets as an arrow list, then a hairline and two tag groups side by side ("Tools and technologies", "Skills"): mono labels over pills on a 9% accent tint. Role previews have no image, so the summary may run up to 12 lines.
- **Philosophy block (About):** inverted against the screen (`scrInk` background, `scr` text), 16px radius, 44 by 48px padding, 820px max: accent mono label, a Geist 600 statement (24 to 30px), then a sentence at 75% opacity.
- **Tag groups:** a role's tools and skills, or the About toolkit (four groups in a 2×2 grid; stacked on phones).
- **Prototypes:** live Figma embeds in a 16:10 frame (920px max, 14px radius, 7% accent tint with an 18% ring), mono caption with an "Open in Figma" link followed by the Lucide `ExternalLink` icon (inline SVG). The iframe loads only when the frame scrolls within 400px of view; until then, in peeks and in the text version, it's a link out.

### Enlarged Photo

- Takes the photo's own shape, up to 92% of the width and 84% of the height (1100 by 900px max), 26px radius, framed by an 8px bezel ring, on black with the caption over a bottom gradient. Scales from 0.35 to 1 over 380ms. It opens at once on the image already loaded (the cover flow's thumbnail, or the article's own image) and the full size fades in over it (300ms) once loaded. Photos and article images share it.

### Page Chrome

- **Name block:** top-left. The name is a button that returns the device to the main menu (zooming out first if needed). Below it the mono role line "designer + engineer". Nothing else.
- **Links:** top-right, "Résumé" and "Contact" in Geist 15px with an underline that draws in from the left on hover.
- **Swatches:** 20px circles centered under the device; the active one gets a 2px page-colored gap and a 1.5px ink ring.
- **Hint:** "press the center to unlock", shown only if the visitor is still on the lock screen after 12 seconds (3 seconds under reduced motion, where the button animation is off). The page markup holds no hint text.
- **Affordances:** locked, the center button presses itself (scale .955, inset shadow) every 3.4s and a wheel-ink ring pings out of it. Unlocked but never spun, a soft highlight travels once around the ring, twice, at 2.6s and again at 11s.
- **Guide:** labeled callouts with hairline leaders and dot terminals pointing at each control. Positions are measured from the live device, so leaders always land on their control. Shown on first visit and via `?`; the leader lines draw in with a 70ms stagger and fade on the next interaction. On phones (under 820px) `?` shows the same labels as a sheet at the bottom instead.
- **Toasts:** small rounded messages led by a 14px Lucide icon: a check for "Copied …", an open lock for "Clear finish unlocked". Dark on the screen (bottom of the display), ink-colored by the page links. Copying from the device confirms on the device; from the page, on the page. These are the only notifications in the product.

## 6. Do's and Don'ts

### Do:

- **Do** keep everything on or around the single device. One object, done perfectly.
- **Do** let the device color theme the entire page through the theme tokens.
- **Do** open long content by growing the screen into a full-window page, with the article fading in at its final size so the reflow is never visible.
- **Do** give every device control physical feedback: a 4ms high-passed click, a press scale, the wheel rocking under the finger.
- **Do** use ease-out curves only (ease-out-expo `cubic-bezier(.16,1,.3,1)` and ease-out-quart `cubic-bezier(.25,1,.5,1)`).
- **Do** provide a reduced-motion path for every animation (instant or crossfade).
- **Do** keep sound opt-in by interaction: nothing plays until the visitor touches the device.

### Don't:

- **Don't** build generic AI-generated portfolio patterns: a centered hero over a gradient, three equal cards, eyebrow labels on every section, cream backgrounds.
- **Don't** drift back toward the previous portfolio: neo-brutalist cards, hard shadows, an indigo accent, content scattered across pages.
- **Don't** build over-busy concept scenes where the gimmick hides the work (a cluttered desk, a 3D room to explore).
- **Don't** copy other people's signature ideas, such as regenerating the site in any style.
- **Don't** make a literal iPod clone: no Apple logos, no exact Apple proportions or wording, no white-earbud imagery.
- **Don't** put notifications, toasts or banners outside the device for device events.
- **Don't** shake the device repeatedly. One 2px nudge the first time a list end is reached.
- **Don't** show a small preview before opening, or let text visibly reflow while the page grows.
- **Don't** add public finishes other than the modern anodized body (no glossy classic). Clear stays secret. Don't use the accent for the wheel's hover sheen.
- **Don't** let the device tilt follow the pointer while it's on the wheel or dragging; the object holds still while you use it.
- **Don't** use bounce or elastic easing, side-stripe borders, gradient text, glassmorphism as decoration, or decorative grid backgrounds.
- **Don't** use em dashes in visible copy.
