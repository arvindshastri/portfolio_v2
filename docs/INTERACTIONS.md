# Interaction Spec: the Pocket

How the device behaves. This is the source of truth for controls, states, transitions and timings. Visual styling lives in [DESIGN.md](../DESIGN.md); content lives in [CONTENT.md](CONTENT.md). The implementation is in [src/device](../src/device) (the original prototype is [prototype/index.html](../prototype/index.html)).

## 1. Principles

1. **Physical metaphors map to navigation.** Spin = scroll and select, press = open, MENU = back. Once someone touches it, they know how it works.
2. **The small screen is for browsing; the page is for reading.** Opening long content grows the screen into a full-window page.
3. **Feedback on every input:** a click sound, a press scale, the wheel rocking under the finger, and vibration on supported phones.
4. **Nothing interrupts.** No recurring notifications, no idle relock, no auto-play.

## 2. Controls

| Input                  | Device                                                               | Keyboard             | Result                                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spin clockwise         | Drag around the wheel ring, or mouse/trackpad scroll over the device | `↓`                  | Next item / scroll down / volume up / paddle right                                                                                                                                                                       |
| Spin counter-clockwise | Drag the other way                                                   | `↑`                  | Previous item / scroll up / volume down / paddle left                                                                                                                                                                    |
| Press center           | Click/tap the center button                                          | `Enter` or `Space`   | Unlock, open, select, enlarge a photo, play/pause, launch the Brick ball, drop a Stack block                                                                                                                             |
| MENU                   | Tap the top of the ring, or `‹ Menu` in the status bar               | `Esc` or `Backspace` | Back; while reading, close the page and return to the list                                                                                                                                                               |
| ▶ ❚❚                   | Tap the bottom of the ring                                           | (none)               | Play/pause music from anywhere                                                                                                                                                                                           |
| ◀◀ / ▶▶                | Tap the left/right of the ring                                       | `←` / `→`            | On Now Playing: previous/next track. In Photos: previous/next photo. Elsewhere: same as a one-step spin                                                                                                                  |
| Tap the screen         | Tap or click a row, a cover or the lock screen                       | (none)               | A row: the highlight moves to it, then it opens or acts, as if spun to and pressed (140ms between). Photos: a side cover comes to the middle; the middle one enlarges; a horizontal swipe steps. The lock screen unlocks |

- **Spin resolution:** one step every 18 degrees of rotation. Mouse wheel over the device: one notch (|deltaY| ≥ 50) is exactly one step; trackpads accumulate 40px per step, at most one step per 70ms.
- **Selection:** the highlight bar slides to the new row (150ms); only the row classes and the preview change, the list is not re-rendered.
- **Tap vs spin:** a pointer-up with under 8 degrees of total rotation counts as a tap on the ring quadrant under the pointer.
- **End of list:** the first time a spin hits the top or bottom, the list and its highlight stretch 6px past the edge in the direction of the spin and ease back (420ms, no overshoot). In Photos the row of covers stretches 10px the way covers move. The device itself never moves and there is no sound. Further spinning at the edge does nothing until you move away. Reduced motion skips it. MENU on the main menu does nothing.
- **Wheel sheen:** a faint highlight in the wheel's own material (`wglow`) follows the pointer. Never the accent color.
- **Wheel rock:** pressing the ring tilts the wheel 3 degrees toward the finger. It levels out on release or once the press turns into a spin.
- **Device tilt:** the device leans toward a mouse pointer (12deg/8deg max), but holds still while the pointer is on the wheel, while any button is down, while the guide is open, and for touch input.

## 3. Navigation tree

```
Lock screen (press center)
└── Menu
    ├── Projects        list → press: open the case study
    │   ├── Trac Commuter
    │   ├── Trac Driver
    │   ├── Orderly
    │   └── StudyFinder
    ├── Experience      list → press: open the role
    ├── About           press: open the About article
    ├── Photos          cover flow → press: enlarge the photo
    ├── Music           playlist → press: play the track and open Now Playing
    ├── Extras
    │   ├── Brick       spin = paddle (continuous), center = launch
    │   └── Stack       center (or a tap on the screen) = drop
    ├── Settings        Color · Screen (Light/Dark) · Clicker (On/Off) · Show controls
    └── Contact         Copy email · LinkedIn · GitHub · Résumé (each opens in a new tab)
```

The highlighted row shows a chevron icon if it opens something or acts in place (Copy email), and an open-link icon if it opens a new tab (LinkedIn, GitHub, Résumé). Settings rows always show their value (On, Off, Light, Dark). Long labels truncate; the highlighted one scrolls to reveal the rest, whenever it overflows at all (the browser shows the ellipsis for even 1px).

