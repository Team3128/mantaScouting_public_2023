var path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './Mercy/script.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'mercy-build'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './Mercy/index.html',
      inject: 'body',
    }),
  ],
};