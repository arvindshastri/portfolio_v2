# Roadmap

From the current prototype (`prototype/index.html`) to a launched site. Order is a recommendation; adjust as decisions come in.

## Phase 1: Finish the design in the prototype

- [ ] Give About and Experience the same editorial treatment as Trac Commuter.
- [x] Case studies for all four projects drafted from the old portfolio. Arvind to review.
- [ ] Optional: real, rights-cleared tracks alongside the generated lo-fi songs.
- [ ] Redesign each menu preview to Arvind's spec (he will provide it).
- [ ] Music: decide on iPod-style extras (a "Now Playing" row on the main menu while music plays; center cycles scrubber).
- [ ] Tune the docked dial's scroll speed and momentum after hands-on testing (now 6px/degree, momentum x0.93/frame).
- [x] Phone reading: under 640px wide, the zoomed screen stretches down into the device body to fill the space above the dial (2026-10-03).
- [ ] A second game for Extras, playable with only wheel + center (ideas to brainstorm first).
- [ ] Confirm Sky as the third color.
- [ ] Fill every placeholder in [CONTENT.md §7](CONTENT.md#7-open-placeholders-must-be-replaced-before-launch).

## Phase 2: Production build (done, 2026-10-02)

Built with Astro + React + TypeScript (see the README for the stack and layout). The prototype stays in `prototype/` as the design reference.

- [x] Port the prototype: content in `src/content` and `src/data`, the device in `src/device`.
- [x] OKLCH theme tokens as CSS custom properties, set from `src/data/themes.ts` (and applied before first paint for returning visitors).
- [x] Self-hosted fonts (Fontsource).
- [x] Images resized and converted to WebP at build time; cover flow uses generated thumbnails.
- [x] Prototype test hooks only run in development (`import.meta.env.DEV`).
- [x] A text version of the site as real HTML (including the full case study on project pages).
- [x] Meta tags, link previews (project pages use their cover) and a favicon.
- [x] Each case study has its own URL (`/projects/<name>/`); the address bar and back button follow the device.
- [ ] A link-preview image for the home page (a render of the device).

## Phase 3: Quality

- [ ] Keyboard-only walkthrough of every screen.
- [ ] Screen reader pass (VoiceOver and NVDA) on the text version and the device's labels.
- [ ] Contrast check in all five themes (page text, white on `sel`, kicker on dark screens).
- [ ] Reduced-motion pass.
- [ ] Real-device testing: iPhone Safari, Android Chrome, small laptops, large monitors.
- [ ] Performance: Lighthouse LCP under 2.5s, no layout shift during the entrance, 60fps wheel and zoom on a mid-range phone.
- [ ] Automated smoke tests (Playwright): unlock, open a case study, zoom out, change color, peek a photo, copy email.

## Phase 4: Launch

- [ ] Deploy to Netlify on arvindshastri.com (Arvind is handling this; `netlify.toml` is set up).
- [ ] Privacy-friendly analytics, if wanted (Plausible or similar), to see which projects get opened.
- [ ] Update the résumé, LinkedIn and GitHub to link to the new site.

## Later ideas (parked, not committed)

- The back of the device: flip it to see an engraved back with name and "model number". Parked because of the effort.
- More Extras games.
- Deep links per photo or per track.
