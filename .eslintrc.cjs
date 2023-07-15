/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
}
