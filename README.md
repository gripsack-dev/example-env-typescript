# example-env-typescript

[![ci](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml)

Linux x86_64 API examples for **gripsack 0.47.0**. The Conda workspace uses
the core's embedded **0.47.0 frontend (IR8)**. The independent legacy root keeps
its published **@gripsack/core 0.46.0** npm pin; no unpublished npm lock or
vendored SDK is needed.

## Two independent entrypoints

- The repository root retains the module examples: a Homebrew `jq` bottle,
  pinned GitHub `starship`, the `gripfetch-apt` transport for `htop`, local
  `hello`, a patch step, and tracked editor configuration. Their producers and
  existing byte pins are unchanged.
- `workspaces/conda/gripsack.ts` demonstrates coherent Conda `ripgrep`: one full
  transitive lock, an explicit glibc2.28/Linux4.18 solve baseline, final-prefix
  materialization, a project environment, a direct task and a personal profile.
  The obsolete global-Pixi path and legacy ripgrep lock are not restored.

Keeping separate entrypoints preserves the bottle/plugin/steps demonstrations
without pretending those legacy producers are workspace recipes. The Conda
workspace needs no builder, private Pixi installation or ambient Conda prefix.

## Typecheck

Install the locked npm dependencies and check both entrypoints:

```sh
npm ci
npx tsc
```

The manually dispatched typecheck uses the published 0.46.0 SDK
and lockfile; these examples use APIs present in that SDK. This does not qualify
the 0.47.0 runtime or its frozen workspace lock. The core repository separately
runs its pinned API-canary fixture against its candidate SDK and binary.

## Try the reviewed examples

Use the matching [0.47.0 `grip` release](https://github.com/gripsack-dev/gripsack/releases/tag/core-v0.47.0)
once published, through its verified installer with GitHub CLI2.102.0 or newer.
The signed local-qualification manifest and exact artifact identities are the
release contract; a SHA-256 sidecar alone is not signature verification.
Before publication, reviewers need the separately supplied0.47.0 candidate
binary and measured helper, not an older released core.
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
Run in `workspaces/conda` without installing a workspace-local npm SDK:
`@gripsack/core` resolves to the embedded frontend, not the root's editor/npm
dependency. An installed `workspaces/conda/node_modules/@gripsack/core` would
deliberately change the captured import identity. The released core provisions
its byte-pinned helper automatically; candidate reviewers instead need their
separately supplied measured helper in disposable state.

```sh
set -eu
cd workspaces/conda
grip trust inspect --json
# Set EXPECTED_BUNDLE and EXPECTED_POLICY from the separate workspace review.
approve_reviewed_example
grip check
grip build ripgrep
grip run --env search -- rg --version
grip task run version
grip apply personal
grip apply personal            # already satisfied
grip shell search              # process-scoped rg; exit to leave the shell
grip gc --dry-run              # inspect retained workspace/profile state
```

The committed lock reconstructs a cold prefix from its exact archive URLs and
hashes. Frozen build/run/task/shell/profile consumers never solve again or mutate
that prefix. To deliberately select newer packages, run `grip update ripgrep`,
review the changed lock, and approve its new source digest before consuming it.
`grip rollback` selects retained personal state. These examples target Linux
x86_64/WSL only; no ARM, macOS or native Windows qualification is claimed.

The workspace lock was migrated on 2026-10-24 through ordinary
`grip trust inspect --json`, exact `grip trust add --bundle … --policy …`
approval of the reviewed fixture, and `grip update ripgrep`. Generation used
the actual 0.47.0 development core and its embedded frontend, isolated
`HOME`/`GRIPSACK_HOME`/XDG directories outside the checkout, and explicit
`GRIPSACK_DENO` and `GRIPSACK_CONDA_HELPER` overrides only in that disposable
state. No frontend fingerprints or provisioning markers were hand-edited.

Migration artifact provenance:

- Core: `native-development-zqu1xm0m/grip`, SHA-256
  `15ed7d63aacaa2999b27341d442d28e143b41525579232c6c6e5d981f8e26bf7`.
- Helper: `gripsack-conda-0.47.0-x86_64-unknown-linux-musl`, SHA-256
  `c52dd5389d3cb1a221b14d5f765e5c943fa170d97529c7a0cb986cc4fd7d9f2f`.
- Pinned Deno executable SHA-256:
  `bceb5b6a6239b0b010418406d8c77a508f67cf4337d94288f1c19fe71304aab0`.
- Generated lock SHA-256:
  `8a0de0c22f7f6acaf5d18322eb01525f94cf5382528b671a7a984e5ca97cb066`.

Only the captured frontend definition changed, from
`0cdba672bf746b4d6e8afa8c7c3faf1fcf8a33c41df6c185cec67b74f2e3cd92` to
`caafff8b24ff614e78080f7182271f32603212fd85e767fa8be9e02214b7db67`.
All resolution records remained identical: `_openmp_mutex 4.5 20_gnu`,
`libgcc 16.2.0 ha9f2e26_7`, `libgomp 16.2.0 he0feb66_7`, and
`ripgrep 15.2.0 hf19af3b_1`, including archive URLs and hashes. The authored
`ripgrep: "*"` declaration, glibc2.28/Linux4.18 solver baseline, and legacy
byte pins were preserved; no solver-chosen closure changes occurred.

Review the entire generated lock before renewing source approval. Selecting
different frontend bytes can require another explicit update; frozen consumers
do not silently migrate. A solve floor is not proof of every host's
CPU/kernel/runtime compatibility. This migration generated the lock only:
0.47.0 build/run/task/profile and retained-prefix qualification remains a
separate release acceptance step against the final candidate artifacts.

Historical 0.46.0 evidence (not a 0.47.0 qualification): the public core,
installed npm SDK and default downloaded helper passed the
legacy and workspace journeys as UID1000. A separate network-disabled run with
the helper removed reused the frozen prefix without changing lock bytes, prefix
contents, modes, inodes or mtimes. That is Linux userspace on the observed WSL
kernel, not a physical-power-loss or universal portability claim.
