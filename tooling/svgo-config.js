/**
 * Builds an object that is suitable for SVGOptimizer.
 *
 * Feel free to adapt to your needs.
 *
 * @param {boolean} removeFillColor - Whether or not the fill color should be remove in the output.
 * @returns {object} SVGOptimizer config.
 */
const svgoOptions = (removeFillColor = false) => {
	const options = {
		plugins: [
			{
				cleanupAttrs: true
			},
			{
				removeDoctype: true
			},
			{
				removeXMLProcInst: true
			},
			{
				removeComments: true
			},
			{
				removeMetadata: true
			},
			{
				removeTitle: true
			},
			{
				removeDesc: true
			},
			{
				removeUselessDefs: true
			},
			{
				removeEditorsNSData: true
			},
			{
				removeEmptyAttrs: true
			},
			{
				removeHiddenElems: true
			},
			{
				removeEmptyText: true
			},
			{
				removeEmptyContainers: true
			},
			{
				removeViewBox: false
			},
			{
				cleanupEnableBackground: true
			},
			{
				convertStyleToAttrs: true
			},
			{
				convertColors: true
			},
			{
				convertPathData: true
			},
			{
				convertTransform: true
			},
			{
				removeUnknownsAndDefaults: true
			},
			{
				removeNonInheritableGroupAttrs: true
			},
			{
				removeUselessStrokeAndFill: true
			},
			{
				removeUnusedNS: true
			},
			{
				cleanupIDs: {
					// Avoids "duplicate IDs" error on the svg
					prefix: {
						toString() {
							return `${Math.random().toString(36).slice(2, 9)}`;
						}
					}
				}
			},
			{
				cleanupNumericValues: true
			},
			{
				moveElemsAttrsToGroup: true
			},
			{
				moveGroupAttrsToElems: true
			},
			{
				collapseGroups: true
			},
			{
				removeRasterImages: false
			},
			{
				mergePaths: true
			},
			{
				convertShapeToPath: true
			},
			{
				sortAttrs: true
			},
			{
				removeDimensions: true
			}
		]
	};

	let removeAttributes = '';

	if (removeFillColor) {
		removeAttributes += 'stroke|fill';
	}

	options.plugins.push({
		removeAttrs: {
			attrs: removeAttributes
		}
	});
	return options;
};

module.exports = {
	svgoOptions
};
