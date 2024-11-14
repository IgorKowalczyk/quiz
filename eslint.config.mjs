import eslintConfig from "@igorkowalczyk/eslint-config";

export default [
 ...eslintConfig.base,
 ...eslintConfig.typescript,
 ...eslintConfig.next,
 ...eslintConfig.react,
 ...eslintConfig.prettier,
 {
  ignores: ["**/ui/**"],
 },
];
