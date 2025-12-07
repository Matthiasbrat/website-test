export const siteConfig = {
  title: 'Matthias',
  description: 'Personal blog and documentation site - Life under a new angle.',
  baseUrl: 'https://matthias.dev',
  author: {
    name: 'Matthias',
    email: 'contact@matthias.dev',
    github: 'https://github.com/Matthiasbrat',
  },
  social: {
    github: 'https://github.com/Matthiasbrat',
    twitter: '',
    linkedin: '',
  },
  seo: {
    defaultOgImage: '/og-default.png',
    twitterCard: 'summary_large_image' as const,
    twitterHandle: '',
  },
  analytics: {
    googleMeasurementId: '',
  },
  navigation: [
    { label: 'Blog', href: '/blog' },
    { label: 'Docs', href: '/docs' },
    { label: 'Topics', href: '/topics' },
    { label: 'Referrals', href: '/referrals' },
  ],
  features: {
    comments: true,
    reactions: true,
    search: true,
  },
};

export type SiteConfig = typeof siteConfig;
