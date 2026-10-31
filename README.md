# gripsack workspace examples

[![ci](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/gripsack-dev/example-env-typescript/actions/workflows/ci.yml)

Readable TypeScript workspaces for **gripsack 0.51.0** and **@gripsack/core
0.51.0**, targeting Linux/WSL2 x86_64. Install the matching
[released `grip` binary](https://github.com/gripsack-dev/gripsack/releases/tag/core-v0.51.0),
verify its archive against the release SHA-256 sidecar, then install the locked
SDK with `npm ci`. `npx tsc` checks all three entrypoints without executing them.

These native examples need neither Docker nor systemd. The SDK emits IR10;
the committed Gripsack locks use lock version 3 and the native environment
helper uses protocol 4. Keep the core, SDK and provisioned helper on the same
0.51 release. Install the SDK from the exact GitHub release URL in
`package-lock.json`, not a floating version or a different local package.

Each `gripsack.ts` is an independent workspace entrypoint. The root stays a
small personal-tools example; the Conda and Pixi entrypoints below are opt-in,
not extra outputs activated by the root. TypeScript declarations are evaluated
in the core's captured-source sandbox; they do not install tools or change home
files merely by being imported.

## Personal tools and configuration

The root [`gripsack.ts`](gripsack.ts) declares:

- `hello`: a native package from the captured `payloads/hello.tar.gz` archive.
- `starship`: the upstream v1.20.0 native release, pinned by SHA-256.
- `utilities`: `jq` and `htop` in one coherent Conda runtime closure.
- `development`: a process-scoped environment exposing those commands.
- `personal`: the same tools plus the tracked `configs/editor.toml` file at
  `~/.config/editor/editor.toml`.
- `greet` and `versions`: explicit manual tasks; `apply` does not run them.

Builds and project commands do not activate a personal profile. Applying a
profile changes your home and retains a generation for rollback. Start with
disposable state outside the checkout:

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

Review the exact checkout, installed SDK, locks and effective policy separately.
Set `EXPECTED_BUNDLE` and `EXPECTED_POLICY` to the digests from that review, not
from the inspection you are checking. The following approval helper requires
an existing `jq` on the host:

```sh
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
grip check
grip build hello
grip run --env development -- hello
grip task run greet
grip task run versions
grip apply personal
grip apply personal             # already satisfied
grip shell development          # exit to leave the process-scoped environment
grip gc --dry-run               # inspect retained state before collecting
```

Use `grip rollback` to select retained personal state. If captured files change,
stop, review them and renew approval for the new digests. Do not automate trust
by approving whatever source happens to be present.

The committed root lock freezes the archive selections and the complete
`utilities` closure. To deliberately refresh it, run `grip update` in the
reviewed root workspace, review the generated lock, then renew approval before
building or applying. A changed SDK also requires this explicit lock update;
do not transplant frontend fingerprints or package hashes from another lock.

## Frozen Conda environment

[`workspaces/conda/gripsack.ts`](workspaces/conda/gripsack.ts) is the focused
`ripgrep` example: one complete transitive lock, explicit glibc 2.28/Linux 4.18
solver requirements, final-prefix materialization, a project environment,
a manual task and a personal profile. It needs no build worker, ambient Conda
prefix or Pixi installation; `grip` provisions its byte-pinned environment helper.

Use fresh disposable state as above, then enter this independent workspace and
review its own bundle and policy before approving it:

```sh
cd workspaces/conda
grip trust inspect --json
# Set EXPECTED_BUNDLE and EXPECTED_POLICY from the separate workspace review.
approve_reviewed_example
grip check
grip build ripgrep
grip run --env search -- rg --version
grip task run version
grip apply personal
grip apply personal             # already satisfied
grip shell search
grip gc --dry-run
```

The committed lock reconstructs a cold prefix from exact archive URLs and
hashes. Frozen build/run/task/shell/profile consumers do not solve again or
mutate the installed prefix. To deliberately choose newer packages, run
`grip update ripgrep`, review the complete generated lock and renew source
approval before consuming it. The frontend identity is also locked: changing
the SDK requires an explicit update, not hand-edited fingerprints. A declared
solver baseline does not prove compatibility with every CPU, kernel or host.

## Import an existing Pixi lock

[`examples/pixi`](examples/pixi) contains a small real `pixi.toml`/`pixi.lock`
pair and a workspace using `pixi.fromLock`. The manifest and lock are explicit
workspace inputs; the selected environment is `default`, with `rg` exposed from
`bin/rg`. Import consumes that locked closure, not a fresh solve or a global
Pixi installation. The files are committed so documentation checks need no
external fixture download; materializing a cold environment still downloads
the pinned package archives.

With separate disposable state and approval for this workspace:

```sh
cd examples/pixi                # from the repository root
grip trust inspect --json
# Set EXPECTED_BUNDLE and EXPECTED_POLICY from the separate workspace review.
approve_reviewed_example
grip check
grip build ripgrep
grip run --env search -- rg --version
```

The committed Gripsack lock makes the first build frozen. After deliberately
changing the Pixi inputs, review and approve those inputs, run
`grip update ripgrep` to import their selected closure, then review the generated
`gripsack.lock` and renew approval before building. Import does not update the
external `pixi.lock`.

The Pixi pair was generated by the official
[Pixi v0.55.0](https://github.com/prefix-dev/pixi/releases/tag/v0.55.0) command
`pixi lock --manifest-path examples/pixi/pixi.toml`, using isolated temporary
HOME/cache directories. Its Linux x86_64 musl release archive was checked
against published SHA-256
`cb733205ae1a02986071bcbeff47c60460bfb92d1cd9565d40f4dea5448c86a5`.
The unedited version-6 lock records conda-forge's `ripgrep 15.1.0` and its three
runtime dependencies, with their actual archive URLs and SHA-256 hashes.
