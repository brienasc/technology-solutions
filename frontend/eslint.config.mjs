import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";

export default [
  {
    files: ["**/*.ts"],
    extends: ["plugin:@angular-eslint/recommended"],
  },
  {
    files: ["**/*.html"],
    extends: ["plugin:@angular-eslint/template/recommended"],
  },
];
