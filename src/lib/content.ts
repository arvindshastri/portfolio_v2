import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import { PHOTOS } from '@/data/photos';
import { TRACKS } from '@/data/tracks';
import type { DeviceContent } from '@/device/types';

export const getProjects = async () =>
  (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

export const getJobs = async () =>
  (await getCollection('experience')).sort((a, b) => a.data.order - b.data.order);

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "May 2023" as a fractional year: the start of the month, or its end with `end`. */
function monthYear(text: string, end = false): number {
  const m = text.trim().match(/^([a-z]+)\s+(\d{4})$/i);
  const month = m ? MONTHS.indexOf(m[1]!.slice(0, 3).toLowerCase()) : -1;
  if (!m || month < 0) throw new Error(`Can't read the date "${text}" in a role's period`);
  return Number(m[2]) + (month + (end ? 1 : 0)) / 12;
}

/** A role's `period` ("May 2023 to August 2024", "June 2025 to present") as fractional years. */
export function span(period: string): { from: number; to: number | null } {
  const [start, finish] = period.split(/\s+to\s+/i);
  if (!start || !finish) throw new Error(`Can't read the role period "${period}"`);
  return {
    from: monthYear(start),
    to: /present|now/i.test(finish) ? null : monthYear(finish, true),
  };
}

const url = async (src: ImageMetadata, width: number) =>
  (await getImage({ src, width, format: 'webp' })).src;

/** Everything the device needs, with images resized for where they're shown. */
export async function getDeviceContent(): Promise<DeviceContent> {
  const [projects, jobs] = await Promise.all([getProjects(), getJobs()]);

  const photoIds = new Set(TRACKS.flatMap((t) => ('photo' in t.art ? [t.art.photo] : [])));
  const trackArt: Record<string, string> = {};
  for (const p of PHOTOS) if (photoIds.has(p.id)) trackArt[p.id] = await url(p.image, 400);

  return {
    projects: await Promise.all(
      projects.map(async (p) => ({
        slug: p.id,
        title: p.data.title,
        tagline: p.data.tagline,
        pitch: p.data.pitch,
        cover: await url(p.data.cover, 700),
      })),
    ),
    jobs: jobs.map((j) => ({
      slug: j.id,
      company: j.data.company,
      years: j.data.years,
      role: j.data.role,
      summary: j.data.summary,
      ...span(j.data.period),
    })),
    photos: await Promise.all(
      PHOTOS.map(async (p) => ({
        thumb: await url(p.image, 400),
        full: await url(p.image, 2000),
        caption: p.caption,
      })),
    ),
    trackArt,
  };
}
