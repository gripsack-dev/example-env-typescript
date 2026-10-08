# example-env-typescript

[![ci](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml)

Linux x86_64 API examples for **gripsack 0.45.0** and **@gripsack/core 0.45.0**.
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

Use the matching [released `grip` binary](https://github.com/gripsack-dev/gripsack/releases/tag/core-v0.45.0),
verifying its archive against the published SHA-256 sidecar before extracting.
Start with disposable state; `apply` otherwise changes your real home. Review
the exact checkout, SDK, lockfiles and effective policy before approving them.
The legacy `htop` lock targets Ubuntu 24.04. Run that entrypoint in the matching
environment with configured, refreshed apt indexes (`sudo apt update`); another
distro's package version does not satisfy the lock. The Conda entrypoint is
independent of those apt records.
The legacy apt transport extracts one package, not its dependency closure, so
that package's native runtime libraries must already be installed on the host.
The exercised Ubuntu 24.04 baseline has `libncursesw6`, `libtinfo6`,
`libnl-3-200` and `libnl-genl-3-200`; the approval commands below also need `jq`.
This is not a claim that the extracted apt payload is portable to other distros.

Run from the repository root. Keep **all** state outside the checkout so state
writes cannot change captured source:

```sh
set -eu
state="$(mktemp -d /tmp/gripsack-example.XXXXXX)"
export HOME="$state/home" GRIPSACK_HOME="$state/gripsack"
export XDG_CONFIG_HOME="$state/config" XDG_CACHE_HOME="$state/cache"
export XDG_DATA_HOME="$state/data" XDG_STATE_HOME="$state/state"
export XDG_RUNTIME_DIR="$state/runtime"
mkdir -p "$HOME" "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_DATA_HOME" \
  "$XDG_STATE_HOME" "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"
grip trust inspect --json
```

Record the expected bundle and policy digests from your **separate review** of
this exact checkout and policy. Do not populate the expected values from the
inspection being checked. After setting `EXPECTED_BUNDLE` and `EXPECTED_POLICY`
to those reviewed values, compare before adding approval:

```sh
set -eu
approve_reviewed_example() {
  : "${EXPECTED_BUNDLE:?Set the separately reviewed bundle digest}"
  : "${EXPECTED_POLICY:?Set the separately reviewed policy digest}"
  receipt="$(grip trust inspect --json)" || return
  test "$(printf '%s' "$receipt" | jq -er .bundle_digest)" = "$EXPECTED_BUNDLE" &&
    test "$(printf '%s' "$receipt" | jq -er .policy_digest)" = "$EXPECTED_POLICY" ||
    { printf '%s\n' 'Review required: source or policy changed.' >&2; return 1; }
  grip trust add --bundle "$EXPECTED_BUNDLE" --policy "$EXPECTED_POLICY"
}
approve_reviewed_example
grip check --host laptop
grip apply --host laptop
grip apply --host laptop       # already satisfied
```

If a command changes captured files, stop and review the generated changes,
then record the newly reviewed expected values and renew exact approval.
An automated test may approve its own inspected, known fixture; that is not
an unattended production approval recipe.

For the independent Conda workspace, repeat the state setup above with a new
directory, then inspect and separately review this entrypoint's expected digests.
The released core provisions its byte-pinned helper automatically; no source
build, helper mirror or private helper override is required:

```sh
set -eu
cd workspaces/conda
grip trust inspect --json
# Set EXPECTED_BUNDLE and EXPECTED_POLICY from the separate workspace review.
approve_reviewed_example
grip check
grip build ripgrep
grip run --env search -- rg --version
grip task version
grip apply personal
grip apply personal            # already satisfied
grip shell search              # process-scoped rg; exit to leave the shell
grip gc --dry-run              # inspect retained workspace/profile state
```

The committed lock reconstructs a cold prefix from its exact archive URLs and
hashes. Frozen build/run/task/shell/profile consumers never solve again or mutate
that prefix. To deliberately select newer packages, run `grip update ripgrep`,
review the changed lock, and approve its new source digest before consuming it.
`grip rollback` selects retained personal state. Mac runtime qualification is
not claimed by these Linux examples.

The workspace lock includes captured frontend identity for SDK 0.45.0. It was
migrated through `grip update ripgrep`, not by editing fingerprints. Review the
entire generated lock (frontend identity, platform assumptions, package versions,
archive URLs and hashes) before renewing approval. Selecting a different SDK
can require another explicit update and source approval; frozen consumers do
not silently accept changed frontend bytes.
The committed migration was generated in Ubuntu 24.04 (glibc 2.39) on Linux
x86_64; its existing Conda package archives remain pinned to the same bytes.
