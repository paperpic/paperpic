/// <reference path="./env.d.ts" />
import './style.css'

type Theme = 'light' | 'dark'

const THEME_KEY = 'paperpic-playground-theme'

const ICONS: Record<Theme, string> = {
  light: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  dark: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
}

const systemDark = () => matchMedia('(prefers-color-scheme: dark)')

/** The theme the user chose on an earlier visit, if any. Storage can be blocked, which means no choice. */
function storedTheme(): Theme | undefined {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark'
      ? value
      : undefined
  }
  catch {
    return undefined
  }
}

function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme
  if (chosen === 'light' || chosen === 'dark') {
    return chosen
  }
  return systemDark().matches
    ? 'dark'
    : 'light'
}

/** A button that switches between the light and the dark theme. It starts with the system's, until the user chooses. */
function renderThemeToggle(): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'theme-toggle'

  // It shows the theme it switches to, as most sites do
  const update = () => {
    const next: Theme = currentTheme() === 'dark'
      ? 'light'
      : 'dark'
    button.innerHTML = ICONS[next]
    button.setAttribute('aria-label', `Switch to the ${next} theme`)
    button.title = button.getAttribute('aria-label')!
  }

  const stored = storedTheme()
  if (stored) {
    document.documentElement.dataset.theme = stored
  }

  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark'
      ? 'light'
      : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    }
    catch {
      // The choice lasts until the page reloads
    }
    update()
  })
  systemDark().addEventListener('change', update)
  update()
  return button
}

/** Creates the header of every development page: the brand, the name of the page, the project links and the theme. */
export function renderHeader(title: string): HTMLElement {
  const header = document.createElement('header')
  header.className = 'header'
  header.innerHTML = `
    <h1 class="brand">
      <img class="logo" src="/logo-mark.svg" alt="" width="32" height="32">
      <span class="wordmark">Paper<span class="wordmark-accent">Pic</span></span>
      <span class="title"></span>
    </h1>
    <div class="header-actions">
      <nav class="links" aria-label="Project links">
        <a class="link" href="https://paperpic.dev">Docs</a>
        <a class="link" href="https://github.com/paperpic/paperpic">GitHub</a>
      </nav>
    </div>
  `
  header.querySelector('.title')!.textContent = title
  header.querySelector('.header-actions')!.append(renderThemeToggle())
  return header
}
