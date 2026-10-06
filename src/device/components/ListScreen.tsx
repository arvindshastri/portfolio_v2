import { AudioLines, ChevronRight, ExternalLink } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import * as actions from '../actions';
import { useDevice } from '../store';
import type { Frame, Item, ScreenNode } from '../types';
import { Preview } from './Preview';

type ListNode = Extract<ScreenNode, { type: 'list' }>;

/** A menu: rows on the left with one sliding highlight, a preview of the highlighted row on the right. */
export function ListScreen({ frame, node }: { frame: Frame; node: ListNode }) {
  // rows show live values (settings, the playing track), so re-render when those change
  useDevice((s) => [s.color, s.dark, s.clicker, s.music.on, s.music.track].join());
  const listRef = useRef<HTMLDivElement>(null);
  const hasPreview = node.items.some((i) => i.preview);
  const current = node.items[frame.sel]!;
  const spec = typeof current.preview === 'function' ? current.preview() : current.preview;

  // long names scroll on the highlighted row (once each way), like the real thing
  useLayoutEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>('.it.on');
    if (!row) return;
    const text = row.querySelector('span')!;
    const overflow = text.scrollWidth - text.clientWidth;
    row.classList.toggle('long', overflow > 2);
    if (overflow > 2) {
      const em = row.querySelector('em')!;
      em.style.setProperty('--mq', `${-(overflow + 2)}px`);
      em.style.setProperty('--mqt', `${Math.max(1.6, overflow / 28)}s`);
    }
  }, [frame.sel, node]);

  return (
    <>
      <div ref={listRef} className={`list${hasPreview ? '' : ' full'}`}>
        <div className="hl" style={{ '--i': frame.sel } as React.CSSProperties} />
        {node.items.map((item, i) => (
          <Row key={item.label} item={item} on={i === frame.sel} index={i} />
        ))}
      </div>
      {hasPreview && <div className="prev">{spec && <Preview spec={spec} />}</div>}
    </>
  );
}

function Row({ item, on, index }: { item: Item; on: boolean; index: number }) {
  const classes = ['it', on && 'on', item.leaf && 'leaf'];
  // rows that open a screen get the chevron; leaves get their mark, or show their value instead
  const mark = item.leaf ? item.mark : 'chevron';
  const Mark = mark === 'link' ? ExternalLink : mark === 'chevron' ? ChevronRight : null;
  return (
    <div
      className={classes.filter(Boolean).join(' ')}
      data-v={item.value?.() ?? ''}
      onClick={() => actions.tapRow(index)}
    >
      <span>
        <em>{item.label}</em>
      </span>
      {item.now?.() && <AudioLines className="playing" aria-label="playing" />}
      {Mark && <Mark className={`mk ${mark}`} aria-hidden />}
    </div>
  );
}
