import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node  // Voeg Node.js globals toe
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
    // Negeer bepaalde folders
    ignores: ["node_modules/**", ".git/**", "data/**"]
  }
];
