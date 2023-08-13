const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sass = require('sass');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const rollup = require('rollup');
const {loadConfigFile} = require('rollup/dist/loadConfigFile.js');
const svgo = require('svgo');

const {
	logger,
	em,
	sassBannerBranding,
	jsBannerBranding,
	svgoBannerBranding,
	dangerBannerBranding,
	nodeJSBannerBranding
} = require('./build-logger');

/**
 * Gets the time it took from given start date.
 *
 * @param {Object} start - Reference Start date.
 */
function getTimeItTook(start) {
	const stop = Date.now();
	return `${em(`${(stop - start) / 1000}s`)}`;
}

/**
 * Deletes the given path and its content if applicable (recursively).
 *
 * @param {string} pathToDelete - Path to be deleted.
 */
function deletePath(pathToDelete) {
	const stats = fs.statSync(pathToDelete);

	if (stats.isFile()) {
		fs.unlinkSync(pathToDelete);
	} else if (stats.isDirectory()) {
		const fsObjects = fs.readdirSync(pathToDelete);

		for (const fsObject of fsObjects) {
			const fsObjectPath = path.join(pathToDelete, fsObject);
			deletePath(fsObjectPath);
		}
		fs.rmdirSync(pathToDelete);
	}
}

/**
 * Compiles SASS files in accordance to given options.
 *
 * @param {Object} options - Compiling options.
 * @param {string} options.source - Source directory containing SASS files.
 * @param {string} options.destination - Destination directory to compile the file to.
 * @param {Object} options.sassOptions - Valid Sass options object as by Dart Sass documentation.
 * @param {boolean} [options.sourceMap=false] - If `true` Sass will generate source maps.
 * @param {boolean} [options.autoprefixer=false] - If `true` it will autoprefix CSS props according to existing .browserslistrc file or browserlist prop in package.json.
 * @param {string} [options.assetsManifestFile] - Path to the assets manifest file. If passed, it will fingerprint the CSS and add it to the manifest file.
 */
async function compileSassFiles(options) {
	logger.banner('Compiling SASS files to CSS', sassBannerBranding);
	const start = Date.now();

	// Compiles an individual Sass file.
	async function compileSassFile(file, outputFilename, options) {
		const mapFilename = `${outputFilename}.map`;
		const destinationFile = `${options.destination}/${outputFilename}`;

		const sassOptions = {
			file,
			outFile: `${options.destination}/${outputFilename}`,
			sourceMap: options.sourceMap || false,
			includePaths: [],
			outputStyle: 'expanded'
			// Hopefully in a near future (if this issue gets solved https://github.com/sass/sass/issues/2979),
			// we should be able to plug our logger to spit @warn and @debug in the console output as we do for other tasks.
		};

		if (options.sassOptions) {
			sassOptions.includePaths = options.sassOptions.includePaths;
			sassOptions.outputStyle = options.sassOptions.outputStyle;
		}

		const result = sass.renderSync(sassOptions);

		fs.mkdirSync(options.destination, {recursive: true});

		fs.writeFileSync(destinationFile, result.css);
		logger.step(`File has been compiled to CSS`);

		if (options.autoprefixer) {
			// PostCSS library eventually have unhandledRejection, for instance
			// when browserlist is incorrect.
			process.on('unhandledRejection', function (error) {
				throw error;
			});

			const fd = fs.openSync(`${destinationFile}`, 'w+');

			const postCSSOptions = {
				from: file,
				to: destinationFile
			};

			if (options.sourceMap) {
				postCSSOptions.map = {
					prev: result.map.toString(),
					inline: false
				};
			}

			const postCSS = await postcss([autoprefixer]).process(result.css, postCSSOptions);

			for (const warn of postCSS.warnings()) {
				logger.warning(warn.toString());
			}

			fs.writeSync(fd, postCSS.css, 0, postCSS.css.length, 0);
			fs.closeSync(fd, function (error) {
				if (error) {
					throw error;
				}
			});
			logger.step(`CSS file has been autoprefixed`);
		}

		if (options.sourceMap) {
			fs.writeFileSync(`${options.destination}/${mapFilename}`, result.map);
			logger.step(`Source map has been generated`);
		}
	}

	// Compiles Sass files from the given source directory.
	if (fs.existsSync(options.source)) {
		const sassFiles = fs
			.readdirSync(options.source)
			.filter(file => {
				return path.extname(file).toLowerCase() === '.scss';
			});

		logger.info(`Found ${sassFiles.length} SASS file(s) to compile\n`);

		for (const file of sassFiles) {
			const outputFilename = `${path.basename(file, '.scss')}.css`;
			const destinationFile = `${options.destination}/${outputFilename}`;
			logger.info(`Compiling ${em(`${options.source}/${file}`)} to ${em(options.destination)}...`);
			await compileSassFile(`${options.source}/${file}`, outputFilename, options);
			logger.info('After  compileAsset');

			if (options.assetsManifestFile) {
				const fingerprints = await fingerprintFile({
					asset: destinationFile,
					manifestFile: options.assetsManifestFile
				});
				logger.success(`${em(fingerprints.asset)} successfully created in ${getTimeItTook(start)}\n`);
			} else {
				logger.success(`${em(destinationFile)} successfully created in ${getTimeItTook(start)}\n`);
			}
		}
	}
}

