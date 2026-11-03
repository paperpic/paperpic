import type { DefaultTheme } from 'vitepress'

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
  label: string
  lang: string
  ogLocale: string
  description: string
  guide: string
  playground: string
  theme: ThemeStrings
}
