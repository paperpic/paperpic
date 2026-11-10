import type { DefaultTheme, LocaleConfig } from 'vitepress'
import type { Translation } from './types'
import { sidebar } from '../sidebar'
import de from './de.json'
import en from './en.json'
import es from './es.json'
import fr from './fr.json'
import it from './it.json'
import ja from './ja.json'
import ko from './ko.json'
import pt from './pt.json'
import ru from './ru.json'
import zh from './zh.json'

export const translations: Record<string, Translation> = {
  root: en,
  es,
  fr,
  de,
  it,
  pt,
  zh,
  ja,
  ko,
  ru,
}

function sidebarOf(prefix: string, { groups, pages }: Translation): DefaultTheme.SidebarMulti {
  const sections = [
    ...new Set(sidebar.map(({ section }) => section)),
  ]

  return Object.fromEntries(sections.map(section => [
    `${prefix}/${section}/`,
    sidebar
      .filter(entry => entry.section === section)
      .map(({ group, pages: paths }) => ({
        text: groups[group],
        items: paths.map(path => ({ text: pages[path], link: `${prefix}/${path}` })),
      })),
  ]))
}

export const locales: LocaleConfig<DefaultTheme.Config> = Object.fromEntries(
  Object.entries(translations).map(([key, translation]) => {
    const { label, lang, description, guide, reference, playground, theme } = translation
    const prefix = key === 'root'
      ? ''
      : `/${key}`

    return [
      key,
      {
        label,
        lang,
        description,
        themeConfig: {
          ...theme,
          // The reference has one third-level heading for each option, method and event
          outline: {
            ...theme.outline,
            level: [2, 3],
          },
          nav: [
            { text: guide, link: `${prefix}/guide/introduction`, activeMatch: `^${prefix}/guide/` },
            { text: reference, link: `${prefix}/reference/options`, activeMatch: `^${prefix}/reference/` },
            { text: playground, link: `${prefix}/playground` },
          ],
          sidebar: sidebarOf(prefix, translation),
        },
      },
    ]
  }),
)

export const searchLocales: NonNullable<DefaultTheme.LocalSearchOptions['locales']> = Object.fromEntries(
  Object.entries(translations).map(([key, { search }]) => [
    key,
    { translations: search },
  ]),
)
