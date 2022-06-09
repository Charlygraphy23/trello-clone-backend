module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
    "prettier",
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    semi: ['error', 'always'],
    'import/no-unresolved': 0,
    quotes: ['error', 'single', { avoidEscape: true }],
    'linebreak-style': 0,
    'import/extensions': 0,
    'arrow-body-style': ['error', 'as-needed'],
    'consistent-return': 0,
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es6',
        semi: true,
        tabWidth: 2,
        singleQuote: true,
        endOfLine: 'auto',
        printWidth: 80,
        quoteProps: 'consistent',
        bracketSameLine: false,
        parser: 'typescript',
      },
    ],
  },
};
