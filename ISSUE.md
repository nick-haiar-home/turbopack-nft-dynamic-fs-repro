# Turbopack: recommended `turbopackIgnore` placement does not silence the "Dynamic filesystem access causes tracing of the whole project" warning for `fs(path.join(...))` calls

> Paste-ready for the Next.js "Bug Report" issue form. Section headers map to the
> form's required fields. Replace `<REPRO URL>` with a public repo / CodeSandbox
> before submitting — the form auto-closes issues without a valid reproduction.

## Link to the code that reproduces this issue

`<REPRO URL>`  ← push the attached `turbopack-nft-repro/` to a public GitHub repo
(or CodeSandbox) and paste the link here. It is pinned to `next@canary`.

## To Reproduce

1. `pnpm install` (installs `next@canary`).
2. `pnpm build`.
3. Observe the warning pointing at `lib/loader.js` (the `readdirSync(folder)`
   call) — see below.
4. Apply the **exact** remedy the warning recommends to the folder path:
   `path.join(/* turbopackIgnore: true */ process.cwd(), "data")`. Rebuild →
   **the warning is unchanged.**
5. Move the comment to the `fs` call's bare variable argument —
   `readdirSync(/* turbopackIgnore: true */ folder)` — and rebuild. **That one
   is silenced**, which proves the feature works; but the sibling
   `readFileSync(path.join(folder, f), …)` on the next line still warns and
   cannot be silenced by the comment in either position (before `path.join`, or
   inside it as the message shows).

## Current vs. Expected behavior

**Current** (`next@16.3.0-canary.65`, Turbopack, `output: "standalone"`):

```
Turbopack build encountered 3 warnings:
./lib/loader.js:6:10
Warning: Dynamic filesystem access causes tracing of the whole project
> 6 |   return readdirSync(folder).map((f) =>
    |          ^^^^^^^^^^^^^^^^^^^
...
To resolve this, you can
- make sure they are statically scoped to some subfolder: path.join(process.cwd(), 'data', bar), or
- only use them in development, or
- add ignore comments: path.join(/*turbopackIgnore: true*/ process.cwd(), bar), or
- remove them.
```

The message's headline suggestion is `path.join(/*turbopackIgnore: true*/ …)`,
but the flagged operation is the **`fs` call** (`readdirSync` / `readFileSync`),
not `path.join`. Annotating `path.join` per the message has **no effect**:

| Annotation (per the recommended form) | Result |
|---|---|
| `path.join(/* turbopackIgnore: true */ process.cwd(), "data")` (folder) | warning unchanged |
| `readFileSync(/* turbopackIgnore: true */ path.join(folder, f), …)` | still warns at that line |
| `readFileSync(path.join(/* turbopackIgnore: true */ folder, f), …)` | still warns at that line |
| `readdirSync(/* turbopackIgnore: true */ folder)` (bare variable arg) | **silenced** ✅ |

So `turbopackIgnore` *is* honored, but only when the comment annotates a bare
variable passed directly to the `fs` function — **not** the
`path.join(/*turbopackIgnore: true*/ …)` form the warning explicitly tells you
to use, and not a `path.join(...)` expression nested inside the `fs` call. There
is no documented placement that silences a `readFileSync(path.join(folder, f))`.

**Expected:** the `turbopackIgnore` placement shown in the warning message
should actually suppress the trace for the flagged call — or the message should
point at the expression that can be annotated (the `fs` call's argument), so the
recommended remedy works as written.

## Provide environment information

```
Operating System:
  Platform: linux
  Arch: x64
Binaries:
  Node: 22.22.2
  pnpm: 10.33.0
Relevant Packages:
  next: 16.3.0-canary.65
  react: 19.2.7
  react-dom: 19.2.7
Next.js Config:
  output: standalone
```

## Which area(s) are affected?

Turbopack, Output (export/standalone)

## Which stage(s) are affected?

`next build` (local)

## Additional context

- **Prior art:** [#92639](https://github.com/vercel/next.js/issues/92639)
  reported the same family of warning (then worded "Encountered unexpected file
  in NFT list", flagging `next.config.ts`) and independently found
  `turbopackIgnore: true` had no effect and `--webpack` made it disappear. It
  was auto-closed for an invalid reproduction link, never triaged on the merits.
  Note that **canary has already improved the diagnostics** vs. that report: the
  message now names the dynamic-fs cause and points at the exact source line
  instead of vaguely flagging `next.config`. This issue is the narrower,
  still-present remainder: the *recommended escape hatch placement doesn't work*.
- **Why it matters / motivating case:** the canonical trigger is a library that
  reads files from a runtime-resolved folder at boot — e.g. `drizzle-orm`'s
  `migrate()` reading its migrations folder, which is mandatory when the DB
  lives on a runtime-mounted volume (Fly.io etc.) that doesn't exist at build
  time. There, the `fs` read is inside a `node_modules` dependency you can't
  annotate at all, so the warning has no available remedy and the whole project
  gets traced into the standalone output.
