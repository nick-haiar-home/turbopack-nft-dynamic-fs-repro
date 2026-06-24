# turbopack-nft-dynamic-fs-repro

Minimal reproduction for a Turbopack file-tracing warning. Pinned to
`next@canary` (required by Next's bug-report form). See `ISSUE.md` for the
paste-ready write-up.

## Run

```bash
pnpm install
pnpm build
```

Observe (on `next@16.3.0-canary.65`):

```
Turbopack build encountered 3 warnings:
./lib/loader.js:6:10
Warning: Dynamic filesystem access causes tracing of the whole project
```

## The bug

`lib/loader.js` does a runtime-resolved `fs` read (stand-in for a DB migrator
reading its migrations folder). For `output: "standalone"`, Turbopack traces
the whole project and warns.

The warning recommends `path.join(/*turbopackIgnore: true*/ process.cwd(), bar)`
— but that placement has **no effect**. `turbopackIgnore` only works when it
annotates a bare variable passed straight to the `fs` call
(`readdirSync(/*turbopackIgnore: true*/ folder)` is silenced), not the
`path.join(...)` form the message shows, and not a `path.join` nested in the
call (`readFileSync(path.join(folder, f))` can't be silenced at all). See the
table in `ISSUE.md`.
