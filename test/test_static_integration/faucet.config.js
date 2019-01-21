"use strict";
let path = require("path");

module.exports = {
	css: [{
		source: "./src/index.css",
		target: "./dist/bundle.css"
	}],
	static: [{
		source: "./src/spacer.gif",
		target: "./dist/spacer.gif"
	}],
	manifest: {
		target: "./dist/manifest.json",
		value: f => `/assets/${f}`
	},
	plugins: {
		css: {
			plugin: path.resolve("../.."),
			bucket: "styles"
		}
	}
};
