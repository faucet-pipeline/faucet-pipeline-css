let { abort } = require("faucet-pipeline-core/lib/util");
let path = require("path");
let makePostCSS = require("./make-postcss");

module.exports = (config, assetManager, { browsers, compact, sourcemaps } = {}) => {
	let bundlers = config.map(bundleConfig =>
		makeBundler(bundleConfig, assetManager, { browsers, compact, sourcemaps }));

	return filepaths => Promise.all(bundlers.map(bundle => bundle(filepaths)));
};

function makeBundler(config, assetManager, { browsers, compact, sourcemaps } = {}) {
	let { browserslist, fingerprint } = config;

	if(!config.source || !config.target) {
		abort("ERROR: CSS configuration requires both target and source");
	}

	let source = assetManager.resolvePath(config.source);
	let target = assetManager.resolvePath(config.target, { enforceRelative: true });

	if(browserslist === false) {
		browsers = null;
	} else if(browserslist) {
		browsers = browsers[browserslist];
	} else {
		browsers = browsers.defaults;
	}

	let postCSS = makePostCSS(source, target, assetManager, sourcemaps, browsers);

	let previouslyIncludedFiles;

	return filepaths => {
		// If this is the first run or the changed file is one of the
		// previously included ones, run the compiler
		if(previouslyIncluded(filepaths, previouslyIncludedFiles)) {
			postCSS().
				then(result => {
					previouslyIncludedFiles = result.stats.includedFiles.
						map(filepath => path.normalize(filepath));

					let options = {};
					if(fingerprint !== undefined) {
						options.fingerprint = fingerprint;
					}
					assetManager.writeFile(target, result.css, options);
				}).
				catch(error => {
					let options = { error };
					if(fingerprint !== undefined) {
						options.fingerprint = fingerprint;
					}
					assetManager.writeFile(target, errorOutput(error.message,
							assetManager.referenceDir),
					options);
				});
		}
	};
}

function previouslyIncluded(filepaths, previouslyIncludedFiles) {
	return previouslyIncludedFiles === undefined ||
		filepaths.some(filepath => {
			return previouslyIncludedFiles.
				find(candidate => candidate === path.normalize(filepath));
		});
}

let MESSAGE_PATTERN = /^(\S+)(:\d+:\d+:)\s+(.+)$/;

function errorOutput(message, referenceDir) {
	let match = MESSAGE_PATTERN.exec(message);
	if(match) {
		// eslint-disable-next-line no-unused-vars
		let [_, file, locator, description] = match;
		message = `${path.relative(referenceDir, file)}${locator} ${description}`;
	}

	return `body:before {
	content: "\\26a0  CSS Error: ${message.replace(/"/g, "'").replace(/\s+/g, " ")}";
	font-weight: bold;
	display: block;
	border: 5px solid red;
	padding: 5px;
}\n`;
}
