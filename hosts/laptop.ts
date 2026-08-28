/** Host entrypoint — a function (0013 D5): gripsack calls it with
 *  `ctx` (facts, CLI tags, probes) and you return the environment.
 *  Gating is plain code; falsy entries drop out. */

import { defineEnv } from "@gripsack/core";
import editor from "../modules/editor.ts";
import fetchers from "../modules/fetchers.ts";
import hello from "../modules/hello.ts";
import patched from "../modules/patched.ts";

export default defineEnv(() => ({
  tags: ["example", "laptop"],
  modules: [hello, editor, ...fetchers, patched],
}));
