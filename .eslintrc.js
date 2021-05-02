module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2017: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 8,
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-constant-condition": ["error", { checkLoops: false }],
  },
};
