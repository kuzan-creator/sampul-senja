// Dusk Cover Studio v5 — entry point for the make.fun "Make GTA 6 Cover Art"
// bounty. This program copies the finished web app (app/) and its four
// screenshots (screenshots/) into the output directory and writes the
// canonical dossier.json that the scorer compares against its own run.
// It uses only the Node standard library plus the kit's vendor file, runs
// twice with byte-identical output, and never touches the network.
import { buildDossier } from "./vendor/makefun-app.ts";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

  const out = process.argv[2] ?? "/output";
  console.log(`Dusk Cover Studio v5 — writing the entry to ${out}`);

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
cpSync("app", join(out, "app"), { recursive: true });
cpSync("screenshots", join(out, "screenshots"), { recursive: true });

writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
