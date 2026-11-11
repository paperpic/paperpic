# Docs site spec

**Status:** agreed on 2026-11-10, not built yet. This file grows as decisions are made. Anything not listed under [Decisions](#decisions) is still open.

## Goal

The site at `paperpic.dev` teaches developers how to add PaperPic to an app in plain JavaScript, Vue or React, and lets them try it. It lives in `apps/docs` and is built with VitePress.

The [component spec](paperpic-component.md) stays the source of truth for behavior. The site explains that behavior to the people who use the packages.

## Decisions

| ID  | Decision                                                                                                                                                                                                                                                          | Reason                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| S1  | The site is written for developers who integrate PaperPic. It has no manual for the people who edit the photos.                                                                                                                                                   | The editor must explain itself on screen.                                                                    |
| S2  | One guide covers every framework. Code examples show JavaScript, Vue and React in tabs from `vitepress-plugin-tabs` with the shared key `framework`, so one choice switches every example and is remembered in `localStorage`.                                    | The wrappers are thin and the API is the same. Three guides would triple the text in every language.         |
| S3  | The API reference is written by hand, with one heading for each option, method and event. A test fails when a public option, method or event of `@paperpic/core` has no heading in the English reference.                                                         | The API is small and its descriptions are translated. The test keeps the pages from falling behind the code. |
| S4  | The READMEs of `core`, `vue` and `react` keep only installation, a minimal example and a link to their guide. The root README keeps its features and quick start.                                                                                                 | One full copy of the docs instead of four. GitHub and npm still show working code.                           |
| S5  | Every page exists in all 10 languages. A pull request that adds a page or changes what it says updates every language. Translations may come from AI with a quick review.                                                                                         | A missing page would leave a sidebar link that leads to a 404.                                               |
| S6  | Translators follow a glossary for each language: the labels of the component, plus the terms of the guide. The docs name a control exactly as the component labels it in that language, and a tool page takes the name of its button.                             | Readers look for the word they see on screen.                                                                |
| S7  | A few pages embed a live demo: a `Demo` component that mounts `@paperpic/vue` with the options the page passes, only in the browser and only when it scrolls into view. The playground stays as the full demo.                                                    | Seeing the behavior beats reading about it, but each demo loads the component, its worker and an image.      |
| S8  | VitePress local search, with its interface translated in each language.                                                                                                                                                                                           | No external service or account.                                                                              |
| S9  | The site publishes `llms.txt` and `llms-full.txt`, built from the English pages.                                                                                                                                                                                  | Coding agents read docs this way, and English is enough for them.                                            |
| S10 | One changelog page includes the `CHANGELOG.md` that changesets writes for each package. Every language has the page, with the notes in English.                                                                                                                   | Release notes are written once, at release time.                                                             |
| S11 | One version of the docs, for the latest release, until 1.0.                                                                                                                                                                                                       | Versions before 1.0 are not supported side by side.                                                          |
| S12 | Plain English with short sentences, active voice and "you", without marketing language. Each page opens with the problem it solves. Code examples are complete and run as copied.                                                                                 | The same voice as the component spec and the READMEs, and easier to translate well.                          |
| S13 | The home shows a before and after comparison that the reader drags: a photo of a document taken at an angle with a shadow, and the result PaperPic makes from it. Below it come six features from the README and links to Getting started, Playground and GitHub. | It shows what PaperPic does in a second, with two static images instead of the whole component.              |
| S14 | The site goes live with the first release on npm, when the `DOCS_DEPLOY` repository variable is set to `true`.                                                                                                                                                    | Before that release, the install commands fail.                                                              |
| S15 | Examples show their code in the page, without links to open them in StackBlitz or another online editor.                                                                                                                                                          | The code in the page and the playground are enough for now.                                                  |

## Pages

The top navigation has Guide, Reference, Examples and Playground, and a version menu that links to the changelog. Each section has its own sidebar.

### Guide

| Page                    | Path                           | Covers                                                                                                                                                                          |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Introduction            | `/guide/introduction`          | What PaperPic does and does not do, such as PDF or automatic detection, and how the packages fit together.                                                                      |
| Getting started         | `/guide/getting-started`       | Installing, importing the styles, giving the container a height and showing the first image.                                                                                    |
| Viewer                  | `/guide/viewer`                | Zoom, pan, fit, wheel zoom, the toolbar, and read-only use with `editable: false`. With a demo.                                                                                 |
| Editing                 | `/guide/editing`               | Edit mode, the edit bar, Undo and Redo, Apply and Cancel, choosing tools with `tools`, and what discards an edit.                                                               |
| Crop                    | `/guide/tools/crop`            | Corner handles, the magnifier, `Enter` and `Esc`.                                                                                                                               |
| Straighten              | `/guide/tools/straighten`      | The `perspective` tool: estimated proportions, `aspectRatio` and corners cut off by the photo. With a demo.                                                                     |
| Rotate and flip         | `/guide/tools/rotate-and-flip` | Quarter turns, mirroring, and turns that cancel out.                                                                                                                            |
| Adjust                  | `/guide/tools/adjust`          | Brightness and contrast.                                                                                                                                                        |
| Clean up                | `/guide/tools/clean-up`        | The `threshold` tool: black and white, sensitivity and `softness`. With a demo.                                                                                                 |
| Saving the result       | `/guide/saving`                | The `apply` event, `output`, `maxOutputSize`, `filename`, the download button and its event, and uploading the `Blob`.                                                          |
| Styling                 | `/guide/styling`               | `style.css`, the `--paperpic-*` tokens and how to point them at a design system, dark mode with `color-scheme`, the `paperpic` layer with Tailwind CSS, icons, and class names. |
| Labels                  | `/guide/labels`                | Replacing or translating any text of the interface.                                                                                                                             |
| Accessibility           | `/guide/accessibility`         | Keyboard shortcuts, screen readers, `alt`, reduced motion and forced colors.                                                                                                    |
| Performance and support | `/guide/performance`           | The worker, bundlers and Content Security Policy, preview and full resolution, and supported browsers.                                                                          |

### Reference

| Page       | Path                    | Covers                                                                                                                            |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Options    | `/reference/options`    | Every option of the constructor and `setOptions()`.                                                                               |
| Methods    | `/reference/methods`    | Every public method of `PaperPic`.                                                                                                |
| Events     | `/reference/events`     | Every event and its payload.                                                                                                      |
| State      | `/reference/state`      | Every field that `getState()` returns.                                                                                            |
| Labels     | `/reference/labels`     | Every label key with its English text.                                                                                            |
| CSS tokens | `/reference/css-tokens` | Every `--paperpic-*` custom property with its light and dark value, the public classes and the values of `data-paperpic-control`. |
| Vue        | `/reference/vue`        | How options, events and methods map to props, emits and the component ref.                                                        |
| React      | `/reference/react`      | How options, events and methods map to props, callbacks and the ref.                                                              |

### Examples

| Page               | Path                          | Covers                                                            |
| ------------------ | ----------------------------- | ----------------------------------------------------------------- |
| Upload to a server | `/examples/upload`            | Sending the result of Apply with `fetch`.                         |
| Read-only viewer   | `/examples/read-only`         | A viewer without editing, with rotate buttons.                    |
| Custom toolbar     | `/examples/custom-toolbar`    | `toolbar: false` and buttons of your own that call the methods.   |
| Fixed proportions  | `/examples/fixed-proportions` | `aspectRatio` for known documents, such as A4 sheets or ID cards. |

### Other pages

| Page       | Path          | Covers                               |
| ---------- | ------------- | ------------------------------------ |
| Home       | `/`           | See S13.                             |
| Playground | `/playground` | The full demo, which already exists. |
| Changelog  | `/changelog`  | See S10.                             |

## Where things live

- English pages live in `apps/docs/src/en` and are served at the root. The other languages live in `apps/docs/src/<locale>`, with the same file names.
- The interface texts of each language, including the navigation, the sidebar groups and search, live in `apps/docs/.vitepress/config/locales/<locale>.json`.
- The labels of the component in each language live in `apps/docs/.vitepress/theme/components/paperpic-labels.ts`.
- The glossaries live in `apps/docs/glossary/<locale>.md`, outside `src`, so they are not published.
- The reference test lives in `apps/docs` and runs with `pnpm test`. It reads the members of `PaperPicOptions`, the public methods of `PaperPic` and the event names with the TypeScript compiler API.

## Work plan

One pull request for each step, each with all 10 languages:

1. **Base.** Sidebars for each language, tabs, local search, `llms.txt`, the `Demo` component and the glossaries. [Translating the docs](../../.github/CONTRIBUTING.md#translating-the-docs) changes to S5, and `AGENTS.md` points to this spec.
2. **Reference**, with its test. It comes first because the guide links to it and it fixes the vocabulary.
3. **Guide, part 1.** Introduction, Getting started, Viewer and Editing. The package READMEs are trimmed (S4).
4. **Guide, part 2.** The tool pages and Saving the result.
5. **Guide, part 3.** Styling, Labels, Accessibility, and Performance and support.
6. **Examples and changelog.** The changelog page waits until the first release has written the changelogs.
7. **Home.**

The site then goes live with the first release on npm (S14).
