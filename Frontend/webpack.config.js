const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
    },
    resolve: {
      fallback: {
        buffer: false,
        crypto: false,
      },
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
