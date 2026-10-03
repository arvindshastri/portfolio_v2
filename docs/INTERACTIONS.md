# Interaction Spec: the Pocket

How the device behaves. This is the source of truth for controls, states, transitions and timings. Visual styling lives in [DESIGN.md](../DESIGN.md); content lives in [CONTENT.md](CONTENT.md). The implementation is in [src/device](../src/device) (the original prototype is [prototype/index.html](../prototype/index.html)).

## 1. Principles

1. **Physical metaphors map to navigation.** Spin = scroll and select, press = open, hold = peek, MENU = back. Once someone touches it, they know how it works.
2. **The small screen is for browsing; the big screen is for reading.** Opening long content zooms into the screen and reflows it.
3. **Feedback on every input:** a click sound, a press scale, the wheel rocking under the finger, and vibration on supported phones.
4. **Nothing interrupts.** No recurring notifications, no idle relock, no auto-play.

## 2. Controls

| Input                  | Device                                                               | Keyboard                                     | Result                                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spin clockwise         | Drag around the wheel ring, or mouse/trackpad scroll over the device | `↓`                                          | Next item / scroll down / volume up / paddle right                                                                                                    |
| Spin counter-clockwise | Drag the other way                                                   | `↑`                                          | Previous item / scroll up / volume down / paddle left                                                                                                 |
| Press center           | Click/tap the center button                                          | `Enter` (or `Space` on non-peekable screens) | Unlock, open, select, play/pause, launch the Brick ball                                                                                               |
| Hold center (320ms)    | Press and hold                                                       | Hold `Space`                                 | Peek at the selected project or photo while held                                                                                                      |
| MENU                   | Tap the top of the ring                                              | `Esc` or `Backspace`                         | Back; while zoomed, zoom out and return to the list                                                                                                   |
| ▶ ❚❚                   | Tap the bottom of the ring                                           | (none)                                       | Play/pause music from anywhere                                                                                                                        |
| ◀◀ / ▶▶                | Tap the left/right of the ring                                       | `←` / `→`                                    | On Now Playing: previous/next track. In Photos: previous/next photo. While reading: previous/next section heading. Elsewhere: same as a one-step spin |

- **Spin resolution:** one step every 18 degrees of rotation. Mouse wheel over the device: one notch (|deltaY| ≥ 50) is exactly one step; trackpads accumulate 40px per step, at most one step per 70ms.
- **Selection:** the highlight bar slides to the new row (150ms); only the row classes and the preview change, the list is not re-rendered.
- **Tap vs spin:** a pointer-up with under 8 degrees of total rotation counts as a tap on the ring quadrant under the pointer.
- **End of list:** the first time a spin hits the top or bottom, the device nudges up 2px once (220ms). Further spinning at the edge does nothing until you move away.
- **Wheel sheen:** a faint highlight in the wheel's own material (`wglow`) follows the pointer. Never the accent color.
- **Wheel rock:** pressing the ring tilts the wheel 3 degrees toward the finger. It levels out on release or once the press turns into a spin.
- **Device tilt:** the device leans toward a mouse pointer (12deg/8deg max), but holds still while the pointer is on the wheel, while any button is down, while the guide is open, and for touch input.

## 3. Navigation tree

```
Lock screen (press center)
└── Menu
    ├── Projects        list → press: zoom into case study · hold: peek
    │   ├── Trac Commuter
    │   ├── Trac Driver
    │   ├── Orderly
    │   └── StudyFinder
    ├── Experience      list → press: zoom into the role · hold: peek
    ├── About           press: zoom into the About article
    ├── Photos          cover flow → press: sticky peek · hold: peek while held
    ├── Music           playlist → press: play the track and open Now Playing
    ├── Extras
    │   └── Brick       spin = paddle (continuous), center = launch
    ├── Settings        Color · Screen (Light/Dark) · Clicker (On/Off) · Show controls
    └── Contact         Copy email · LinkedIn ↗ · GitHub ↗ · Résumé (PDF)
```

The highlighted row shows `›` if it opens something. Leaf rows always show their value (On, Off, PDF, ↗). Long labels truncate; the highlighted one scrolls to reveal the rest.

## 4. States and transitions

### Entrance (first load)

Order, using ease-out-expo, all skippable by any key or pointer input:

