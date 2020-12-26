// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = function override(config) {
    config.resolve = {
        ...config.resolve,
        alias: {
            ...config.alias,
            'components': path.resolve(__dirname, 'src/components'),
            'data': path.resolve(__dirname, 'src/data'),
            'internal': path.resolve(__dirname, 'src/internal'),
            'services': path.resolve(__dirname, 'src/services'),
            'styles': path.resolve(__dirname, 'src/styles'),
            'utils': path.resolve(__dirname, 'src/utils')
        },
    };
    return config;
};