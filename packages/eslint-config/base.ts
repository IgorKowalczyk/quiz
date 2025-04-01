import eslintConfig from "@igorkowalczyk/eslint-config";
import { Linter } from "eslint";
import turboPlugin from "eslint-plugin-turbo";

export default [
 // prettier
 ...eslintConfig.base,
 ...eslintConfig.typescript,
 {
  plugins: {
   turbo: turboPlugin,
  },
  rules: {
   "turbo/no-undeclared-env-vars": "warn",
  },
 },
 ...eslintConfig.prettier,
] satisfies Linter.Config[];