1. The device arrives first; the page is otherwise empty.
2. Device rises 70px, scales from 0.94 and unblurs from 10px (1100ms, starts at 180ms); the floor shadow grows in.
3. The screen powers on: black, a brief flicker, then the lock screen with a short brightness flash (1500ms, starts at 400ms).
4. As the screen powers on (1150ms), the name, the links and `?` fade and unblur in together (800ms). Swatches stagger in 55ms apart from 1250ms.
5. On a visitor's first visit only, the controls guide appears at about 1500ms.

Every entrance animation uses `fill: backwards` on already-visible content, so if animations never run the page is still complete. Reduced motion skips the entrance entirely.

### Lock → Menu

Press center (or click the name). The lock screen slides up (700ms).

While locked, the center button presses itself every 3.4s and a ring pings out of it. If the visitor is still locked after 12 seconds (3 under reduced motion), the line "press the center to unlock" fades in. After unlocking, if the wheel hasn't been spun, a highlight runs around the ring at 2.6s and 11s; any spin stops it.

### Menu screens

Push: the new screen slides in from the right while the previous one shifts 35% left, then hides. Pop is the exact mirror. Both use one function (Web Animations, 340ms ease-out-expo), so forward and back have identical speed and feel; a timed fallback finishes a slide that is still running after its duration (throttled tabs), and starting a slide cancels any older slide on the same screens, so a stale slide can never reassert itself.

### Open (zoom into content)

1. The screen blanks (opacity 0, 140ms).
2. While blank, the content screen is pushed without a slide, the screen container is re-laid-out at its zoomed size (scaled back down so it looks unchanged), and the camera starts pushing in (800ms).
3. The screen reveals at about 440ms, already in its final layout.
4. The device wheel fades out, the docked dial rises from the bottom center (600ms), and the page chrome (name, links, swatches, hint, `?`) fades out. Zooming out reverses it.

No small preview is ever shown before zooming, and text never visibly reflows.

**Zoom framing:** the screen is centered in the area between 16px from the top and the top of the docked dial (dial size + 46px from the bottom), scaled to fill 94% of the width or all of that height, whichever is smaller. The content layer is laid out at exactly the zoomed screen size, with the device's fit scale accounted for, so it fills the glass edge to edge on any viewport.

### Reading while zoomed

- Native scroll over the article (trackpad, touch, mouse wheel).
- The mouse wheel or trackpad **anywhere else on the page** also scrolls the article (eased).
- The docked dial is a full, smaller wheel. Spinning it scrolls 6px per degree with easing and a soft click every 15 degrees; letting go keeps momentum that decays smoothly.
- ◀◀ / ▶▶ on the dial jump to the previous/next section heading. The dial's center button pages down (80% of the screen). ▶ ❚❚ plays or pauses music.
- `↑`/`↓` scroll 110px per press. All of these share one eased scroller, so they feel the same.
- MENU, `Esc`, or clicking the dimmed area around the device closes: blank, zoom out, pop back to the list, reveal.

### Peek

- Hold the center for 320ms on a peekable row (projects, roles) or in Photos. A ring fills around the button while holding.
- The peek panel scales up from 0.35 (380ms) over a dimmed page. Release to close.
- Photos: a single press opens a sticky peek; the next input of any kind closes it. The photo panel takes the photo's own aspect ratio (up to 92% of the width and 84% of the height), so the whole photo always shows.

### Photos (cover flow)

Spinning moves the existing covers to their new positions (500ms ease-out-expo): the center cover swings flat and forward, neighbors rotate 64 degrees and dim. Nothing is re-rendered, so every step animates. The caption shows the title and "3 of 8".

### Name button

Clicking the name top-left returns to the main menu from anywhere (zooming out first, closing any peek, unlocking if locked).

### Guide

Shown on the first visit and via `?`. Leader lines draw in with a 70ms stagger. The next interaction of any kind fades it out.

### Theme change

Picking a swatch (or Settings → Color) re-themes the page in about 900ms: background, ink, accent, device materials and on-screen selection. The choice persists.

### Brick

Spinning moves the paddle continuously (4.2 canvas px per degree, eased toward the target each frame), not in fixed steps; arrow keys and mouse-wheel notches move it 46px. Center launches the ball. Three balls (dots top-left), score top-right out of 40. Bricks are drawn in the theme's selection color, fading by row; a hit brick pops and fades over 220ms. Modes: ready (ball on the paddle, "press the center to launch"), play, over, won. Losing a ball returns it to the paddle. Losing all three, or clearing the board, dims the board under an end card ("Game over" with bricks cleared, or "Cleared" with the unlock line the first time) and "press the center to reset". The first press resets to a fresh ready board; the next press launches.

