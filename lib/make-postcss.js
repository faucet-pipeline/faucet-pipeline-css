let postcss = require("postcss");
let atImport = require("postcss-import");
let assetURL = require("./asset-url");
let { promisify } = require("faucet-pipeline-core/lib/util");
let readFile = promisify(require("fs").readFile);

module.exports = function(input, target, assetManager, sourcemaps, browsers) {
	// if(browsers && browsers.length > 0) {
	// let filepath = path.relative(assetManager.referenceDir, input);
	// console.error(`compiling CSS ${repr(filepath)} for ${browsers.join(", ")}`);

	let processor = postcss([
		atImport(),
		assetURL({ manifest: assetManager.manifest })
	]);

	let options = {
		from: input,
		target: target
	};

	if(sourcemaps) {
		options.map = { inline: true };
	}

	return () => {
		return readFile(input).then(code => {
			return processor.process(code, options);
		}).then(result => {
			let warnings = result.warnings();

			// TODO: Maybe do the manipulation of the message here
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
