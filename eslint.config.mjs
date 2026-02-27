import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  // Default ignores of eslint-config-next:
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
