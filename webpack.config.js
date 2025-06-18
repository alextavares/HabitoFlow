const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx|mjs)$/,
        exclude: /node_modules\/(?!(react-native.*|@react-native.*|@react-navigation.*|@expo|expo-.*|pretty-format|react-clone-referenced-element|react-native-vector-icons|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './babel.config.web.js',
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/'
          }
        }
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Animated/Animated': 'react-native-web/dist/exports/Animated',
      'react-native/Libraries/Animated/Easing': 'react-native-web/dist/exports/Easing',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native-vector-icons': 'react-native-vector-icons/dist',
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/mocks/async-storage.web.ts'),
      '@react-native-firebase/auth': path.resolve(__dirname, 'src/mocks/firebase-auth.web.ts'),
      '@react-native-firebase/firestore': path.resolve(__dirname, 'src/mocks/firebase-firestore.web.ts'),
      '@react-native-firebase/app': path.resolve(__dirname, 'src/mocks/firebase-app.web.ts'),
      '@react-native-firebase/messaging': path.resolve(__dirname, 'src/mocks/firebase-messaging.web.ts'),
      '@react-native-firebase/storage': path.resolve(__dirname, 'src/mocks/firebase-storage.web.ts'),
      '@react-native-google-signin/google-signin': path.resolve(__dirname, 'src/mocks/google-signin.web.ts'),
      'react-native-push-notification': path.resolve(__dirname, 'src/mocks/push-notification.web.ts'),
      'react-native-splash-screen': path.resolve(__dirname, 'src/mocks/splash-screen.web.ts'),
      '@react-native-community/push-notification-ios': path.resolve(__dirname, 'src/mocks/push-notification-ios.web.ts'),
      'react-native-gesture-handler': 'react-native-gesture-handler/lib/commonjs/RNGestureHandlerModule.web.js',
      'react-native-swipe-list-view': path.resolve(__dirname, 'src/mocks/swipe-list-view.web.ts')
    },
    fallback: {
      "crypto": false,
      "stream": false,
      "assert": false,
      "http": false,
      "https": false,
      "os": false,
      "url": false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __DEV__: true
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    hot: true,
    open: true,
    historyApiFallback: true
  },
  ignoreWarnings: [
    /Failed to parse source map/,
    /require function is used in a way/
  ]
};