/**
 * Bundles browser Javascript in accordance to given rollup config.
 *
 * @param {Object} rollupConfig - A valid rollup configuration.
 * @param {string} [assetsManifestFile] - Path to the assets manifest file. If passed, it will fingerprint the JS bundle and add it to the manifest file.
 */
async function bundleBrowserJS(rollupConfig, assetsManifestFile) {
	logger.banner('Bundling browser Javascript', jsBannerBranding);
	const start = Date.now();

	await loadConfigFile(rollupConfig).then(
		async ({options, warnings}) => {
			logger.info(`Bundling ${em(options.map(option => option.input).join(', '))}`);
			if (warnings.count) {
				// "warnings" wraps the default `onwarn` handler passed by the CLI.
				// This prints all warnings up to this point:
				logger.info(`We currently have ${warnings.count} warnings\n`);

				// This prints all deferred warnings
				warnings.flush();
			}

			// options is an array of "inputOptions" objects with an additional "output"
			// property that contains an array of "outputOptions".
			// The following will generate all outputs for all inputs, and write them to disk the same
			// way the CLI does it:
			for (const option of options) {
				const {output} = option;
				const rollupCacheFilePath = `.rollupCache-${option.input.replace(/\/|\./g, '-')}`;
				let cache;

				if (fs.existsSync(rollupCacheFilePath)) {
					logger.step(`Using cache found rollup cache for ${em(option.input)}`);
					cache = JSON.parse(fs.readFileSync(rollupCacheFilePath));
					option.cache = cache;
				}

				const bundle = await rollup.rollup(option);

				const bundleCache = JSON.stringify(bundle.cache);
				fs.writeFileSync(rollupCacheFilePath, bundleCache);
				logger.step(`Created rollup cache for ${em(option.input)}`);

				await Promise.all(output.map(function (element) {
					return bundle.write(element);
				}));
				for (const out of output) {
					const {
						file,
						sourcemap
					} = out;

					logger.step(`File successfully bundled to ${em(file)}`);

					if (sourcemap && fs.existsSync(`${file}.map`)) {
						logger.step(`Source map has been generated for ${em(file)}`);
					}

					if (assetsManifestFile) {
						const fingerprints = await fingerprintFile({
							asset: file,
							manifestFile: assetsManifestFile
						});
						logger.step(`${em(file)} successfully fingerprinted to ${em(fingerprints.asset)}`);
					}
				}
			}
		}
	);
	logger.success(`Build JS task completed in ${getTimeItTook(start)}`);
}

/**
 * Compiles SVG files to an SVG sprite file.
 *
 * @param {Object[]} options - Compiling options.
 * @param {string} options[].source - Source directory containing SVG files.
 * @param {string} options[].destinationFile - Destination directory to compile the file to.
 * @param {string} [options[].symbolIdPrefix=''] - Prefix prepended to filename (without extension) to create symbol id.
 * @param {Object} options[].svgoOptions - A valid SVGO options object to be used to optimise the SVG files.
 * @param {boolean} [verbose=false] - If `true` logs intermediary steps.
 */
