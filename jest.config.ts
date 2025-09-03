import {createDefaultEsmPreset, type JestConfigWithTsJest } from "ts-jest";
import type { Config } from 'jest';



const esmPreset = createDefaultEsmPreset({
  tsconfig: 'tsconfig.json',
  isolatedModules: true,
});

const config: JestConfigWithTsJest & Config = {
  ...esmPreset,
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/src/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts', 
    '!src/server.ts'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/db-setup.ts'],
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'],
}

export default config;
