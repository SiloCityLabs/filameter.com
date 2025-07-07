// .eslintrc.cjs (Root of your project)
const config = {
  root: true,
  extends: ['@silocitypages/eslint-config'],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/', // Root dist folder
    'out/', // Root out folder
    'build/', // Root build folder
    '.pnpm/',
    '.pnpm-store/',
    // 'packages/', // Only if you truly want to ignore all packages from root linting
  ],
};

module.exports = config;
