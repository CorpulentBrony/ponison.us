"use strict";

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");

module.exports = {
	devtool: "source-map",
	entry: "./module/index.mjs",
	mode: "none",
	output: {
		filename: "js/index.js",
		path: __dirname
	},
	plugins: [
		new UglifyJSPlugin({
			parallel: true, 
			sourceMap: true, 
			uglifyOptions: { compress: { ecma: 6, keep_classnames: true, keep_fargs: false, passes: 3, toplevel: true }, mangle: { keep_classnames: true, toplevel: true }, output: { comments: false, ecma: 6 } } 
		}),
		new webpack.DefinePlugin({ ["process.env.NODE_ENV"]: JSON.stringify("production") })
	]
};
