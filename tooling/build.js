const {
	logger,
	nodeJSBannerBranding
} = require('./build-logger');
const {
	clean,
	buildCss,
	buildJs,
	copyAssets,
	buildSvgSprites
} = require('./build-tasks');
const {getTimeItTook} = require('./build-functions');

const start = Date.now();

clean()
	.then(buildCss)
	.then(buildJs)
	.then(copyAssets)
	.then(buildSvgSprites)
	.then(() => {
		logger.banner(`Build complete in ${getTimeItTook(start)}`, nodeJSBannerBranding);
	})
	.catch(error => {
		logger.failure(error);
	});
