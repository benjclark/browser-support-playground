async function glossaryController(_request, response, next) {
	if (!response.locals.featureFlags.enableGlossaryPage) {
		return next();
	}

	const viewContext = {
		title: 'Glossary',
		banner: require('../../server/context-data/demo-announcement')
	};

	return response.render('glossary', viewContext);
}

module.exports = {
	glossaryController
};
