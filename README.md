<p align="center">
<img src="apps/docs/src/public/logo.png" alt="PaperPic" width="160">
<br>
Turn photos of paper into clean, readable documents, right in the browser.
</p>

<p align="center">
<a href="https://github.com/paperpic/paperpic/actions/workflows/ci.yml"><img src="https://github.com/paperpic/paperpic/actions/workflows/ci.yml/badge.svg?branch=development" alt="CI"></a>
<a href="./LICENSE"><img src="https://img.shields.io/github/license/paperpic/paperpic" alt="License: MIT"></a>
<a href="https://www.conventionalcommits.org/"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits"></a>
<a href=".github/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome"></a>
<a href=".github/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4BAAAA" alt="Contributor Covenant"></a>
<br>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
<a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue"></a>
<a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
<a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white" alt="Vitest"></a>
<a href="https://vitepress.dev/"><img src="https://img.shields.io/badge/VitePress-1-5C73E7?logo=vitepress&logoColor=white" alt="VitePress"></a>
<a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-26-5FA04E?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
<a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white" alt="pnpm"></a>
<a href="https://www.gitkraken.com/"><img src="https://img.shields.io/badge/Made%20with-GitKraken-179287?logo=gitkraken&logoColor=white" alt="Made with GitKraken"></a>
<br>
<a href="https://github.com/paperpic/paperpic/stargazers"><img src="https://img.shields.io/github/stars/paperpic/paperpic?style=social" alt="GitHub stars"></a>
</p>

> [!WARNING]
> Work in progress. Not ready for production.

## Features

- 🎪 [**Interactive docs & demos**](https://paperpic.dev)
- 🔍 **Viewer**: zoom with the buttons, the mouse wheel or a trackpad, pan, and fit to width or height
- ✂️ **Crop** with draggable corners and a magnifier for touch screens
- 📐 **Straighten** photos taken at an angle: drag four corners and get a flat page with its proportions estimated
- 🔄 **Rotate** in 90° steps, and **flip**
- ☀️ **Brightness and contrast** with live sliders
- 🧼 **Clean up** into crisp black & white, removing shadows, with an adjustable sensitivity
- ↩️ **Undo and redo** every edit until you apply, then get the result as a `Blob`
- ⚡ **Off the main thread**: image processing runs in a Web Worker
- 🌗 **Dark mode** that follows the system, and CSS tokens for your own theme
- 🏷️ **Custom labels**: replace any text in the interface
- 🪶 **No runtime dependencies** in the core
- 🧩 **Framework agnostic**, with a thin wrapper for Vue

## Packages

| Package                           | Status         |
| --------------------------------- | -------------- |
| [`@paperpic/core`](packages/core) | In development |
| [`@paperpic/vue`](packages/vue)   | In development |

## Roadmap

- Wrappers for React and, if feasible, Angular
- More tools: free-angle straightening
- Automatic detection of the document corners

## Development

Requires Node.js 26 and pnpm 12.

```sh
pnpm install
pnpm dev         # vanilla playground with hot reload
pnpm dev:vue     # Vue playground with hot reload
pnpm dev:docs    # docs site
pnpm test
pnpm build
```

## Contributing

Contributions are welcome. Read the [contributing guide](.github/CONTRIBUTING.md) before opening a pull request, and follow the [code of conduct](.github/CODE_OF_CONDUCT.md).

Pull requests go to `development`. `main` only receives releases.

## License

[MIT](./LICENSE)
