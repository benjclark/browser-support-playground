const fs = require('fs');
const logger = require('../logger');

const defaultOptions = {
	manifestFile: 'assets.json',
	readManifestPerRequest: false
};

/**
 * Creates a middleware that loads an assets manifests file and stores it on the locals, ready for a view to use.
 * @param {object} options - Configuration options
 * @param {string} [options.manifestFile=assets.json] - Path to the manifest JSON file of webpack assets
 * @param {boolean} [options.readManifestPerRequest=false] - Whether to read the manifest file on every request. Only set to true in a development environment
 * @returns {Function} A middleware function.
 */
function assetsManifest(options) {
	options = {
		...defaultOptions,
		...options
	};

	if (options.readManifestPerRequest === true) {
		return (_request, response, next) => {
			try {
				response.locals.assets = JSON.parse(fs.readFileSync(options.manifestFile, 'utf8'));
			} catch (error) {
				error.message = `Could not load asset manifest because of error: ${error.message}, defaulting to an empty manifest.`;
				logger.log('error', error);
				response.locals.assets = {};
			}
			return next();
		};
	}

	let manifest = {};

	try {
		manifest = JSON.parse(fs.readFileSync(options.manifestFile, 'utf8'));
	} catch (error) {
		throw new Error(`Could not load asset manifest file, or file was not valid JSON because of ${error}`);
	}

	return (_request, response, next) => {
		response.locals.assets = manifest;
		return next();
	};
}

module.exports = {assetsManifest};

