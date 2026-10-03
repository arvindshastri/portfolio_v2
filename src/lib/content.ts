import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import { LOCK_WALLPAPER, PHOTOS } from '@/data/photos';
import { TRACKS } from '@/data/tracks';
import type { DeviceContent } from '@/device/types';

export const getProjects = async () =>
  (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

export const getJobs = async () =>
  (await getCollection('experience')).sort((a, b) => a.data.order - b.data.order);

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
    })),
    photos: await Promise.all(
      PHOTOS.map(async (p) => ({
        thumb: await url(p.image, 400),
        full: await url(p.image, 2000),
        caption: p.caption,
      })),
    ),
    trackArt,
    lockWallpaper: await url(LOCK_WALLPAPER, 800),
  };
}
