import * as actions from './actions';
import * as brick from './engine/brick';
import * as stack from './engine/stack';
import { readEl } from './engine/reader';
import { getState, setState } from './store';

/**
 * URL parameters for checking states in development (never shipped: only called when
 * import.meta.env.DEV). Returns true when the entrance should be skipped.
 *
 *   ?color=graphite      start with a device color
 *   ?unlock=1            unlock the secret finish (preview it with &color=clear)
 *   ?dark=1              dark screen
 *   ?notrans=1           no transitions or animations (headless screenshots)
 *   ?guide=1             show the controls guide
 *   ?go=s,1,1,p          unlock, then: s select, p enlarge the photo (in Photos), 1 / -1 step, toast (the unlock toast)
 *   ?brick=over|won      show Brick's end card (with a go sequence that opens Brick)
 *   ?scroll=1200         scroll the open article (with a go sequence that opens one)
 *   window.__stack       Stack's live state, for scripted tests
 */
export function runDevHooks(): boolean {
  const q = new URLSearchParams(location.search);
  if (q.get('unlock')) setState({ secret: true });
  if (q.get('color')) actions.setColor(q.get('color')!);
  if (q.get('dark')) actions.setDark(true);
  if (q.get('notrans')) {
    const style = document.createElement('style');
    style.textContent = '*{transition:none!important;animation:none!important}';
    document.head.appendChild(style);
  }
  if (q.get('guide')) actions.showGuide(true);
  const go = q.get('go');
  if (go) {
    actions.unlock();
    for (const a of go.split(',')) {
      if (a === 's') actions.select();
      else if (a === 'p') actions.enlargePhoto(getState().stack.at(-1)!.sel);
      else if (a === 'toast') actions.announceUnlock();
      else actions.step(Number(a) as 1 | -1);
    }
  }
  (window as unknown as { __stack: typeof stack.game }).__stack = stack.game;
  const end = q.get('brick');
  if (end === 'over' || end === 'won') setTimeout(() => brick.showEnd(end), 100);
  const scroll = Number(q.get('scroll'));
  if (scroll) setTimeout(() => readEl()?.scrollTo({ top: scroll, behavior: 'instant' }), 2500);
  return Boolean(go || q.get('notrans'));
}
