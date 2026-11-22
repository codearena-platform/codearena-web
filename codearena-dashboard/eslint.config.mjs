import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Pre-existing untyped payloads are tracked as tech debt; keep them visible
    // as warnings instead of blocking every build until the models are defined.
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },
]);

export default eslintConfig;
