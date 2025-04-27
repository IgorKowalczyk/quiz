import base from "./base";
import eslintConfig from "@igorkowalczyk/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
 // prettier
 base,
 eslintConfig.next,
 eslintConfig.react,
 globalIgnores([".next/**"], "Ignore next.js build files"),
 globalIgnores(["components/ui/**"], "Ignore components/ui directory"),
 {
  name: "Override",
  ignores: ["/components/ui/**/*"],
  rules: {
   "@eslint-react/no-array-index-key": "off",
   // Disable rules because of shadcn/ui (waiting for updates)
   "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect": "off",
   "@eslint-react/no-forward-ref": "off",
   "no-use-before-define": "off",
   "react-a11y/heading-has-content": "off",
   "react-a11y/anchor-has-content": "off",
   "@eslint-react/no-use-context": "off",
   "@eslint-react/no-context-provider": "off",
   "typescript/no-empty-object-type": "off",
  },
 },
]);
