module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "env": {
    "browser": true,
    "node": true,
    "jest": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
		"project": "tsconfig.eslint.json",
		"tsconfigRootDir": ".",
	},
  "plugins": ["@typescript-eslint"],
  "rules": {
    "quotes": ["error", "double"],
    "no-prototype-builtins": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/await-thenable": 0,
    "@typescript-eslint/type-annotation-spacing": 0
  },
};
