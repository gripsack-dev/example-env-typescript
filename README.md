# example-env-typescript

A minimal gripsack env repo, typescript frontend. Same shape as
[example-env-python](https://github.com/gripsack-dev/example-env-python) —
same IR, same tool, your choice of language.

## Status

Preview: the typescript eval path lands in gripsack 0.2. Today this
repo typechecks (`npm install && npx tsc`) and serves as the API
canary — gripsack CI compiles it on every change.

## Layout

```
env.toml              # frontend = "typescript"
package.json          # depends on @gripsack/core
hosts/laptop.ts       # per-machine tags
modules/
  hello.ts            # data style: fetch, install, verify
  editor.ts           # dotfiles only
  patched.ts          # class style: phase methods, custom patch step
configs/editor.toml
payloads/hello.tar.gz
```

## Try it (0.2)

```bash
npm install           # @gripsack/core
grip plan             # nothing moves; see the waves
grip apply            # generation 1
grip rollback
```