## 4. States and transitions

### Entrance (first load)

Order, using ease-out-expo, all skippable by any key or pointer input:

1. The device arrives first; the page is otherwise empty.
2. Device rises 70px, scales from 0.94 and unblurs from 10px (1100ms, starts at 180ms); the floor shadow grows in.
3. The screen powers on: black, a brief flicker, then the lock screen with a short brightness flash (1500ms, starts at 400ms).
4. As the screen powers on (1150ms), the name, the links and `?` fade and unblur in together (800ms). Swatches stagger in 55ms apart from 1250ms.
5. The controls guide never appears by itself; `?` opens it anywhere.

Every entrance animation uses `fill: backwards` on already-visible content, so if animations never run the page is still complete. Reduced motion skips the entrance entirely.

### Lock → Menu

Press center (or click the name). The lock screen slides up (700ms).

While locked, the center button presses itself every 3s and a ring pings out of it. Tapping the lock screen also unlocks. If the visitor hasn't unlocked after 8 seconds (3 under reduced motion), a phone-style notification drops in under the date, "Press the center or tap here to unlock. Spin the wheel to scroll.". It stays until unlock. It replaced the "press the center to unlock" line under the device, which visitors didn't look at.

### Menu screens

Push: the new screen slides in from the right while the previous one shifts 35% left, then hides. Pop is the exact mirror. Both use one function (Web Animations, 340ms ease-out-expo), so forward and back have identical speed and feel; a timed fallback finishes a slide that is still running after its duration (throttled tabs), and starting a slide cancels any older slide on the same screens, so a stale slide can never reassert itself.

### Open (reading page)

