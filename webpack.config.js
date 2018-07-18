"use strict";

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
	devtool: "source-map",
	entry: "./module/index.js",
	mode: "none",
	output: {
		filename: "js/index.js",
		path: __dirname
	},
	plugins: [
		new UglifyJSPlugin({ sourceMap: true, uglifyOptions: { output: { comments: false } } })
	]
};