import {
  defineWorkspace, environment, inputFile, pixi, pkg, provider,
  targetPlatform, workspace,
} from "@gripsack/core";

const linux = targetPlatform({ os: "linux", arch: "x86_64", abi: "gnu" });
const ripgrep = pkg("ripgrep", {
  producer: provider(pixi.fromLock({
    manifest: "pixi-manifest",
    lock: "pixi-lock",
    environment: "default",
  })),
  commands: { rg: "bin/rg" },
  target: linux,
  layout: { kind: "prefix_materialized" },
});

export default defineWorkspace(() => workspace({
  inputs: [
    inputFile("pixi-manifest", "pixi.toml"),
    inputFile("pixi-lock", "pixi.lock"),
  ],
  outputs: [ripgrep, environment("search", { packages: ["ripgrep"], target: linux })],
}));
