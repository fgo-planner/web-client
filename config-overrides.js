const path = require('path');

module.exports = function override(config) {
    config.resolve = {
        ...config.resolve,
        alias: {
            ...config.alias,
            'internal': path.resolve(__dirname, 'src/internal'),
            'components': path.resolve(__dirname, 'src/components')
        },
    };
    return config;
};