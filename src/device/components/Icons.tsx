import {
  BriefcaseBusiness,
  FileText,
  Gamepad2,
  Image,
  Layers,
  Mail,
  Music,
  SlidersHorizontal,
  User,
  type LucideProps,
} from 'lucide-react';
import { Play } from 'lucide-react';
import type { ComponentType } from 'react';
import type { IconName } from '../types';

/*
 * Lucide 1.x dropped brand icons, so LinkedIn and GitHub use the paths from Lucide's last
 * release that had them (lucide-static 0.468, ISC license), drawn the same way as the rest.
 */
const brand =
  (paths: React.ReactNode) =>
  ({ size = 24, strokeWidth = 2, ...rest }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths}
    </svg>
  );

const Linkedin = brand(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>,
);

const Github = brand(
  <>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </>,
);

/*
 * Transport marks (play, pause, skip) are Lucide icons, filled and sized in em so they follow
 * the font size around them. They used to be text (▶ ❚❚ ◀◀), which Geist doesn't have, so every
 * phone drew them from a different fallback font: a heavy, oversized pause on some, an emoji
 * play button on others.
 */
export const mark: LucideProps = {
  size: '1em',
  fill: 'currentColor',
  strokeWidth: 1.5,
  'aria-hidden': true,
};

/** ◀◀ or ▶▶: two of the play triangle nested together, so every transport mark is one shape. */
export function Skip({ back = false }: { back?: boolean }) {
  return (
    <span className={`skip${back ? ' back' : ''}`}>
      <Play {...mark} />
      <Play {...mark} />
    </span>
  );
}

export const ICONS: Record<IconName, ComponentType<LucideProps>> = {
  projects: Layers,
  experience: BriefcaseBusiness,
  about: User,
  photos: Image,
  music: Music,
  extras: Gamepad2,
  settings: SlidersHorizontal,
  mail: Mail,
  linkedin: Linkedin,
  github: Github,
  resume: FileText,
};
