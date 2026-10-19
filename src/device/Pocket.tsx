import { useLayoutEffect, useState } from 'react';
import * as actions from './actions';
import { Device } from './components/Device';
import { Legend } from './components/Guide';
import { Corner, EnlargedPhoto, Links, Name, Veil } from './components/Page';
import { Reader } from './components/Reader';
import { runDevHooks } from './devHooks';
import { attachGlobalInput } from './engine/input';
import { playIntro, skipIntro } from './engine/intro';
import { fitDevice } from './engine/fit';
import { projectsMenu, rootMenu } from './menu';
import { reducedMotion } from './refs';
import { getState, newFrame, setState } from './store';
import type { DeviceContent } from './types';

interface Props {
  content: DeviceContent;
  /** Set on /projects/<slug>: the device opens straight into that case study. */
  initialProject?: string;
  /** On Simple view: no device, just the reading page, which its project rows open in place. */
  simple?: boolean;
}

/** The whole interactive site: the device and the page around it. */
export default function Pocket({ content, initialProject, simple }: Props) {
  // a case study opened from Simple view opens at once, without the device (read before the
  // address is rewritten below)
  const [fromSimple] = useState(
    () => !!initialProject && new URLSearchParams(location.search).get('from') === 'simple',
  );
  // build the menu before the first render
  useState(() => {
    actions.setContent(content);
    const root = newFrame(rootMenu(content));
    const index = content.projects.findIndex((p) => p.slug === initialProject);
    if (index < 0) setState(simple ? { stack: [root], locked: false } : { stack: [root] });
    else {
      // a project link skips the lock screen and waits on the Projects list
      root.hidden = true;
      setState({ stack: [root, newFrame(projectsMenu(content), index)], locked: false });
      actions.startAtProject();
    }
  });

  // a layout effect runs before the first paint, so the device is fitted and the entrance has
  // started by the first frame (a plain effect painted the finished page for a frame first)
  useLayoutEffect(() => {
    if (simple) return attachSimplePage(content);

    const project = content.projects.find((p) => p.slug === initialProject);
    // from Simple view: only the reading page, in Simple view's Silver (the saved color isn't
    // applied, see Base.astro), already open on the first frame
    if (project && fromSimple) {
      const detach = attachGlobalInput(skipIntro);
      actions.openFromSimple(actions.projectDoc(project.slug, project.title));
      return detach;
    }

    actions.setColor(getState().color);
    fitDevice();
    const tick = setInterval(() => setState({ now: new Date() }), 15000);
    actions.scheduleHint();
    const detach = attachGlobalInput(skipIntro);
    addEventListener('pointerdown', skipIntro, { once: true });

    const skipEntrance = import.meta.env.DEV && runDevHooks();
    if (!skipEntrance) playIntro();

    if (project) {
      // open once the device has arrived and its screen is on
      setTimeout(
        () => actions.openDoc(actions.projectDoc(project.slug, project.title)),
        reducedMotion() ? 100 : 1300,
      );
    }

    return () => {
      clearInterval(tick);
      detach();
    };
  }, []);

  // from Simple view the device is never drawn: just the case study (and its enlarged images)
  if (fromSimple || simple)
    return (
      <>
        <Veil />
        <Reader />
        <EnlargedPhoto />
      </>
    );
  return (
    <>
      <Name />
      <Links />
      <Veil />
      <Device />
      <Reader />
      <Legend />
      <EnlargedPhoto />
      <Corner />
    </>
  );
}

/**
 * Simple view: its project rows ask for a case study with a `simple:open` event; it opens in
 * place. Back (the bar's button, Esc, the browser's) closes it into the row again.
 */
function attachSimplePage(content: DeviceContent): () => void {
  actions.setSimplePage(document.title);
  const onOpen = (e: Event) => {
    const { slug, row } = (e as CustomEvent<{ slug: string; row: HTMLElement }>).detail;
    const project = content.projects.find((p) => p.slug === slug);
    if (project) actions.openInSimple(actions.projectDoc(project.slug, project.title), row);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && getState().zoomed) actions.pop();
  };
  const onPopState = (e: PopStateEvent) => actions.onHistory(e.state);
  addEventListener('simple:open', onOpen);
  addEventListener('keydown', onKey);
  addEventListener('popstate', onPopState);
  document.documentElement.dataset.reader = 'ready';
  return () => {
    removeEventListener('simple:open', onOpen);
    removeEventListener('keydown', onKey);
    removeEventListener('popstate', onPopState);
  };
}
