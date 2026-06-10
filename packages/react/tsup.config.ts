import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  banner: {
    // The whole package is client-side; keep the directive on the bundle
    // so Next.js App Router treats it as a client module.
    js: '"use client";',
  },
});
