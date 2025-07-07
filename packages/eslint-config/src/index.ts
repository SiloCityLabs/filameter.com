const config = {
  extends: ['next/core-web-vitals', 'next/typescript', 'plugin:@typescript-eslint/recommended'],
  settings: { react: { version: 'detect' } },
  overrides: [
    {
      files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
      env: { jest: true, node: true },
      rules: { 'jest/valid-expect': 'off' },
    },
  ],
  ignorePatterns: ['node_modules/', '.next/', 'dist/', 'out/', 'build/'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};

export default config;
