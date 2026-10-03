import { SITE } from '@/data/site';
import { TRACKS } from '@/data/tracks';
import { themeById } from '@/data/themes';
import * as actions from './actions';
import * as music from './engine/music';
import { getState, setState } from './store';
import type { DeviceContent, Item, ScreenNode } from './types';

const openTab = (url: string) => window.open(url, '_blank', 'noopener');

/** The main menu, and everything under it. */
export function rootMenu(c: DeviceContent): ScreenNode {
  return {
    type: 'list',
    title: 'Menu',
    items: [
      {
        label: 'Projects',
        preview: { kind: 'icon', icon: 'projects' },
        go: () => projectsMenu(c),
      },
      {
        label: 'Experience',
        preview: { kind: 'icon', icon: 'experience' },
        go: () => ({
          type: 'list',
          title: 'Experience',
          items: c.jobs.map((job) => ({
            label: job.company,
            preview: { kind: 'job', job },
            doc: { key: `job:${job.slug}`, title: job.company },
          })),
        }),
      },
      {
        label: 'About',
        preview: { kind: 'icon', icon: 'about' },
        doc: { key: 'page:about', title: 'About' },
      },
      {
        label: 'Photos',
        preview: { kind: 'icon', icon: 'photos' },
        go: () => ({ type: 'cf', title: 'Photos' }),
      },
      { label: 'Music', preview: { kind: 'icon', icon: 'music' }, go: musicMenu },
      {
        label: 'Extras',
        preview: { kind: 'icon', icon: 'extras' },
        go: () => ({
          type: 'list',
          title: 'Extras',
          items: [
            {
              label: 'Brick',
              preview: {
                kind: 'brick',
                kicker: 'Spin to steer',
                sub: 'Clear every brick for a surprise.',
              },
              go: () => ({ type: 'brick', title: 'Brick' }),
            },
          ],
        }),
      },
      { label: 'Settings', preview: { kind: 'icon', icon: 'settings' }, go: settingsMenu },
      { label: 'Contact', preview: { kind: 'icon', icon: 'mail' }, go: contactMenu },
    ],
  };
}

export function projectsMenu(c: DeviceContent): ScreenNode {
  return {
    type: 'list',
    title: 'Projects',
    items: c.projects.map((project) => ({
      label: project.title,
      preview: { kind: 'project', project },
      doc: actions.projectDoc(project.slug, project.title),
    })),
  };
}

function musicMenu(): ScreenNode {
  return {
    type: 'list',
    title: 'Music',
    items: TRACKS.map((track, i): Item => ({
      label: track.name,
      preview: { kind: 'album', track: i },
      now: () => getState().music.on && getState().music.track === i,
      act: () => {
        music.play(i);
        actions.push({ type: 'np', title: 'Now Playing' });
      },
    })),
  };
}

function settingsMenu(): ScreenNode {
  return {
    type: 'list',
    title: 'Settings',
    items: [
      {
        label: 'Color',
        leaf: true,
        value: () => themeById(getState().color).name,
        act: actions.nextColor,
      },
      {
        label: 'Screen',
        leaf: true,
        value: () => (getState().dark ? 'Dark' : 'Light'),
        act: () => actions.setDark(!getState().dark),
      },
      {
        label: 'Clicker',
        leaf: true,
        value: () => (getState().clicker ? 'On' : 'Off'),
        act: () => setState((s) => ({ clicker: !s.clicker })),
      },
      { label: 'Show controls', leaf: true, value: () => '', act: () => actions.showGuide(true) },
    ],
  };
}

function contactMenu(): ScreenNode {
  return {
    type: 'list',
    title: 'Contact',
    items: [
      {
        label: 'Email',
        leaf: true,
        value: () => '',
        preview: { kind: 'icon', icon: 'mail', title: 'Copy email', sub: SITE.email },
        act: () => actions.copyEmail(true),
      },
      {
        label: 'LinkedIn',
        leaf: true,
        mark: true,
        value: () => '↗',
        preview: { kind: 'icon', icon: 'linkedin', title: 'Open LinkedIn', sub: '/in/arvind-shastri' },
        act: () => openTab(SITE.linkedin),
      },
      {
        label: 'GitHub',
        leaf: true,
        mark: true,
        value: () => '↗',
        preview: { kind: 'icon', icon: 'github', title: 'Open GitHub', sub: '/arvindshastri' },
        act: () => openTab(SITE.github),
      },
      {
        label: 'Résumé',
        leaf: true,
        mark: true,
        value: () => '↓',
        preview: { kind: 'icon', icon: 'resume', title: 'View Résumé', sub: 'As PDF' },
        act: () => openTab(SITE.resume),
      },
    ],
  };
}
