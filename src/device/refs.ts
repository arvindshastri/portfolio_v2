/**
 * DOM nodes the imperative parts of the device need (zoom framing, the wheel, the guide,
 * the entrance). Components register them with `bind`; engine code reads them from `refs`.
 */
export type RefName =
  | 'zoomer'
  | 'fit'
  | 'perspective'
  | 'floor'
  | 'dev'
  | 'lcd'
  | 'lcdin'
  | 'power'
  | 'lock'
  | 'wheel'
  | 'center'
  | 'name'
  | 'links'
  | 'corner'
  | 'swatches'
  | 'reader';

export const refs: Partial<Record<RefName, HTMLElement | null>> = {};

export const bind =
  (name: RefName) =>
  (el: HTMLElement | null): void => {
    refs[name] = el;
  };

/** Screen elements by frame id, for slides and for finding the article being read. */
export const frameEls = new Map<number, HTMLElement>();

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
