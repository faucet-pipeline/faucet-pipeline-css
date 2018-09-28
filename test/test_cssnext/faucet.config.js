"use strict";
let path = require("path");

module.exports = {
	css: [{
		source: "./src/index.css",
		target: "./dist/bundle.css"
	}],
	plugins: {
		css: {
			plugin: path.resolve("../.."),
			bucket: "styles"
		}
	}
};
