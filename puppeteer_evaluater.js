// Solves: https://github.com/zeit/pkg/issues/204
// This is source code for the application
module.exports = {
  evaluate: function (arg) {
    /* eslint-disable */
    const exec = Function(`"use strict"; return (${arg.executable})`)()
    /* eslint-enable */
    const w = window
    w.contract = exec
  }
}
