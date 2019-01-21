let postcss = require("postcss");
let helpers = require("postcss-message-helpers");
let ASSET_URL_PATTERN = /asset-url\(['"]?(.*?)['"]?\)/;

module.exports = postcss.plugin("faucet-pipeline-css", ({ manifest }) => {
	return declarationWalker(node => replaceAssetURL(node, manifest));
});

function replaceAssetURL(node, manifest) {
	if(!node.value) {
		return;
	}

	if(ASSET_URL_PATTERN.test(node.value)) {
		node.value = node.value.replace(ASSET_URL_PATTERN,
				(match, url) => `url("${manifest.get(url)}")`);
	}
}

function declarationWalker(fn) {
	return style => {
		style.walkDecls(node => {
			helpers.try(() => fn(node), node.source);
		});
	};
}
