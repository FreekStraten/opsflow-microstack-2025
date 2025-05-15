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
    // Negeer bepaalde folders
    ignores: ["node_modules/**", ".git/**", "data/**"]
  }
];