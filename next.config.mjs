/** @type {import('next').NextConfig} */
const nextConfig = {
  // `output: "standalone"` runs the file tracer (NFT) that emits the warning.
  output: "standalone",

  // --- Workarounds tested (see ISSUE.md) ---
  // 1) turbopackIgnore comment in lib/loader.js: NO effect on the warning.
  // 2) outputFileTracingExcludes below: suppresses the warning ONLY because it
  //    excludes files we don't need at runtime. It is NOT a usable workaround
  //    when the dynamically-read path is required at runtime (a DB migrator
  //    reading its migrations folder), since you can't exclude those files.
  // outputFileTracingExcludes: {
  //   "**": ["next.config.mjs"],
  // },
};

export default nextConfig;
