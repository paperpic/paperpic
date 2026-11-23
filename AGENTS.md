# PaperPic

## Read first

- Changing `packages/` or `playgrounds/`: read [Architecture](.github/CONTRIBUTING.md#architecture) and [Styles](.github/CONTRIBUTING.md#styles).
- Building the component, or changing its behavior or API: read [the spec](docs/spec/paperpic-component.md) and follow its roadmap.
- Committing, adding a changeset or opening a pull request: read [WORKFLOW.md](.github/WORKFLOW.md).
- Adding or changing a feature, a public option, method or event, or the setup of a package: in the same branch, update everything that describes it. That is the spec, the docs pages, labels and glossaries of every language, the READMEs, the playgrounds, a changeset, and [the PaperPic skill](skills/paperpic/SKILL.md) and the `rules` in [context7.json](context7.json), which agents of the developers who use PaperPic read. To find every place, search for the closest existing feature, such as `git grep -il redact`.
- Changing the docs site in `apps/docs`: read [the docs spec](docs/spec/docs-site.md), follow its work plan, and read [Translating the docs](.github/CONTRIBUTING.md#translating-the-docs).

## Done means

A task is done when both of these hold:

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:e2e` pass. Run lint with `CI=true`, because ESLint disables some rules inside an editor terminal and CI enforces them.
- Any visual change has been seen working in a browser, through `pnpm dev` for `packages/core`, `pnpm dev:vue` for `packages/vue` or `pnpm dev:react` for `packages/react`. Set `BROWSER=none` to keep these scripts from opening a window.
