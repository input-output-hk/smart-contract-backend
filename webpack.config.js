const path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.ts', '.js' ]
  },
  output: {
    filename: process.env.OUTPUT,
    path: path.resolve(__dirname, 'contract_dist')
  }
}