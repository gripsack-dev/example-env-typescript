/** Fetcher showcase: one module per transport (the python example's twin).
 *
 *  - brew: a bottle from Homebrew (floats to the current formula —
 *    `grip update jq` to move deliberately)
 *  - pixi: a conda package via pixi (grip provisions pixi itself)
 *  - githubRelease: a pinned GitHub release (version= is honored)
 *  - apt: a distro package via gripfetch-apt, provisioned by the plugin
 *    lifecycle from its GitHub release
 */

import { brew, githubRelease, module, pixi, pluginFetch, symlink, verifyBinary } from "@gripsack/core";

module("jq", {
  fetch: brew("jq"),
  install: { "jq/{version}/bin/jq": symlink("~/.local/bin/jq") },
  verify: verifyBinary("jq/{version}/bin/jq", ["--version"]),
});

module("ripgrep", {
  fetch: pixi("ripgrep"),
  install: { "bin/rg": symlink("~/.local/bin/rg") },
  verify: verifyBinary("bin/rg", ["--version"]),
});

module("starship", {
  fetch: githubRelease({
    repo: "starship/starship",
    asset: "starship-x86_64-unknown-linux-musl.tar.gz",
    version: "v1.20.0",
  }),
  install: { starship: symlink("~/.local/bin/starship") },
  verify: verifyBinary("starship", ["--version"]),
});

module("htop", {
  fetch: pluginFetch("apt", { package: "htop" }),
  install: { "bin/htop": symlink("~/.local/bin/htop") },
  verify: verifyBinary("bin/htop", ["--version"]),
});