### Secret finish unlock

Clearing all 40 bricks saves the unlock, adds a fifth swatch (Clear: a see-through shell with the dark screen), and shows a toast at the bottom of the screen, "Clear finish unlocked" with an open-lock icon, for about 3.5 seconds. Clearing Brick again shows the end card ("All 40 bricks") with no new reward.

## 5. Audio

- Nothing plays and no audio context is created until the first touch of the device (browser autoplay rules).
- **Clicker:** a 4ms white-noise burst through a 2.4kHz high-pass filter. Volume scales by action (1 for steps, 2 for selects, 0.5 for continuous dial scrolling). Toggle in Settings.
- **Music:** tracks with a `src` play from audio files through the same output and visualizer. Tracks with a `song` are lo-fi generated in the browser: a 4-bar-section form (intro, verses, a B progression, a drumless breakdown, an outro, about 100 to 110 seconds), swing, melodies written per section from a seed (a motif, its variation, an answer, a resolution), drum fills into new sections, a mix lowpass that opens in the intro and closes for the breakdown and outro, and a texture bed (rain, vinyl crackle or tape hiss). When a song ends, the next one starts. Music continues while browsing; the status bar shows ▶ or ❚❚. When a file track ends, the next track starts.
- **Volume:** spinning on Now Playing shows a volume bar for about 1.1 seconds.

## 6. Contact actions

- **Copy email** (device): copies the address and confirms on the device screen only. (The page link confirms on the page only.)
- **Contact** (page link): copies the email with the page badge. No `mailto:`.
- **Résumé** (page link and device): opens `assets/resume.pdf` in a new tab.
- **LinkedIn / GitHub:** open in a new tab.

## 7. Persistence

Stored in `localStorage` with the `pocket-` prefix; every read and write is wrapped so the site works when storage is blocked.

| Key                | Meaning                                                                            |
| ------------------ | ---------------------------------------------------------------------------------- |
| `pocket-color`     | Selected device color id                                                           |
| `pocket-secret`    | Whether the secret color is unlocked (the old `pocket-clear` key is still honored) |
| `pocket-seenGuide` | Whether the first-visit guide has been shown                                       |

## 8. Mobile

- The device scales to fit: `min(1, (vw - 24) / 380, (vh - 210) / 604)`.
- Touch drag on the wheel works like a pointer drag; vibration fires on supported phones (Android Chrome; iOS Safari has no vibration API).
- When zoomed, the screen fills the width and the 156px dial sits under the thumb, fully visible.
- Articles use narrow reading sizes on phones (15.5px body, 30px titles).
- The guide callouts don't fit beside the device under 820px; `?` shows the same labels as a sheet at the bottom instead (tap it or touch the device to dismiss).
- Known limit: the screen is roughly square, so on a tall phone the zoomed article uses about 330px of height. See ROADMAP.

## 9. Accessibility

- Full keyboard control (see Controls). Visible focus rings in the theme accent.
- The center button has an accessible label ("Select. Hold to peek."). Swatches are a labeled radio group.
- A screen-reader-only "Text version of this site" button opens a plain dialog with all content.
- `prefers-reduced-motion`: transitions and animations collapse to near-instant; the entrance is skipped.
- Target WCAG 2.2 AA contrast for page text in every theme.

## 10. Dev and test hooks (prototype only)

URL parameters in the prototype, for screenshots and testing:

| Param                        | Effect                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `?color=graphite`            | Start with a device color                                                                   |
| `?go=s,s,1,p`                | Unlock, then a sequence: `s` select, `p` peek, `1`/`-1` step, `toast` show the unlock toast |
| `?notrans=1`                 | Disable all transitions (headless screenshots stall on transitions)                         |
| `?guide=1`                   | Show the guide pinned                                                                       |
| `?dark=1`                    | Dark screen                                                                                 |
| `?brick=over` / `?brick=won` | Show Brick's end card (use with a `go` sequence that opens Brick)                           |
| `?unlock=1`                  | Unlock the secret finish (preview with `&color=clear`)                                      |

These only run in development (`npm run dev`); production builds don't include them. `?scroll=1200` also scrolls an open article.
