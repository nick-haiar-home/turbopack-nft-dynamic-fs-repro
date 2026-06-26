import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// Stand-in for a library that reads files from a runtime-resolved folder at
// boot — e.g. drizzle-orm's migrate(): readFileSync(path.join(folder, file)).
//
// On next@16.3.0-canary.65 (incl. PR #94361):
//   readdirSync(/* turbopackIgnore: true */ folder)   -> silenced
//   readFileSync(path.join(folder, f))                -> still warns; no comment
//       placement (inside or before path.join) clears it, and hoisting both
//       args into annotated variables leaves one residual warning.
// Tracking: https://github.com/vercel/next.js/issues/95125
export function loadStuff() {
  const folder = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  return readdirSync(folder).map((f) =>
    readFileSync(path.join(folder, f), "utf8"),
  );
}
