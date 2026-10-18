export const SITE = {
  name: 'Arvind Shastri',
  /**
   * The line under the name cycles through these once, then rests on the first; tapping it moves
   * on. Keep each short (one line of mono on a phone).
   */
  lines: [
    'designer + engineer',
    'open to full-time roles',
    "swe @ mcmaster '25",
    'co-founder @ trac',
    'nice to meet you!',
  ],
  /** Arvind's message on the lock screen: two lines at most. */
  intro: 'Hey! I love designing and building products people enjoy. Seeking full-time roles!',
  /** What Google shows under the name, and link previews show under the title. */
  description:
    'Product focused software engineer and designer obsessed with creating things that people can tangibly experience and enjoy.',
  /** The link-preview image for pages without their own (made from the site itself). */
  image: '/og.png',
  imageAlt:
    'Arvind Shastri, designer + engineer, beside the click-wheel device the portfolio lives in',
  email: 'arvind.shastri@outlook.com',
  linkedin: 'https://linkedin.com/in/arvind-shastri',
  github: 'https://github.com/arvindshastri',
  resume: '/resume.pdf',
} as const;
