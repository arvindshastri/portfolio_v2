# Roadmap

From the current prototype (`prototype/index.html`) to a launched site. Order is a recommendation; adjust as decisions come in.

## Phase 1: Finish the design in the prototype

- [ ] Give About and Experience the same editorial treatment as Trac Commuter.
- [ ] Write full case studies for Trac Driver, Orderly and StudyFinder (content from the old portfolio is a starting point).
- [ ] Replace generated music with real, rights-cleared tracks and cover art.
- [ ] Redesign each menu preview to Arvind's spec (he will provide it).
- [ ] Music: decide on iPod-style extras (a "Now Playing" row on the main menu while music plays; center cycles scrubber).
- [ ] Tune the docked dial's scroll speed and momentum after hands-on testing (now 6px/degree, momentum x0.93/frame).
- [ ] Phone reading: the zoomed screen is roughly square, so a tall phone shows only ~330px of article. Decide whether phones get a taller screen when zoomed (needs Arvind's call; close to the rejected Grow mode).
- [ ] A second game for Extras, playable with only wheel + center (ideas to brainstorm first).
- [ ] Confirm Sky as the third color.
- [ ] Fill every placeholder in [CONTENT.md §7](CONTENT.md#7-open-placeholders-must-be-replaced-before-launch).

## Phase 2: Production build

Recommended stack: **Vite + TypeScript, no UI framework.** The site is one interactive object with no routing or data layer, so a framework would add weight without benefit. The prototype is already vanilla JS and ports cleanly.

Suggested structure:

```
src/
  content/        projects.ts, experience.ts, photos.ts, tracks.ts, about.ts  (all copy and data)
  theme/          colors.ts (the COLORS table), tokens.css
  device/         device.ts (stack, screens), wheel.ts, zoom.ts, peek.ts, lock.ts, status.ts
  screens/        list.ts, article.ts, nowPlaying.ts, coverFlow.ts, brick.ts, settings.ts
  audio/          clicker.ts, player.ts (files + generated fallback), visualizer.ts
  page/           entrance.ts, guide.ts, swatches.ts, contact.ts
  styles/         device.css, article.css, page.css
index.html
public/assets/    images, resume.pdf, music/
```

Tasks:
- [ ] Port the prototype into modules; content moves out of code into `content/`.
- [ ] Keep the OKLCH theme tokens as CSS custom properties, generated from `colors.ts`.
- [ ] Self-host fonts (Geist, Geist Mono, Literata) with `font-display: swap`, subset to Latin.
- [ ] Convert images to AVIF/WebP with explicit dimensions; lazy-load anything not on the lock screen.
- [ ] Remove the prototype test hooks (`?go`, `?notrans`, etc.).
- [ ] Render the text version as real HTML in the page (visually hidden), so search engines and screen readers get all the content without JavaScript.
- [ ] Add meta tags, an Open Graph image (a render of the device), and a favicon.
- [ ] Each case study gets a shareable URL (for example `/#trac-commuter` opens the device zoomed into it), so links from a résumé land directly on a project.

## Phase 3: Quality

- [ ] Keyboard-only walkthrough of every screen.
- [ ] Screen reader pass (VoiceOver and NVDA) on the text version and the device's labels.
- [ ] Contrast check in all five themes (page text, white on `sel`, kicker on dark screens).
- [ ] Reduced-motion pass.
- [ ] Real-device testing: iPhone Safari, Android Chrome, small laptops, large monitors.
- [ ] Performance: Lighthouse LCP under 2.5s, no layout shift during the entrance, 60fps wheel and zoom on a mid-range phone.
- [ ] Automated smoke tests (Playwright): unlock, open a case study, zoom out, change color, peek a photo, copy email.

## Phase 4: Launch

- [ ] Domain and hosting (Vercel, Netlify or Cloudflare Pages; all fine for a static site).
- [ ] Privacy-friendly analytics, if wanted (Plausible or similar), to see which projects get opened.
- [ ] Update the résumé, LinkedIn and GitHub to link to the new site.

## Later ideas (parked, not committed)

- The back of the device: flip it to see an engraved back with name and "model number". Parked because of the effort.
- More Extras games.
- Deep links per photo or per track.