async function compileSVGsToSprites(options, verbose = false) {
	logger.banner('Compiling SVGs into SVG sprites', svgoBannerBranding);
	const start = Date.now();

	for (const option of options) {
		const {
			source,
			destinationFile,
			svgoOptions
		} = option;
		const symbolIdPrefix = option.symbolIdPrefix || '';
		const symbols = [];

		logger.info(`Compiling SVGs from ${em(source)}...`);

		const svgFiles = fs.readdirSync(source).filter(file => path.extname(file).toLowerCase() === '.svg');

		for (const svgFile of svgFiles) {
			const filepath = `${source}/${svgFile}`;
			const svgFileContent = fs.readFileSync(filepath, 'utf8');
			// eslint-disable-next-line new-cap
			const svgProcessor = new svgo(svgoOptions);

			const {data: optimizedSvgFileContent} = await svgProcessor.optimize(svgFileContent, {path: filepath});
			if (verbose) {
				logger.step(`SVG from ${em(path.basename(filepath))} optimised with SVGO`);
			}

			// Turns svgs into symbols.
			const symbol = optimizedSvgFileContent
				.replace(/xmlns="[^"]*"/gm, `id="${symbolIdPrefix}${path.basename(svgFile, '.svg')}"`)
				.replace(/svg/gm, 'symbol');

			symbols.push(symbol);
			if (verbose) {
				logger.step(`SVG from ${em(path.basename(filepath))} turned into a symbol`);
			}
		}
		fs.writeFileSync(destinationFile, `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`);
		logger.step(`SVG sprite saved to ${em(destinationFile)}`);

		logger.success(`Compiled SVGs from ${em(source)} into ${em(destinationFile)} in ${getTimeItTook(start)}`);
	}
}

/**
 * Aims at generating such manifest file.
 *
 * {
 *   "core": {
 *     "css": "core-da39a3e.css"
 *     "js": "core-fb2f132.js"
 *   }
 * }
 *
 * @param {Object} options - Options for the fingerprinting task.
 * @param {string} asset - Path to the asset to be fingerprinted.
 * @param {string} manifestFile - Path to the manifest file that holds the fingerprinting mappings.
 */