1. Pressing center on a project, role or About pushes the article without a slide and opens the **reading page**: a full-window page in the screen's colors.
2. The page grows out of the device's screen: it starts clipped to the screen's exact outline (position, size, rounded corners; the device's tilt is dropped for the measurement) and the clip opens to the whole window (620ms ease-out-expo). The page chrome (name, links, swatches, hint, `?`) fades out underneath.
3. While the page is still opening, its content cascades in, already laid out at its final size: the bar fades in (from 200ms), then the article's header parts (kicker, title, lead, facts) and the blocks below each fade and rise 18px, 50ms apart (560ms each, from 220ms; the first nine). Text never visibly reflows.

### Reading

- A 52px bar on top (56px on wide pages): `‹ Projects` (the list it came from, in the accent color) on the left, the title centered.
- **Contents** (articles with 3 or more `##` sections): a numbered list just before the first section, one column on phones and two columns read top to bottom on wider pages. Choosing a section eases the page there (heading 24px from the top) and moves focus to it.
- Once the inline Contents has scrolled away, the bar's right side shows the current section (`04 Design process ⌄`; `04/07 ⌄` on phones). It opens the Contents as a menu; `Esc` or a tap outside closes the menu without closing the page. The current section is the last heading above 30% of the page height, or the last section once the page is scrolled to the bottom (a short last section never reaches that line).
- The article scrolls natively (touch, trackpad, mouse wheel, scrollbar). The mouse wheel over the bar scrolls it too.
- **Images enlarge:** tapping an image in an article (not one inside a link) opens it in the enlarged view (see below), at its largest size (the 1600px file instead of the 640px one on the page), with its figure caption. The cursor is `zoom-in` over them.
- `↑`/`↓` scroll 110px per press and `Space`/`Enter` page down (80% of the page), all eased.
- No wheel or dial while reading (the docked dial was removed on 2026-10-06).
- Closing: the back button, `Esc`/`Backspace`, or the browser's back button. The list returns in the screen underneath, the content settles back (10px down, 98.5% scale) and fades (220ms) as the page shrinks back into the screen (520ms, from 70ms); over the last part (from 290ms, 300ms) the page dissolves into the list, so the list fades in instead of appearing when the page goes, then the page chrome is back.
- Only projects change the address (`/projects/<name>/`). Back works the same from every screen; see **Back** below.

### Enlarged image

- The same view serves Photos and images in articles.

- In Photos, pressing the center enlarges the current photo over a dimmed page (scales up from 0.35, 380ms). The next input of any kind closes it, as does clicking the dimmed page.
- The panel takes the photo's own aspect ratio (up to 92% of the width and 84% of the height), so the whole photo always shows.
- It opens at once on the cover flow's thumbnail, which is already loaded and the same shape, and the full photo fades in over it once decoded. Each photo gets its own image elements, so a previously enlarged photo can never show in place of the new one.
- There is no hold-to-peek anywhere (removed 2026-10-06).
- The browser's back button or Android's back gesture closes an enlarged image, and nothing else.

### Photos (cover flow)

Spinning moves the existing covers to their new positions (500ms ease-out-expo): the center cover swings flat and forward, neighbors rotate 64 degrees and dim. Nothing is re-rendered, so every step animates. The caption shows the title and "3 of 8". Covers can also be tapped (a side cover comes to the middle, the middle one enlarges) and swiped (more than 30px sideways steps once). Taps act on click, not on release, so the click can't land on the backdrop of the photo it opens.

### Back

Every step deeper on the device (a screen, a reading page, an enlarged image) gets a history entry recording its depth, so **the browser's back button and Android's back gesture undo exactly one step**, the same as MENU, `Esc`, `‹ Menu` in the status bar and the reading bar's back button. Those also go back through history, so the two can never disagree; one handler does the undoing. From the main menu, back leaves the site. The name unwinds every step at once. A page opened straight into a project is set up as Menu, then Projects, then the project, so back walks out the same way. Each entry also records how to redo its step (the row it was opened from, the article, the image, or Now Playing), so the forward button redoes it, one step at a time.

### Name button

Clicking the name top-left returns to the main menu from anywhere (closing the reading page first, closing an enlarged photo, unlocking if locked).

### Guide

Shown via `?` only. Leaders are SVG lines from a dot on each control: straight out to just past the device's edge (angled when the label is shifted up or down to keep the right-hand labels apart), then level into the label. They draw in from the dot with a 70ms stagger. Labels have no trailing periods; a second line is a separate line, on the sheet too. The next interaction of any kind fades it out. Desktop and phones say the same words (phones as a sheet):

| Control | Says                                               |
| ------- | -------------------------------------------------- |
| Screen  | It's a touch screen / Tap to open, swipe to scroll |
| MENU    | Go back                                            |
| Spin    | Drag around the wheel to scroll                     |
| ◀◀ ▶▶   | Previous and next / Skips tracks while music plays |
| Center  | Open what's selected                               |
| Play    | Play or pause music                                |

While the guide is open, a spin demo runs on the wheel: a fingertip dot in the selection color sweeps clockwise from -45° to 60° around the middle of the ring, trailing a soft arc, then fades and repeats (1.8s loop). On phones the sheet is a raised panel in the page's own tone (light on light themes, dark on dark ones) over the top of the screen (72px from the top), so the wheel and its demo stay in view; it fades and drops in (opacity 250ms, 8px translate and 0.98 scale over 350ms) and out the same way.

### Theme change

Picking a swatch (or Settings → Color) re-themes the page in about 900ms: background, ink, accent, device materials and on-screen selection. The choice persists. Picking a swatch also shows the finish's name under the row for 1.5s (fade, 300ms); hovering one with a mouse shows its name while hovered.

### Locked finishes

The secret finishes sit at the end of the color chips from the start, as empty dashed chips with a small lock (Lucide `lock`), so visitors can see there's more to earn. Hovering one shows how to earn it as a tooltip; tapping or clicking one shows the same line in a dark pill (like the "Copied" toast) 10px above the chips for 2.6s ("Clear every brick in Brick to unlock", "Stack 30 high in Stack to unlock"). Once earned, the chip becomes the finish's real swatch.

### Stack

Center-only, so it works the same on a phone and a laptop; tapping the screen also drops. Before the first drop the screen says how to play: "Land each block on the tower. Anything hanging over gets cut off." and "press the center or tap to drop". A block slides across the top of the tower, bouncing between the screen's edges, starting from alternate sides and a little faster each time (3.6 board px per step, +0.18 per block, up to 9). Each press drops it: whatever hangs over the block below is cut off and falls away, fading, so blocks get narrower. A drop within 6 board px of the block below snaps into place, keeps its width and flashes a ring (with a heavier click). Missing the tower, or a drop that would leave less than 18 board px (9 on screen), ends the game: the whole block falls. Reaching 30 high unlocks the secret Red finish the first time (no toast: the game carries on, the Red chip pops in under the device, and the end card shows it). The Extras preview says "Build a tower as tall as you can." (Brick's says "Break every brick on the board."); the locked chips explain the rewards, so the taglines don't. Height top-left, best top-right (saved as `pocket-stackBest`), the same header as Brick. The view scrolls up once the tower passes the upper part of the screen. End card (see below): "Toppled" or "New best", the height, "best N" unless it is one; presses in the first 700ms after toppling are ignored so a flurry can't skip the card. The wheel does nothing here.

### Brick

