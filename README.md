# example-env-typescript

[![ci](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml)

Linux x86_64 API examples for **gripsack 0.44.1** and **@gripsack/core 0.44.1**.
`package.json` and its lock select the published SDK; no sibling core checkout
or private SDK build is required.

## Two independent entrypoints

- The repository root retains the module examples: a Homebrew `jq` bottle,
  pinned GitHub `starship`, the `gripfetch-apt` transport for `htop`, local
  `hello`, a patch step, and tracked editor configuration. Their producers and
  existing byte pins are unchanged.
- `workspaces/conda/gripsack.ts` demonstrates coherent Conda `ripgrep`: one full
  transitive lock, final-prefix materialization, a project environment, a direct
  task and a personal profile. It replaces the old unpinned global-Pixi install.
  The obsolete legacy ripgrep lock was removed, not repinned to unstable bytes.

Keeping separate entrypoints preserves the bottle/plugin/steps demonstrations
without pretending those legacy producers are workspace recipes. The Conda
workspace needs no builder, private Pixi installation or ambient Conda prefix.

## Typecheck

Install the locked npm dependencies and check both entrypoints:

```sh
npm ci
npx tsc
```

The standalone CI uses the same published SDK and lockfile. The core repository
separately runs its pinned API-canary fixture against its candidate SDK and binary.

## Try the reviewed examples

Use the matching [released `grip` binary](https://github.com/gripsack-dev/gripsack/releases/tag/core-v0.44.1).
Start with disposable state; `apply` otherwise changes your real home. Inspect
the checkout before approving it.
The legacy `htop` lock targets Ubuntu 24.04. Run that entrypoint in the matching
environment with configured, refreshed apt indexes (`sudo apt update`); another
distro's package version does not satisfy the lock. The Conda entrypoint is
independent of those apt records.
The legacy apt transport extracts one package, not its dependency closure, so
that package's native runtime libraries must already be installed on the host.

```sh
export HOME="$(mktemp -d)"
export GRIPSACK_HOME="$HOME/.gs"
approve_reviewed_example() {
  receipt="$(grip trust inspect --json)"
  grip trust add --bundle "$(printf '%s' "$receipt" | jq -r .bundle_digest)" \
    --policy "$(printf '%s' "$receipt" | jq -r .policy_digest)"
}
approve_reviewed_example
grip check --host laptop
grip apply --host laptop
approve_reviewed_example
grip apply --host laptop       # already satisfied
```

For the independent Conda workspace, use a fresh home. The released core
provisions its byte-pinned helper automatically; no source build or helper
override is required:

```sh
cd workspaces/conda
export HOME="$(mktemp -d)"
export GRIPSACK_HOME="$HOME/.gs"
approve_reviewed_example
grip build ripgrep
grip run --env search -- rg --version
grip task version
grip apply personal
grip shell search              # process-scoped rg; exit to leave the shell
```

The committed lock reconstructs a cold prefix from its exact archive URLs and
hashes. Frozen build/run/task/shell/profile consumers never solve again or mutate
that prefix. To deliberately select newer packages, run `grip update ripgrep`,
review the changed lock, and approve its new source digest before consuming it.
`grip rollback` selects retained personal state. Mac runtime qualification is
not claimed by these Linux examples.

The workspace lock includes captured frontend identity for SDK 0.44.1. It was
migrated through `grip update ripgrep`, not by editing fingerprints. Selecting a
different SDK can require another explicit update and source approval; frozen
consumers do not silently accept changed frontend bytes.
