import type { HeadConfig, TransformContext, UserConfig } from 'vitepress'
import { translations } from './locales'

/** The entries of the sitemap, as VitePress passes them to `transformItems`. */
type SitemapItems = Parameters<NonNullable<NonNullable<UserConfig['sitemap']>['transformItems']>>[0]

export const hostname = 'https://paperpic.dev'

const siteName = 'PaperPic'
const localeKeys = Object.keys(translations)

function pageFile(locale: string, path: string) {
  return locale === 'root'
    ? path
    : `${locale}/${path}`
}

function pageUrl(file: string) {
  return `${hostname}/${file.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`
}

export function transformHead({ pageData, siteConfig, title, description }: TransformContext): HeadConfig[] {
  if (pageData.isNotFound) {
    return [
      [
        'meta',
        { name: 'robots', content: 'noindex' },
      ],
    ]
  }

  const file = pageData.relativePath
  const locale = localeKeys.find(key => file.startsWith(`${key}/`)) ?? 'root'
  const path = locale === 'root'
    ? file
    : file.slice(locale.length + 1)
  const published = siteConfig.pages.map(page => siteConfig.rewrites.map[page] ?? page)
  // A page missing from a locale must not get a hreflang pointing to a 404
  const alternates = localeKeys.filter(key => published.includes(pageFile(key, path)))
  const url = pageUrl(file)

  const head: HeadConfig[] = [
    [
      'link',
      { rel: 'canonical', href: url },
    ],
    ...alternates.map((key): HeadConfig => [
      'link',
      {
        rel: 'alternate',
        hreflang: translations[key]!.lang,
        href: pageUrl(pageFile(key, path)),
      },
    ]),
    [
      'meta',
      { property: 'og:type', content: 'website' },
    ],
    [
      'meta',
      { property: 'og:site_name', content: siteName },
    ],
    [
      'meta',
      { property: 'og:title', content: title },
    ],
    [
      'meta',
      { property: 'og:description', content: description },
    ],
    [
      'meta',
      { property: 'og:url', content: url },
    ],
    // The comparison of the home, which shows what PaperPic does better than the logo
    [
      'meta',
      { property: 'og:image', content: `${hostname}/og-image.jpg` },
    ],
    [
      'meta',
      { property: 'og:image:width', content: '1200' },
    ],
    [
      'meta',
      { property: 'og:image:height', content: '630' },
    ],
    [
      'meta',
      { property: 'og:image:alt', content: translations[locale]!.ogImageAlt },
    ],
    [
      'meta',
      { property: 'og:locale', content: translations[locale]!.ogLocale },
    ],
    ...alternates
      .filter(key => key !== locale)
      .map((key): HeadConfig => [
        'meta',
        { property: 'og:locale:alternate', content: translations[key]!.ogLocale },
      ]),
    [
      'meta',
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  ]

  if (alternates.includes('root')) {
    head.push([
      'link',
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: pageUrl(path),
      },
    ])
  }

  if (file === 'index.md') {
    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': siteName,
        'url': `${hostname}/`,
      }),
    ])
  }

  return head
}

/**
 * Adds to each entry of the sitemap the `x-default` alternate that the head of its page has, the English page,
 * so the sitemap and the pages give search engines the same alternates.
 */
export function addDefaultAlternate(items: SitemapItems): SitemapItems {
  return items.map((item) => {
    const english = item.links?.find(link => link.lang === translations.root!.lang)

    return english
      ? {
          ...item,
          links: [
            ...item.links!,
            { lang: 'x-default', url: english.url },
          ],
        }
      : item
  })
}
