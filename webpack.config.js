const path = require("path");
const webpack = require('webpack');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
	mode: "development",
	entry: {
		content: "./src/index.js",
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
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
		
	],
};