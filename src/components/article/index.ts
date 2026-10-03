import Card from './Card.astro';
import Duo from './Duo.astro';
import Figure from './Figure.astro';
import Gallery from './Gallery.astro';
import LazyFigure from './LazyFigure.astro';
import Note from './Note.astro';
import Philosophy from './Philosophy.astro';
import PrototypeLink from './PrototypeLink.astro';
import PrototypeLinkText from './PrototypeLinkText.astro';
import PullQuote from './PullQuote.astro';
import Split from './Split.astro';
import Stats from './Stats.astro';
import Tags from './Tags.astro';

/** Components available in every case study without importing them. */
export const articleComponents = {
  Card,
  Duo,
  Figure,
  Gallery,
  Note,
  Philosophy,
  PrototypeLink,
  PullQuote,
  Split,
  Stats,
  Tags,
};

/** The same, for the text version (a closed dialog): images wait until shown, prototypes are links. */
export const textComponents = {
  ...articleComponents,
  Figure: LazyFigure,
  PrototypeLink: PrototypeLinkText,
};
