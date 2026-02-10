module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ]
};