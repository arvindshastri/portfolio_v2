import { TRACKS } from '@/data/tracks';
import { getContent } from '../actions';
import type { PreviewSpec } from '../types';
import { ICONS } from './Icons';

/** The right-hand side of a list screen: a preview of the highlighted row. */
export function Preview({ spec }: { spec: PreviewSpec }) {
  switch (spec.kind) {
    case 'icon': {
      const Icon = ICONS[spec.icon];
      const icon = <Icon aria-hidden="true" />;
      return (
        <div className={`pv pv-icon${spec.title ? '' : ' solo'}`}>
          <div className="ic">
            <div className="spot" />
            <div className="icw">
              {icon}
              <div className="rf">{icon}</div>
            </div>
          </div>
          {spec.title && <PreviewText title={spec.title} sub={spec.sub} />}
        </div>
      );
    }
    case 'project':
      return (
        <div className="pv pv-proj">
          <img src={spec.project.cover} alt="" />
          <PreviewText
            kicker={spec.project.tagline}
            title={spec.project.title}
            sub={spec.project.pitch}
          />
        </div>
      );
    case 'job':
      return (
        <div className="pv pv-job">
          <PreviewText kicker={spec.job.years} title={spec.job.role} sub={spec.job.summary} />
        </div>
      );
    case 'album': {
      const track = TRACKS[spec.track]!;
      return (
        <div className="pv pv-album">
          <div className="art">
            <AlbumArt track={spec.track} />
          </div>
          <PreviewText title={track.name} sub={track.artist ?? 'Arvind Shastri'} />
        </div>
      );
    }
    case 'brick':
      return (
        <div className="pv pv-brick">
          <div className="field">
            {[1, 0.8, 0.62, 0.46].map((opacity) => (
              <div className="row" style={{ opacity }} key={opacity}>
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            ))}
            <span className="ball" />
            <span className="pad" />
          </div>
          <PreviewText title="Brick" sub={spec.sub} />
        </div>
      );
    case 'stack':
      return (
        <div className="pv pv-stack">
          <div className="field">
            <span className="slide" />
            {[
              [30, 34, 0.6],
              [26, 40, 0.75],
              [22, 50, 0.9],
              [20, 60, 1],
            ].map(([left, width, opacity]) => (
              <i key={left} style={{ marginLeft: `${left}%`, width: `${width}%`, opacity }} />
            ))}
            <i className="base" />
          </div>
          <PreviewText title="Stack" sub={spec.sub} />
        </div>
      );
  }
}

function PreviewText({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="pv-tx">
      {kicker && <small>{kicker}</small>}
      <b>{title}</b>
      {sub && <span>{sub}</span>}
    </div>
  );
}

/** A track's cover: a photo, or a colored block with its title. */
export function AlbumArt({ track }: { track: number }) {
  const art = TRACKS[track]!.art;
  if ('photo' in art) return <img src={getContent().trackArt[art.photo]} alt="" />;
  return (
    <div
      className="blk"
      style={{ background: art.gradient }}
      dangerouslySetInnerHTML={{ __html: art.label }}
    />
  );
}
