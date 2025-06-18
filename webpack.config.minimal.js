const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.web.simple.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            plugins: ['react-native-web']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    static: path.join(__dirname, 'public'),
    compress: true,
    port: 7000,
    hot: true,
    open: true
  }
};