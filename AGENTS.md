# PaperPic

## Read first

- Changing `packages/` or `playgrounds/`: read [Architecture](.github/CONTRIBUTING.md#architecture) and [Styles](.github/CONTRIBUTING.md#styles).
- Building the component, or changing its behavior or API: read [the spec](docs/spec/paperpic-component.md) and follow its roadmap.
- Committing, adding a changeset or opening a pull request: read [WORKFLOW.md](.github/WORKFLOW.md).
- Changing docs pages in `apps/docs`: read [Translating the docs](.github/CONTRIBUTING.md#translating-the-docs).

## Current state

`packages/vue/src/components/PaperPic.vue` is temporary, including its rotation clipping bug. New rendering work goes in `packages/core`.

## Done means

A task is done when both of these hold:

- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass. Run lint with `CI=true`, because ESLint disables some rules inside an editor terminal and CI enforces them.
- Any visual change has been seen working in a browser, through `pnpm dev` for `packages/core` or `pnpm dev:vue` for `packages/vue`. Set `BROWSER=none` to keep these scripts from opening a window.
