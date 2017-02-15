var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        main: './reactStartup.js'
    },
    output: {
        filename: '[name]-bundle.js',
        chunkFilename: '[name]-chunk.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'react-redux/dist/'
    },
    resolve: {
        alias: {
            'simple-react-bootstrap': 'node_modules/simple-react-bootstrap/dist/simple-react-bootstrap.js',
            'jscolor': 'util/jscolor.js'
        },
        modules: [
            path.resolve('./'),
            path.resolve('./node_modules'),
        ]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static'
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: 'node-static',
            minChunks(module, count) {
                var context = module.context;
                return context && context.indexOf('node_modules') >= 0;
            },
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),        

        //*********************************** async chunks*************************

        //catch all - anything used in more than one place
        new webpack.optimize.CommonsChunkPlugin({
            async: 'used-twice',
            minChunks(module, count) {
                return count >= 2;
            },
        }),

        //specifically bundle these large things
        new webpack.optimize.CommonsChunkPlugin({
            async: 'react-dnd',
            minChunks(module, count) {
                var context = module.context;
                var targets = ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend', 'dnd-core']
                return context && context.indexOf('node_modules') >= 0 && targets.find(t => new RegExp('\\\\' + t + '\\\\', 'i').test(context));
            },
        }),
    ],
    devServer: {
        proxy: {
            "/subject": "http://localhost:3000",
            "/tag": "http://localhost:3000",
            "/book": "http://localhost:3000",
            "/static": "http://localhost:3000"
        }
    }
};



module.exportsFINAL = {
    entry: './reactStartup.js',
    context: __dirname,
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            'simple-react-bootstrap': 'node_modules/simple-react-bootstrap/dist/simple-react-bootstrap.js',
            'jscolor': 'util/jscolor.js'
        },
        modules: [
            path.resolve('./'),
            path.resolve('./node_modules'),
        ]
    },
    module: {
        loaders: [
            {
                test: /(\.js$|\.es6$)/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static'
        }),

        new webpack.optimize.CommonsChunkPlugin({
            filename: 'all-node.js',
            async: 'all-node',
            minChunks(module, count) {
                var context = module.context;
                return context && context.indexOf('node_modules') >= 0;
            },
        }),

        new webpack.optimize.CommonsChunkPlugin({
            filename: 'react-dnd.js',
            async: 'react-dnd',
            minChunks(module, count) {
                var context = module.context;
                var targets = ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend']
                return context && context.indexOf('node_modules') >= 0 && targets.find(t => new RegExp('\\\\' + t + '\\\\', 'i').test(context));
            },
        }),
    ]
};