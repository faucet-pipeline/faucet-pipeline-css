"use strict";
let path = require("path");

module.exports = {
	css: [{
		source: "./src/index.css",
		target: "./dist/fingerprint/bundle.css"
	}, {
		source: "./src/index.css",
		target: "./dist/no-fingerprint/bundle.css",
		fingerprint: false
	}],
	manifest: {
		target: "./dist/manifest.json",
		value: f => `/assets/${f}`
	},
	plugins: [path.resolve("../..")]
};
