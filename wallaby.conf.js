module.exports = function () {
  return {
    files: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      'test/**/*.js',
      'test/**/*.tar.gz'
    ],

    tests: [
      'src/server/**/*.spec.ts'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha'
  }
}
