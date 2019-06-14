const path = require("path");
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
var os = require('os');
var UglifyJsParallelPlugin = require('webpack-uglify-parallel');

module.exports = (env, argv) => {
	return {
		mode: process.env.NODE_ENV || "development",
		entry: {
			content: "./src/entries/index.js",
			inject: "./src/entries/inject.js",
			'shikimori-inject': "./src/entries/shikimori-inject.js",
			background: "./src/entries/background.js",
			settings: "./src/entries/settings.js"
		},
		output: {
			path: path.resolve(__dirname, "public/js"),
			filename: "[name].js",
			publicPath: "/public/assets"
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							cacheDirectory: true
						}
					}
				}
			]
		},
		resolve: {
		    modules: ['node_modules', 'src'],
		    extensions: ['.js', '.jsx'],
		},
		plugins: [
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jquery'
			}),
			new Dotenv({
				path: argv.mode == "production"
					? "./.env.production"
					: "./.env.development",
				safe: true
			}),
			new UglifyJsParallelPlugin({
        workers: os.cpus().length,
      }),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
		],
		optimization: {
  	  minimizer: [
	      new TerserPlugin({
	        cache: true,
	        parallel: true,
	        sourceMap: false, // Must be set to true if using source-maps in production
	        extractComments: false,
	        terserOptions: {
	          ecma: undefined,
	          warnings: false,
	          parse: {},
	          compress: {},
	          mangle: true, // Note `mangle.properties` is `false` by default.
	          module: false,
	          output: null,
	          toplevel: false,
	          nameCache: null,
	          ie8: false,
	          keep_classnames: undefined,
	          keep_fnames: false,
	          safari10: false,
	        }
	      }),
	    ],
  	}
	}
};
