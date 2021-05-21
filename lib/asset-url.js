let ASSET_URL_PATTERN = /asset-url\(['"]?(.*?)['"]?\)/;

module.exports = ({ manifest }) => {
	return {
		postcssPlugin: "postcss-asset-url",
		Declaration(decl) {
			if(ASSET_URL_PATTERN.test(decl.value)) {
				decl.value = decl.value.replace(ASSET_URL_PATTERN,
						(match, url) => `url("${manifest.get(url)}")`);
			}
		}
	};
};
module.exports.postcss = true;
