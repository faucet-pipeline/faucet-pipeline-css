let postcss = require("postcss");
let atImport = require("postcss-import");
let assetURL = require("./asset-url");
let { promisify } = require("faucet-pipeline-core/lib/util");
let readFile = promisify(require("fs").readFile);

module.exports = function(input, target, assetManager, sourcemaps, browsers, compact) {
	let plugins = [
		atImport(),
		assetURL({ manifest: assetManager.manifest })
	];

	if(compact) {
		plugins.push(
				require("postcss-discard-comments")(),
				require("postcss-normalize-whitespace")()
		);
	}

	let processor = postcss(plugins);

	let options = {
		from: input,
		target
	};

	if(sourcemaps) {
		options.map = { inline: true };
	}

	return () => {
		return readFile(input).then(code => {
			return processor.process(code, options);
		}).then(result => {
			let warnings = result.warnings();

			if(warnings.length > 0) {
				let errorMessage = warnings.
					map(warning => warning.toString()).
					join("\n");
				throw new Error(errorMessage);
			}

			let includedFiles = result.messages.
				filter(message => message.type === "dependency").
				map(message => message.file);

			return {
				css: result.css,
				stats: {
					includedFiles: [input].concat(includedFiles)
				}
			};
		});
	};
};
