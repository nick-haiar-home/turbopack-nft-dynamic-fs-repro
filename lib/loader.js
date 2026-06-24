import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// Stand-in for any library that reads a set of files from a runtime-resolved
// folder at boot (e.g. drizzle-orm's migrate() reading its migrations folder).
export function loadStuff() {
  const folder = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  return readdirSync(folder).map((f) =>
    readFileSync(path.join(folder, f), "utf8"),
  );
}
