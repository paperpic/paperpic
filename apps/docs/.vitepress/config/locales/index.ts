import type { DefaultTheme, LocaleConfig } from 'vitepress'
import type { Translation } from './types'
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

export const locales: LocaleConfig<DefaultTheme.Config> = Object.fromEntries(
  Object.entries(translations).map(([key, { label, lang, description, guide, playground, theme }]) => {
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
          nav: [
            { text: guide, link: `${prefix}/guide/getting-started` },
            { text: playground, link: `${prefix}/playground` },
          ],
        },
      },
    ]
  }),
)
