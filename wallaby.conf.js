module.exports = function () {
  return {
    files: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      'test/**/*.js',
      'test/**/*.tar.gz'
    ],

    tests: [
      'src/**/*.spec.ts'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha',
    setup: function (wallaby) {
      wallaby.testFramework.timeout(60000)
    }
  }
}
