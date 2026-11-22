import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(["dist/**", "node_modules/**"]),
  {
    // This package has no Next pages directory; Link targets are validated by
    // the consuming apps instead.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
]);
