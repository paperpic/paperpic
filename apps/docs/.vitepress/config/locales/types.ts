import type { DefaultTheme } from 'vitepress'
import type { SidebarGroup, SidebarPage } from '../sidebar'

type ThemeStrings = Pick<
  DefaultTheme.Config,
  | 'outline'
  | 'docFooter'
  | 'lastUpdated'
  | 'langMenuLabel'
  | 'returnToTopLabel'
  | 'sidebarMenuLabel'
  | 'darkModeSwitchLabel'
  | 'lightModeSwitchTitle'
  | 'darkModeSwitchTitle'
  | 'skipToContentLabel'
  | 'notFound'
>

export interface Translation {
  description: string
  /** The titles of the sidebar groups. */
  groups: Record<SidebarGroup, string>
  guide: string
  label: string
  lang: string
  ogLocale: string
  /** The titles of the pages in the sidebar. */
  pages: Record<SidebarPage, string>
  playground: string
  search: NonNullable<DefaultTheme.LocalSearchOptions['translations']>
  theme: ThemeStrings
}
