let postcss = require("postcss");
let helpers = require("postcss-message-helpers");

module.exports = postcss.plugin("faucet-pipeline-css", ({ manifest }) => {
	return declarationWalker(node => replaceAssetURL(node, manifest));
});

function replaceAssetURL(node, manifest) {
	if(!node.value) {
		return;
	}

	node.value = node.value.replace(/asset-url\(['"]?(.*?)['"]?\)/,
			(match, url) => `url("${manifest.get(url)}")`);
}

function declarationWalker(fn) {
	return style => {
		style.walkDecls(node => {
			helpers.try(() => fn(node), node.source);
		});
	};
}
