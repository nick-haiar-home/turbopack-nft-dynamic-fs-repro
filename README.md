# turbopack-nft-dynamic-fs-repro

Minimal reproduction for a Turbopack file-tracing warning. Pinned to
`next@canary` (required by Next's bug-report form).

## Run

```bash
pnpm install
pnpm build
```

Observe (on `next@16.3.0-canary.65`):

```
Turbopack build encountered 3 warnings:
./lib/loader.js
Warning: Dynamic filesystem access causes tracing of the whole project
```

## What it shows

`lib/loader.js` does a runtime-resolved `fs` read (stand-in for a DB migrator
reading its migrations folder). For `output: "standalone"`, Turbopack can't
bound the read and traces the whole project, so it warns.

Tracked in [vercel/next.js#95125](https://github.com/vercel/next.js/issues/95125).

## Status (`next@16.3.0-canary.65`, incl. #94361)

`turbopackIgnore` now silences a bare-variable `fs` argument. The remaining gap
is the `readFileSync(path.join(folder, f))` shape — the form `drizzle`'s
`migrate()` uses — where no comment placement clears the warning:

| Annotation | Result |
|---|---|
| `readdirSync(/* turbopackIgnore: true */ folder)` (bare variable) | silenced ✅ |
| `readFileSync(/* turbopackIgnore: true */ path.join(folder, f), …)` | still warns |
| `readFileSync(path.join(/* turbopackIgnore: true */ folder, f), …)` | still warns |
| hoist both args into annotated variables | one residual warning |

Per maintainer feedback on the issue, the `path.join(/*turbopackIgnore: true*/ …)`
shown in the warning is illustrating the comment *syntax*, not a directive to
annotate `path.join`; the message wording is being improved.
