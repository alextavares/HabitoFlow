module.exports = {
  presets: [
    ['@babel/preset-env', {
      loose: true,
      modules: false
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    'react-native-web',
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true
    }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }]
  ]
};