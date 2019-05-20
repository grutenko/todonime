const path = require("path");
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
	return {
		mode: process.env.NODE_ENV || "development",
		entry: {
			content: "./src/entries/index.js",
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
						loader: "babel-loader"
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
					: "./.env.development"
			})
		]
	}
};