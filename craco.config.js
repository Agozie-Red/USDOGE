


const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    buffer: require.resolve('buffer/'),
                    os: require.resolve('os-browserify/browser'),
                    http: require.resolve('stream-http'),
                    https: require.resolve('https-browserify'),
                    stream: require.resolve('stream-browserify'),
                    crypto: require.resolve('crypto-browserify'),
                }
            },
            plugins: [
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer']
                })
            ]
        }
    }
};
