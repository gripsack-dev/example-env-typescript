/** The class style: phase methods return steps; the pipeline chains
 *  them (0007). Fetch, patch with a custom step, verify, install. */

import {
  Module,
  define,
  fetchStep,
  fileFetch,
  installStep,
  resource,
  shellStep,
  symlink,
  verifyShell,
} from "@gripsack/core";

const LOCK = resource("example.lock").name;

class Patched extends Module {
  override fetch() {
    return fetchStep(fileFetch("payloads/hello.tar.gz"));
  }

  override build() {
    return shellStep(
      "sed 's/hello/hello-patched/' bin/hello > bin/hello-patched && chmod +x bin/hello-patched",
      "patch",
      { resources: [LOCK], verify: verifyShell("test -x bin/hello-patched") },
    );
  }

  override install() {
    return installStep({ "bin/hello-patched": symlink("~/.local/bin/hello-patched") });
  }
}

define(Patched);
