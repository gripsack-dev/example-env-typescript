/** The steps style (0007): explicit steps for phases declarative
 *  fields cannot express — here a patch step between fetch and
 *  install. One fetch per module (the lockfile pins one payload);
 *  explicit `needs` on every edge. */

import {
  fetchStep,
  fileFetch,
  installStep,
  module,
  resource,
  shellStep,
  symlink,
  verifyShell,
} from "@gripsack/core";

const LOCK = resource("example.lock").name;

export default module("patched", {
  steps: [
    fetchStep(fileFetch("payloads/hello.tar.gz")),
    {
      ...shellStep(
        "sed 's/hello/hello-patched/' bin/hello > bin/hello-patched && chmod +x bin/hello-patched",
        "patch",
        { resources: [LOCK], verify: verifyShell("test -x bin/hello-patched") },
      ),
      needs: ["fetch"],
    },
    {
      ...installStep({ "bin/hello-patched": symlink("~/.local/bin/hello-patched") }),
      needs: ["patch"],
    },
  ],
});
