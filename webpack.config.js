const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const srcDir = 'src';
const tgtDir = 'dist';
const srcFullPath = path.join(__dirname, srcDir);
const tgtFullPath = path.join(__dirname, tgtDir);

module.exports = {
  // debug: true, // Switch loaders to debug mode.
  // cache: false,
  // devtool: 'cheap-module-eval-source-map',
  // devServer: { //can be used to configure the behaviour of webpack-dev-server
  //   contentBase: tgtDir,
  //   historyApiFallback: true
  // }
  entry: {
    polyfill: ['babel-polyfill', 'isomorphic-fetch'], // ES6’s import syntax
    module: path.join(srcFullPath, 'app.js')
  },
  resolve: {
    root: srcFullPath, // don't need to use import ../../../xxx.js
    extensions: ['', '.js'], //require('file') instead of require('file.js')
    modulesDirectories: ['node_modules', srcDir] //resolved to ./
  },
  devServer:{
    contentBase: tgtDir,
    port: 3333
    // ,
    // host: '0.0.0.0',
    // public: 'www.namwkim.org:9000'
  },
  output: {
    path: tgtFullPath,  // Path to where webpack will build stuffs
    publicPath: '', // This is used to generate URLs to e.g. images
    filename: '[name].js' // This is used to name bundled files from entry points.
  },
  module: {
    preLoaders: [{
        test: /\.js?$/,
        loader: 'eslint',
        include: srcFullPath,
      }],
    loaders: [{
        test: /\.js?$/,
        // exclude: /node_modules/,
        include: srcFullPath,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0'] //stage-0 es7 support? async etc
        }
      },{
        test: /\.html$/, loader: "html"
      },{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules')
      },{
        test: /\.(png|jpg|ico)$/,
        loader: 'url-loader?limit=1&name=img/[name].[ext]'
      },
      {
        test: /\.svg$/,
        loader: 'file-loader'
      }
    ]
  },
  eslint: {
    failOnWarning: false,
    failOnError: true,
    fix: true
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
    new ExtractTextPlugin('./css/[name].css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'src/index.html')
    }),
    new CopyWebpackPlugin([
      { from: 'src/libs', to:'libs', force:true},
      { from: 'src/assets', to:'assets', force:true}
    ]),
    new webpack.NoErrorsPlugin()
  ]
};
