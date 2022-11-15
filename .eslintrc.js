module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2017: true,
  },
  extends: [
    "eslint:recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 8,
  },
  rules: {
    indent: ["error", 2, { "SwitchCase": 1 }],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    "operator-linebreak": ["error", "before"],
    semi: ["error", "always"],
    "no-constant-condition": ["error", { checkLoops: false }],
  },
};
