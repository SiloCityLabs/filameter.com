// .eslintrc.cjs (Root of your project)
const config = {
  root: true,
  extends: ['@silocitypages/eslint-config'],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'out/',
    'build/',
    '.pnpm/',
    '.pnpm-store/',
    'packages/',
  ],
  // Add this 'rules' section to override the default behavior
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn', // or 'error'
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
  },
};

module.exports = config;
