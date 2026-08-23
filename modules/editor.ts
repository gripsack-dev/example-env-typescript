/** Dotfiles only (0006 level 1): no fetch, no build — just configs with
 *  ownership modes, drift detection, and rollback. */

import { module, trackedCopy } from "@gripsack/core";

module("editor", {
  config: {
    "configs/editor.toml": trackedCopy("~/.config/editor/editor.toml"),
  },
});
