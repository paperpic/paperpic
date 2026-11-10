/**
 * The groups of each sidebar, in the order they appear. Page paths start at the root of a language, and the titles of
 * groups and pages come from the translations.
 */
export const sidebar = [
  {
    section: 'guide',
    group: 'introduction',
    pages: ['guide/getting-started'],
  },
] as const

export type SidebarGroup = typeof sidebar[number]['group']
export type SidebarPage = typeof sidebar[number]['pages'][number]
