module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\.spec\.ts$',
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.port.ts',
    '!src/test/**',
    '!src/**/index.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  verbose: true,
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
}; 