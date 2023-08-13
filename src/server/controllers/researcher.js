const {queryAPI} = require('../../../tooling/graphql-fetch');
const {checkAPIData} = require('../handlers/error');

const {
	formatPublication
} = require('../../../tooling/data-massage');

const {
	getPublications
} = require('../queries/publication');

const {getResearcher} = require('../queries/researcher');

async function researcherController(request, response, next) {
	const {featureFlags} = response.locals;
	const id = request.user.profile.snid;

	let apiResponse = await queryAPI(getResearcher(id, featureFlags)).then(data => checkAPIData(data, next));

	if (apiResponse) {
		const researcher = apiResponse.researcher;

		const apiResponseForMostRecent = await queryAPI(getPublications({snid: id, sortMode: 'mostRecent', take: 3})).then(data => checkAPIData(data, next));
		let mostRecentPublications = [];

		if (apiResponseForMostRecent) {
			const {publications} = apiResponseForMostRecent;

			// Initialized publications array with formatted publications.
			if (publications.length > 0) {
				mostRecentPublications = publications.map(publication => {
					return formatPublication(publication);
				});
			}
		}

		const {overallUsage} = researcher.publications;

		const viewContext = {
			title: 'Your overview',
			...researcher.profile,
			banner: require('../../server/context-data/demo-announcement'),
			totalFromSN: researcher.publications.totalFromSN,
			latestMetrics: {
				citations: researcher.citations.total,
				overallDownloads: overallUsage.overallDownloads,
				overallViews: overallUsage.overallViews
			},
			mostRecent: mostRecentPublications,
			scripts: [
				{
					file: response.locals.assets.main.js,
					async: false,
					defer: false
				},
				{
					file: response.locals.assets.overview.js,
					async: false,
					defer: true
				}
			]
		};

		// Uncomment to grab context in console output to update ./fixtures/researcher-view.json.
		// console.log(JSON.stringify(viewContext, null, 4));

		return response.render('researcher', viewContext);
	}
}

module.exports = {
	researcherController
};
