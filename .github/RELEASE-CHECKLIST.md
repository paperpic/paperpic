# Release checklist

What is left before `@paperpic/core` and `@paperpic/vue` can be published. Delete this file once the first release from CI has worked. The process itself is described in [WORKFLOW.md](WORKFLOW.md).

## Already done

- [x] **Settings → Actions → General:** GitHub Actions may create and approve pull requests, at organization and repository level.
- [x] **Actions allowlist:** the four `changesets/action` sub-actions (`select-mode`, `version`, `pack`, `publish`) are allowed.
- [x] **GitHub App** for the version PR: the variable `RELEASE_APP_CLIENT_ID` and the secret `RELEASE_APP_PRIVATE_KEY` are set.
- [x] **Branch names:** the global ruleset accepts `changeset-release/`.
- [x] **Environment `npm`:** deploys only from `main`, needs approval from `@Unlooper`, and administrators cannot bypass it.
- [x] **Release tags ruleset:** `@paperpic/*` tags cannot be deleted, moved or force-pushed.
- [x] **npm:** the `paperpic` organization exists and the maintainer account has 2FA.
- [x] **Packaging:** a local `pnpm pack` produced tarballs with only `dist/`, `LICENSE`, `README.md` and `package.json`, and `workspace:*` was rewritten to the exact version.

## 1. Check that the Release workflow starts

Its only run so far ended in `startup_failure`, before the actions allowlist was fixed. Runs like that cannot be retried.

- [ ] After the next merge into `development`, open **Actions → Release** and confirm the run is green. With no changesets pending, only `select-mode` runs.

## 2. First release, published by hand

npm sets up trusted publishing from a package's own settings page, so each package must exist before CI can publish it. The first version is therefore published from a maintainer's machine.

- [ ] **Changeset.** If none is pending, create one: run `pnpm changeset`, select both packages, choose `minor` (0.0.0 → 0.1.0) and write "Initial release". Merge it into `development` through a normal PR.
- [ ] **Version PR.** Review the changelog in `chore: version packages` and merge it.
- [ ] **Release PR.** Open a PR from `development` into `main` and merge it. The Release workflow publishes nothing, because `NPM_PUBLISH` is not set.
- [ ] **Publish** from an up-to-date `main`:

  ```sh
  git switch main && git pull
  pnpm install --frozen-lockfile
  pnpm --filter "./packages/*" build
  npm login
  pnpm changeset publish
  git push origin "@paperpic/core@0.1.0" "@paperpic/vue@0.1.0"
  npm logout
  ```

  - `npm login` opens the browser.
  - `changeset publish` asks for the 2FA code, publishes with pnpm and creates the tags locally. Use the versions it prints in the `git push`.
  - `npm logout` removes the publish token from the machine.

- [ ] **GitHub Releases (optional).** CI creates these from then on; for this first version, create them by hand:

  ```sh
  gh release create "@paperpic/core@0.1.0" --title "@paperpic/core@0.1.0" --notes-file packages/core/CHANGELOG.md
  gh release create "@paperpic/vue@0.1.0" --title "@paperpic/vue@0.1.0" --notes-file packages/vue/CHANGELOG.md
  ```

- [ ] **Lock down publishing.** For each package on npmjs.com: **Settings → Publishing access → Require two-factor authentication and disallow tokens**.

## 3. Connect CI, right before the second release

An unvalidated trusted publisher configuration expires 48 hours after it is created. Do this step only when the second release is ready to go out. If it expires, delete the configuration and create it again.

- [ ] **Trusted publisher.** For each package on npmjs.com: **Settings → Trusted Publisher → GitHub Actions**. All fields are case-sensitive.

  | Field                | Value         |
  | -------------------- | ------------- |
  | Organization or user | `paperpic`    |
  | Repository           | `paperpic`    |
  | Workflow filename    | `release.yml` |
  | Environment name     | `npm`         |

- [ ] **Turn on publishing from CI:**

  ```sh
  gh variable set NPM_PUBLISH --repo paperpic/paperpic --body true
  ```

- [ ] **Release.** Merge the version PR, then `development` into `main`. Approve the `publish` job under **Review deployments** in the workflow run.
- [ ] **Check the result:** both versions on npm with provenance, both tags pushed, both GitHub Releases created.

pnpm combined with npm trusted publishing has not been tested in this repository yet. If the `publish` job fails, its log shows why.
