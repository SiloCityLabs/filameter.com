import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    // --- CSS and SCSS Modules ---
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // --- Static File Assets (images, etc.) ---
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@silocitypages/utils$': '<rootDir>/packages/utils/src/index.ts', // Or your actual source entry
    '^@silocitypages/ui-core$': '<rootDir>/packages/ui-core/src/index.ts', // Or your actual source entry
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }] },
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;
