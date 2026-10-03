import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Case studies. Each file is one project, and gets its own URL at /projects/<file name>. */
const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number(),
      /** Small mono line above the title, e.g. "Case study · 2025". */
      kicker: z.string(),
      /** Shown on the menu preview, e.g. "2025 · iOS and Android". */
      tagline: z.string(),
      /** One line for the menu preview. */
      pitch: z.string(),
      lead: z.string(),
      cover: image(),
      coverAlt: z.string(),
      /** The facts row under the intro (Role, Platform, Tools, ...). */
      facts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    }),
});

/** Roles on the Experience screen, newest first by `order`. */
const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    /** Short years for the menu, e.g. "2025 - now". */
    years: z.string(),
    order: z.number(),
    summary: z.string(),
  }),
});

/** Single pages that open from the main menu (currently About). */
const pages = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kicker: z.string(),
      lead: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

export const collections = { projects, experience, pages };
