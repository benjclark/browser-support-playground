const path = require('path');
const terser = require('@rollup/plugin-terser');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const {babel} = require('@rollup/plugin-babel');
const {logger} = require('./build-logger');

const outputPlugins = [];

if (process.env.NODE_ENV !== 'development') {
	outputPlugins.push(terser());
}

const plugins = [
	commonjs(),
	babel({
		configFile: path.resolve(__dirname, '../babel.config.js'),
		babelHelpers: 'bundled'
	}),
	nodeResolve() // Locates and bundles third-party dependencies in node_modules
];

function output(file) {
	return [{
		file,
		format: 'iife',
		sourcemap: true,
		plugins: outputPlugins
	}];
}

module.exports = [{
	input: 'src/js/main.js',
	output: output('dist/main.js'),
	plugins
},
{
	input: 'src/js/overview.js',
	output: output('dist/overview.js'),
	onwarn(warning) {
		logger.warning(warning);
	},
	plugins
}];