function fingerprintFile(options) {
	return new Promise((resolve, reject) => {
		try {
			const startFingerprinting = Date.now();
			let fingerprints = {};
			let manifest = {};
			const {
				asset,
				manifestFile
			} = options;

			if (fs.existsSync(asset)) {
				const hash = crypto.createHash('sha1');
				const filestream = fs.createReadStream(asset, {emitClose: true});

				// Build the hash
				filestream.on('readable', () => {
					const data = filestream.read();
					if (data) {
						hash.update(data);
					}
				});

				filestream.on('close', () => {
					const assetDigest = hash.digest('hex').slice(0, 7); // Keep it short, 7 is enough.
					const assetParentDirectory = asset.slice(0, -path.basename(asset).length);
					const assetExtension = path.extname(asset);
					const assetBasename = path.basename(asset, assetExtension);
					const fingerprintedName = `${assetBasename}-${assetDigest}${assetExtension}`;

					if (fs.existsSync(manifestFile)) {
						const manifestContent = fs.readFileSync(manifestFile, 'utf8');
						manifest = JSON.parse(manifestContent);
					}

					// Updates manifest file.
					if (!manifest[assetBasename]) {
						manifest[assetBasename] = {};
					}
					manifest[assetBasename][assetExtension.slice(1)] = fingerprintedName;

					const fd = fs.openSync(manifestFile, 'w+');
					// eslint-disable-next-line new-cap
					const manifestFileContent = new Buffer.from(JSON.stringify(manifest, null, 2));

					fs.writeSync(fd, manifestFileContent, 0, manifestFileContent.length, 0);
					fs.closeSync(fd, error => {
						if (error) {
							throw error;
						}
					});

					const outputFilepath = `${assetParentDirectory}${
						manifest[assetBasename][assetExtension.slice(1)]
					}`;

					fs.renameSync(asset, outputFilepath);

					const sourceMapFilepath = `${asset}.map`;

					if (fs.existsSync(sourceMapFilepath)) {
						const startMapFingerprinting = Date.now();
						const fingerprintedSourceMapName = `${fingerprintedName}.map`;

						fs.renameSync(
							sourceMapFilepath,
							`${assetParentDirectory}${fingerprintedSourceMapName}`
						);

						const assetContent = fs.readFileSync(outputFilepath, 'utf8');

						const fd = fs.openSync(`${outputFilepath}`, 'w+');
						const newAssetContentString = assetContent.replace(
							/sourceMappingURL=.*$/gm,
							`sourceMappingURL=${fingerprintedSourceMapName}`
						);
						// eslint-disable-next-line new-cap
						const newAssetContent = new Buffer.from(newAssetContentString);

						fs.writeSync(fd, newAssetContent, 0, newAssetContent.length, 0);
						fs.closeSync(fd, error => {
							if (error) {
								throw error;
							}
						});
						logger.step(`Source map ${em(`${asset}.map`)} has been fingerprinted in ${getTimeItTook(startMapFingerprinting)}`);
						fingerprints.map = fingerprintedSourceMapName;
					}

					logger.step(`Asset ${em(asset)} has been fingerprinted in ${getTimeItTook(startFingerprinting)}`);
					fingerprints.asset = `${assetParentDirectory}${fingerprintedName}`;
					return resolve(fingerprints);
				});
			}
		} catch (error) {
			return reject(error);
		}
	});
}

/**
 * Deletes given paths.
 *
 * @param {string[]} pathsToDelete - Paths to be deleted.
 */
async function deletePaths(pathsToDelete) {
	logger.banner('Cleaning ...', dangerBannerBranding);
	const start = Date.now();

	for (const pathToDelete of pathsToDelete) {
		if (fs.existsSync(pathToDelete)) {
			deletePath(pathToDelete);
			logger.step(`${em(pathToDelete)} has been removed`);
		} else {
			logger.step(`${em(pathToDelete)} does not exist`);
		}
	}
	logger.success(`Cleaning done in ${getTimeItTook(start)}`);
}

/**
 * Copies directory from its source to its destination (recursively).
 *
 * @param {string} source - Source directory.
 * @param {string} destination - Destination directory.
 */
function copyDirectory(source, destination) {
	fs.mkdirSync(destination, {recursive: true});
	const fsObjects = fs.readdirSync(source, {withFileTypes: true});

	for (const fsObject of fsObjects) {
		const sourcePath = path.join(source, fsObject.name);
		const destinationPath = path.join(destination, fsObject.name);

		if (fsObject.isDirectory()) {
			copyDirectory(sourcePath, destinationPath);
		} else {
			fs.copyFileSync(sourcePath, destinationPath);
		}
	}
}

/**
 * Copies assets from their source to a destination.
 *
 * @param {Object[]} assets - Path entries.
 * @param {string} assets[].source - Source assets.
 * @param {string} assets[].destination - Destination path for the copy of the asset.
 */
async function copyAssets(assets) {
	logger.banner('Copying assets...', nodeJSBannerBranding);
	const start = Date.now();

	for (const asset of assets) {
		const {
			source,
			destination
		} = asset;

		if (fs.statSync(source).isFile()) {
			fs.copyFileSync(source, destination);
			logger.step(`${em(source)} file has been copied to ${em(destination)}`);
		} else if (fs.statSync(source).isDirectory()) {
			copyDirectory(source, destination);
			logger.step(`${em(source)} directory has been copied to ${em(destination)}`);
		}
	}
	logger.success(`All assets have been copied in ${getTimeItTook(start)}`);
}

module.exports = {
	compileSassFiles,
	bundleBrowserJS,
	compileSVGsToSprites,
	copyAssets,
	deletePaths,
	getTimeItTook
};