Spinning moves the paddle continuously (4.2 canvas px per degree, eased toward the target each frame), not in fixed steps; arrow keys and mouse-wheel notches move it 46px. Center launches the ball. Three balls (dots top-left), score top-right out of 40. Bricks are drawn in the theme's selection color, fading by row; a hit brick pops and fades over 220ms. Modes: ready (ball on the paddle, "press the center to launch"; before the first launch of a game, "Spin the wheel to steer the paddle." above it), play, over, won. Losing a ball returns it to the paddle. Losing all three, or clearing the board, covers the board with the end card ("Game over" or "Cleared", the bricks cleared out of 40). The first press resets to a fresh ready board; the next press launches.

### Secret finish unlock

Clearing all 40 bricks saves the unlock, adds a fifth swatch (Clear: a see-through shell with the dark screen), and the new chip pops in under the device (it scales up from nothing past full size, and a ring spreads from it, about 1.1s). There is no toast; the end card shows the unlock. Clearing Brick again shows the end card with no new reward.

### End cards

Brick and Stack share one end card (`engine/endcard.ts`), drawn over the board, which fades out over 260ms: a small title ("Game over", "Cleared", "Toppled", "New best") at 60% ink, the result as a big 132px number in the selection color, what it counts under it ("of 40 bricks", "blocks high"), then either a pill with the finish's chip and "Clear finish unlocked" / "Red finish unlocked" (the first time only) or a quiet mono line ("best 22"), and "press the center to play again" at the foot. Each part rises 10px and fades in on its own beat (0, 60, 140, 220ms; 320ms each, ease-out). Reduced motion shows it at once.

## 5. Audio

- Nothing plays and no audio context is created until the first touch of the device (browser autoplay rules).
- **Clicker:** a 4ms white-noise burst through a 2.4kHz high-pass filter. Volume scales by action (1 for steps, 2 for selects). Toggle in Settings.
- **Music:** the playlist is three recorded tracks, played from audio files through the same output and visualizer. Music continues while browsing; the status bar shows ▶ or ❚❚. When a track ends, the next one starts.
- **Volume:** spinning on Now Playing shows a volume bar for about 1.1 seconds.

## 6. Contact actions

- **Copy email** (device): copies the address and confirms on the device screen only. (The page link confirms on the page only.)
- **Contact** (page link): copies the email with the page badge. No `mailto:`.
- **Résumé** (page link and device): opens `assets/resume.pdf` in a new tab.
- **LinkedIn / GitHub:** open in a new tab.

## 7. Persistence

Stored in `localStorage` with the `pocket-` prefix; every read and write is wrapped so the site works when storage is blocked.

| Key                | Meaning                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `pocket-stackBest` | Stack's best height                                                     |
| `pocket-color`     | Selected device color id                                                |
| `pocket-secret`    | Whether Clear is unlocked (the old `pocket-clear` key is still honored) |
| `pocket-red`       | Whether Red is unlocked (stacked 30 high)                               |

## 8. Mobile

- The device scales to fit: `min(1, (vw - 24) / 380, (vh - 210) / 604)`.
- Touch drag on the wheel works like a pointer drag; vibration fires on supported phones (Android Chrome; iOS Safari has no vibration API).
- Reading is a full-window page on phones too, so articles get the whole screen.
- Articles use narrow reading sizes on phones (15.5px body, 30px titles).
- The guide callouts don't fit beside the device under 820px; `?` shows the same labels as a sheet at the bottom instead (tap it or touch the device to dismiss).

## 9. Accessibility

- Full keyboard control (see Controls). Visible focus rings in the theme accent.
- The center button has an accessible label ("Select"). Swatches are a labeled radio group.
- A screen-reader-only "Text version of this site" button opens a plain dialog with all content.
- `prefers-reduced-motion`: transitions and animations collapse to near-instant; the entrance is skipped.
- Target WCAG 2.2 AA contrast for page text in every theme.

## 10. Dev and test hooks (prototype only)

URL parameters in the prototype, for screenshots and testing:

| Param                        | Effect                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `?color=graphite`            | Start with a device color                                                             |
| `?go=s,s,1,p`                | Unlock, then a sequence: `s` select, `p` enlarge the photo (in Photos), `1`/`-1` step |
| `?notrans=1`                 | Disable all transitions (headless screenshots stall on transitions)                   |
| `?guide=1`                   | Show the guide pinned                                                                 |
| `?dark=1`                    | Dark screen                                                                           |
| `?brick=over` / `?brick=won` | Show Brick's end card (use with a `go` sequence that opens Brick)                     |
| `?unlock=1`                  | Unlock the secret finish (preview with `&color=clear`)                                |

These only run in development (`npm run dev`); production builds don't include them. `?scroll=1200` also scrolls an open article.
