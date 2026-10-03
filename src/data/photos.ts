import type { ImageMetadata } from 'astro';
import spiderverse from '@/assets/photos/spiderverse.jpg';
import nyc from '@/assets/photos/nyc.jpg';
import macWrld from '@/assets/photos/mac_wrld.jpg';
import doctorStrange from '@/assets/photos/doctor_strange.jpg';
import logic from '@/assets/photos/logic.jpg';

/** The Photos screen (cover flow), in order. Add a photo by importing it here. */
export const PHOTOS: { id: string; image: ImageMetadata; caption: string }[] = [
  { id: 'spiderverse', image: spiderverse, caption: 'Spider-Verse' },
  { id: 'nyc', image: nyc, caption: 'New York' },
  { id: 'strange', image: doctorStrange, caption: 'Doctor Strange' },
  { id: 'mac', image: macWrld, caption: 'Mac Miller and Juice WRLD' },
  { id: 'logic', image: logic, caption: 'Logic' },
];
