module.exports = {
	assetsManifest() {
		return (_request, response, next) => {
			response.locals.assets = {
				js: 'main.js'
			};
			return next();
		};
	}
};
