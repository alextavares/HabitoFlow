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
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ],
            plugins: [
              'react-native-web'
            ]
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource'
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Utilities/Platform': 'react-native-web/dist/exports/Platform',
      'react-native/Libraries/Components/View/View': 'react-native-web/dist/exports/View',
      'react-native/Libraries/Components/Text/Text': 'react-native-web/dist/exports/Text',
      'react-native/Libraries/Components/ScrollView/ScrollView': 'react-native-web/dist/exports/ScrollView',
      'react-native/Libraries/StyleSheet/StyleSheet': 'react-native-web/dist/exports/StyleSheet',
      'react-native/Libraries/Animated/Animated': 'react-native-web/dist/exports/Animated',
      'react-native/Libraries/Animated/Easing': 'react-native-web/dist/exports/Easing',
      'react-native/Libraries/Utilities/Dimensions': 'react-native-web/dist/exports/Dimensions',
      'react-native/Libraries/Components/Keyboard/Keyboard': 'react-native-web/dist/exports/Keyboard',
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
      'react-native-gesture-handler': path.resolve(__dirname, 'src/mocks/index.ts'),
      'react-native-reanimated': path.resolve(__dirname, 'src/mocks/index.ts'),
      'react-native-screens': path.resolve(__dirname, 'src/mocks/index.ts'),
      'react-native-safe-area-context': path.resolve(__dirname, 'src/mocks/index.ts'),
      'react-native-swipe-list-view': path.resolve(__dirname, 'src/mocks/swipe-list-view.web.ts'),
      'react-native-linear-gradient': path.resolve(__dirname, 'src/mocks/index.ts'),
      'react-native-vector-icons/MaterialIcons': path.resolve(__dirname, 'src/mocks/index.ts'),
      'react-native-vector-icons/Feather': path.resolve(__dirname, 'src/mocks/index.ts'),
      'react-native-canvas': path.resolve(__dirname, 'src/mocks/index.ts')
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
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    hot: true,
    open: false,
    historyApiFallback: true
  }
};