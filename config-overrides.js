/**
 * This file is used by `react-app-rewired` to override the `create-react-app`
 * webpack config file. This is needed because webpack < 5 used to include
 * polyfills for node.js, but doesn't do so anymore (react-scripts 5.x uses
 * webpack 5.x+).
 * 
 * @see https://github.com/facebook/create-react-app/issues/11756
 * @see https://blog.alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
 */

/** */
const webpack = require('webpack');

module.exports = function override(config) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        'assert': require.resolve('assert'),
        'crypto': require.resolve('crypto-browserify'),
        'http': require.resolve('stream-http'),
        'https': require.resolve('https-browserify'),
        'os': require.resolve('os-browserify'),
        'stream': require.resolve('stream-browserify'),
        'url': require.resolve('url'),
        'util': require.resolve('util/')
    };
    config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ];
    /*
     * The following rule was needed to fix the following issue: `The request
     * 'process/browser' failed to resolve only because it was resolved as fully
     * specified`.
     */
    config.module.rules = [
        ...(config.module.rules || []),
        {
            test: /\.m?js/,
            resolve: {
                fullySpecified: false
            }
        }
    ];
    return config;
};