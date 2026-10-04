/** Legacy module fetcher showcase. The coherent Conda example has its own
 *  workspace entrypoint under workspaces/conda; no global Pixi install.
 *
 *  - brew: a bottle from Homebrew (floats to the current formula —
 *    `grip update jq` to move deliberately)
 *  - githubRelease: a pinned GitHub release (version= is honored)
 *  - apt: a distro package via gripfetch-apt, provisioned by the plugin
 *    lifecycle from its GitHub release
 */

import { brew, githubRelease, module, pluginFetch, symlink, verifyBinary } from "@gripsack/core";

export default [
  module("jq", {
    fetch: brew("jq"),
    install: { "jq/{version}/bin/jq": symlink("~/.local/bin/jq") },
    verify: verifyBinary("jq/{version}/bin/jq", ["--version"]),
  }),

  module("starship", {
    fetch: githubRelease({
      repo: "starship/starship",
      asset: "starship-x86_64-unknown-linux-musl.tar.gz",
      version: "v1.20.0",
    }),
    install: { starship: symlink("~/.local/bin/starship") },
    verify: verifyBinary("starship", ["--version"]),
  }),

  module("htop", {
    fetch: pluginFetch("apt", { package: "htop" }),
    install: { "bin/htop": symlink("~/.local/bin/htop") },
    verify: verifyBinary("bin/htop", ["--version"]),
  }),
];
