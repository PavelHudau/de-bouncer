const path = require('path');

module.exports = {
    entry: {
        'de-bouncer': './src/de-bouncer.ts',
        'de-bouncer.min': './src/de-bouncer.ts'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name]-bundle.js',
        libraryTarget: 'umd',
        library: 'de-bouncer',
        umdNamedDefine: true,
    },
    mode: "production",
}