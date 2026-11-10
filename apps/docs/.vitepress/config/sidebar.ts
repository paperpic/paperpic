/**
 * The groups of each sidebar, in the order they appear. Page paths start at the root of a language, and the titles of
 * groups and pages come from the translations.
 */
export const sidebar = [
  {
    section: 'guide',
    group: 'introduction',
    pages: ['guide/introduction', 'guide/getting-started'],
  },
  {
    section: 'guide',
    group: 'essentials',
    pages: ['guide/viewer', 'guide/editing', 'guide/saving'],
  },
  {
    section: 'guide',
    group: 'tools',
    pages: [
      'guide/tools/crop',
      'guide/tools/straighten',
      'guide/tools/rotate-and-flip',
      'guide/tools/adjust',
      'guide/tools/clean-up',
    ],
  },
  {
    section: 'reference',
    group: 'api',
    pages: [
      'reference/options',
      'reference/methods',
      'reference/events',
      'reference/state',
    ],
  },
  {
    section: 'reference',
    group: 'customization',
    pages: ['reference/labels', 'reference/css-tokens'],
  },
  {
    section: 'reference',
    group: 'frameworks',
    pages: ['reference/vue', 'reference/react'],
  },
] as const

export type SidebarGroup = typeof sidebar[number]['group']
export type SidebarPage = typeof sidebar[number]['pages'][number]
