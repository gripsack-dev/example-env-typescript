import {
  conda, defineWorkspace, environment, exec, file, fileFetch, githubRelease,
  identity, lit, packageCommand, pkg, profile, provider, repoFile,
  targetPlatform, task, trackedCopyTo, workspace,
} from "@gripsack/core";

const linux = targetPlatform({ os: "linux", arch: "x86_64", abi: "gnu" });

// A captured native archive needs neither a solver nor a build worker.
const hello = pkg("hello", {
  producer: provider(fileFetch("payloads/hello.tar.gz")),
  commands: { hello: "bin/hello" },
  target: linux,
  layout: { kind: "relocatable" },
});

const starship = pkg("starship", {
  producer: provider(githubRelease({
    repo: "starship/starship",
    asset: "starship-x86_64-unknown-linux-musl.tar.gz",
    version: "v1.20.0",
    sha256: "8b674659524fc6147f1b9857ed0135db277378f5dec2a98763502ce1471fa886",
  })),
  commands: { starship: "starship" },
  target: linux,
  layout: { kind: "relocatable" },
});

// jq and htop share one solved runtime closure and final-prefix installation.
const utilities = pkg("utilities", {
  producer: provider(conda.environment({
    channels: ["conda-forge"],
    packages: { jq: "*", htop: "*" },
    systemRequirements: {
      libc: { family: "glibc", version: "2.28" },
      linux: "4.18",
    },
  })),
  commands: { jq: "bin/jq", htop: "bin/htop" },
  target: linux,
  layout: { kind: "prefix_materialized" },
});

const development = environment("development", {
  packages: ["hello", "starship", "utilities"],
  target: linux,
});

const personal = profile("personal", {
  environment: "development",
  files: [file({
    source: repoFile("configs/editor.toml"),
    content: identity(),
    destination: trackedCopyTo("~/.config/editor/editor.toml"),
  })],
});

// Manual tasks run only when requested; declaring one does not run it on apply.
const greet = task("greet", {
  steps: [exec(packageCommand("hello", "hello")).build()],
});
const versions = task("versions", {
  steps: [
    exec(packageCommand("starship", "starship")).arg(lit("--version")).build(),
    exec(packageCommand("utilities", "jq")).arg(lit("--version")).build(),
    exec(packageCommand("utilities", "htop")).arg(lit("--version")).build(),
  ],
});

export default defineWorkspace(() => workspace({
  outputs: [hello, starship, utilities, development, personal, greet, versions],
}));
