import { useLayoutEffect, useState } from 'react';
import * as actions from './actions';
import { Device } from './components/Device';
import { Legend } from './components/Guide';
import { Corner, EnlargedPhoto, Hint, Links, Name, Veil } from './components/Page';
import { Reader } from './components/Reader';
import { runDevHooks } from './devHooks';
import { attachGlobalInput } from './engine/input';
import { playIntro, skipIntro } from './engine/intro';
import { fitDevice } from './engine/fit';
import { projectsMenu, rootMenu } from './menu';
import { reducedMotion } from './refs';
import { load, save } from './storage';
import { getState, newFrame, setState } from './store';
import type { DeviceContent } from './types';

interface Props {
  content: DeviceContent;
  /** Set on /projects/<slug>: the device opens straight into that case study. */
  initialProject?: string;
}

/** The whole interactive site: the device and the page around it. */
export default function Pocket({ content, initialProject }: Props) {
  // build the menu before the first render
  useState(() => {
    actions.setContent(content);
    const root = newFrame(rootMenu(content));
    const index = content.projects.findIndex((p) => p.slug === initialProject);
    if (index < 0) setState({ stack: [root] });
    else {
      // a project link skips the lock screen and waits on the Projects list
      root.hidden = true;
      setState({ stack: [root, newFrame(projectsMenu(content), index)], locked: false });
    }
  });

  // a layout effect runs before the first paint, so the device is fitted and the entrance has
  // started by the first frame (a plain effect painted the finished page for a frame first)
  useLayoutEffect(() => {
    actions.setColor(getState().color);
    fitDevice();
    const tick = setInterval(() => setState({ now: new Date() }), 15000);
    actions.scheduleHint();
    const detach = attachGlobalInput(skipIntro);
    addEventListener('pointerdown', skipIntro, { once: true });

    const skipEntrance = import.meta.env.DEV && runDevHooks();
    if (!skipEntrance) playIntro();

    const project = content.projects.find((p) => p.slug === initialProject);
    if (project) {
      // open once the device has arrived and its screen is on
      setTimeout(
        () => actions.openDoc(actions.projectDoc(project.slug, project.title)),
        reducedMotion() ? 100 : 1300,
      );
    } else if (!skipEntrance && !load('seenGuide', false)) {
      setTimeout(() => {
        actions.showGuide(true);
        save('seenGuide', true);
      }, 1500);
    }

    return () => {
      clearInterval(tick);
      detach();
    };
  }, []);

  return (
    <>
      <Name />
      <Links />
      <Veil />
      <Device />
      <Reader />
      <Legend />
      <EnlargedPhoto />
      <Hint />
      <Corner />
    </>
  );
}
