module.exports = {
	exclude: /node_modules\/(?!(@springernature\/))/, // Exclude node_modules except ones from @springernature
	presets: [
		['@babel/preset-env']
	],
	plugins: [
		'@babel/plugin-proposal-object-rest-spread',
		'@babel/plugin-transform-object-assign'
	],
	env: {
		test: {
			presets: [
				['@babel/preset-env', {
					targets: {
						node: 'current'
					}
				}]
			]
		}
	}
};
