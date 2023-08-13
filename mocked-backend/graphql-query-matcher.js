/* eslint-disable quote-props */
module.exports = {
	// getResearcher query
	'getResearcherQuery': {
		status: 200,
		stub: 'researcher.json'
	},
	// getPublications query
	// 'getPublicationsQuery': {
	'.*publications\\(snid.*MOST_RECENT.*DESC.*take:3': {
		status: 200,
		stub: 'dynamic-publications.js'
	}
};
