/** A tool with a payload: fetch a tarball, install the binary, verify it.
 *  The data style — most modules look like this. */

import { dep, fileFetch, module, symlink, verifyBinary } from "@gripsack/core";

module("hello", {
  fetch: fileFetch("payloads/hello.tar.gz"),
  install: { "bin/hello": symlink("~/.local/bin/hello") },
  verify: verifyBinary("bin/hello"),
  depends: [dep("editor")],
});
