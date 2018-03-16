const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const commonConfig = {
  node: {
    __dirname: false,
    __filename: false
  },
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.tsx?$/,
        loader: ['babel-loader', 'ts-loader']
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'standard-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
  }
}

module.exports = [
  Object.assign(
    {
      target: 'electron-main',
      entry: { main: './src/main.ts' }
    },
    commonConfig),
  Object.assign(
    {
      target: 'electron-renderer',
      entry: { gui: './src/gui.tsx' },
      plugins: [new HtmlWebpackPlugin()]
    },
    commonConfig)
]