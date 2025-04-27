import eslintConfig from "@igorkowalczyk/eslint-config";
import turboPlugin from "eslint-plugin-turbo";
import { defineConfig } from "eslint/config";

export default defineConfig([
 // prettier
 eslintConfig.base,
 eslintConfig.typescript,
 {
  plugins: {
   turbo: turboPlugin,
  },
  rules: {
   "turbo/no-undeclared-env-vars": "warn",
  },
 },
 eslintConfig.prettier,
]);
