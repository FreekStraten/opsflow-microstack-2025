import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  pluginJs.configs.recommended,
  {
    files: ["**/__tests__/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  },
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**"]
  }
];

