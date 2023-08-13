const {
	logger,
	nodeJSBannerBranding,
	em
} = require('./build-logger');

const cliArgument = process.argv[2];

switch (cliArgument) {
	// On init, we trigger nodemon to watch for assets and rely on its
	// `restart` event to re-trigger the necessary build.
	case 'init': {
		const path = require('path');
		const nodemon = require('nodemon');
		const {
			buildCss,
			buildJs,
			copyAssets,
			buildSvgSprites
		} = require('./build-tasks');

		logger.banner('🔍👀 Watching for assets changes', nodeJSBannerBranding);

		nodemon({
			script: 'tooling/watch.js',
			ignore: [
				'*.test.js',
				'*.spec.js'
			],
			watch: [
				'src/js',
				'src/css',
				'src/icons',
				'src/assets'
			],
			ext: '*.*'
		});

		nodemon.on('restart', function (files) {
			// Cherry picks the build operation according to changed file.
			if (path.extname(files[0]) === '.js') {
				logger.info(`Restarting due to ${em('Script')} changes`);
				buildJs().catch(error => {
					logger.failure(error);
				});
			} else if (path.extname(files[0]) === '.scss') {
				logger.info(`Restarting due to Styles ${em('Stylesheet')} changes`);
				buildCss().catch(error => {
					logger.failure(error);
				});
			} else if (files[0].includes('src/icons') || files[0].includes('src/assets/img/illustrations')) {
				logger.info(`Restarting due to ${em('Vectorial image')} changes`);
				buildSvgSprites().catch(error => {
					logger.failure(error);
				});
			} else if (files[0].includes('src/assets')) {
				logger.info(`Restarting due to ${em('Static assets')} changes`);
				copyAssets().catch(error => {
					logger.failure(error);
				});
			}
		});
		break;
	}
	default: {
		// Do not need to do anything beyond init, it is all handled in the
		// `restart` nodemon event ;)
		break;
	}
}
