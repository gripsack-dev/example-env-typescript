# example-env-typescript

[![ci](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml)

Linux x86_64 API examples for the **unreleased 0.44 candidate**. This branch is
not a recipe for the published 0.43 frontend. CI checks a pinned candidate core
checkout; `package.json` deliberately links its sibling `../gripsack/typescript`.

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

With the candidate `gripsack` checkout beside this repository:

```sh
(cd ../gripsack/typescript && npm ci && npm run build)
npm ci
npx tsc
```

Both entrypoints are typechecked. The core repository's example workflow also
runs their real CLI paths against its candidate binary. Publishing the matching
0.44 SDK/core and changing this explicit source pin belong to the release rollout;
this branch does not claim they are already on the registries.

## Try the reviewed examples

Use the matching candidate `grip` binary. Start with disposable state; `apply`
otherwise changes your real home. Inspect the checkout before approving it.

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

Before 0.44 artifacts are published, build the byte-pinned Conda helper from the
same core checkout and use its matching file mirror:

```sh
helper_assets="$(mktemp -d)"
sh ../gripsack/tools/conda-helper/dist.sh --dist "$helper_assets" \
  --target x86_64-unknown-linux-musl --check
export GRIPSACK_CONDA_HELPER_MIRROR="$helper_assets"
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
