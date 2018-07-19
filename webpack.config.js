"use strict";

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");

module.exports = {
	devtool: "source-map",
	entry: "./module/index.mjs",
	mode: "production",
	output: {
		filename: "js/index.js",
		path: __dirname
	},
	plugins: [
		new UglifyJSPlugin({ sourceMap: true, uglifyOptions: { output: { comments: false } } }),
		new webpack.DefinePlugin({ ["process.env.NODE_ENV"]: JSON.stringify("production") })
	]
};
