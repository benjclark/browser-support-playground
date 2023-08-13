async function clean() {
	const {deletePaths} = require('./build-functions');

	const pathsToDelete = [
		'dist'
	];

	await deletePaths(pathsToDelete);
}

async function buildCss() {
	const {compileSassFiles} = require('./build-functions');

	const options = {
		source: 'src/css',
		destination: 'dist',
		sassOptions: {
			outputStyle: 'compressed',
			includePaths: [
				'node_modules'
			]
		},
		sourceMap: true,
		autoprefixer: true, // Make sure to have a .browserslistrc file or a browserlist property in your package.json.
		assetsManifestFile: 'dist/assets.json'
	};

	await compileSassFiles(options);
}

async function buildJs() {
	const path = require('path');
	const {bundleBrowserJS} = require('./build-functions');

	await bundleBrowserJS(path.resolve(__dirname, 'rollup.config.js'), 'dist/assets.json');
}

async function buildSvgSprites() {
	const {compileSVGsToSprites} = require('./build-functions');
	const {svgoOptions} = require('./svgo-config');

	const options = [{
		source: 'src/icons',
		destinationFile: 'src/view/partials/icons-sprite.hbs',
		symbolIdPrefix: 'icon-',
		svgoOptions: svgoOptions(true)
	}, {
		source: 'src/assets/img/illustrations',
		destinationFile: 'src/view/partials/illustrations-sprite.hbs',
		svgoOptions: svgoOptions()
	}];

	await compileSVGsToSprites(options);
}

async function copyAssets() {
	const {copyAssets} = require('./build-functions');

	const assets = [
		{
			source: 'src/assets/img',
			destination: 'dist/img'
		},
		{
			source: 'src/assets/fonts',
			destination: 'dist/fonts'
		},
		{
			source: 'src/assets/browserconfig.xml',
			destination: 'dist/browserconfig.xml'
		},
		{
			source: 'src/assets/manifest.json',
			destination: 'dist/manifest.json'
		}
	];

	await copyAssets(assets);
}

module.exports = {
	clean,
	buildCss,
	buildJs,
	copyAssets,
	buildSvgSprites
};
