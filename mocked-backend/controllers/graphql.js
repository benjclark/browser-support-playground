/* eslint-disable quote-props */
const path = require('path');
const graphqlQueryMatcher = require('../graphql-query-matcher');

module.exports = function (request, response, next) {
	const matches = Object.keys(graphqlQueryMatcher).filter(regex => {
		const regexp = new RegExp(regex, 'gm');
		return regexp.test(JSON.stringify(request.body.query));
	});

	if (matches.length > 0) {
		const {status, stub} = graphqlQueryMatcher[matches[0]];
		const responseBody = require(path.resolve(__dirname, `../responses/${stub}`));
		if (responseBody) {
			// Simulates backend response latency...
			setTimeout(() => {
				console.log(`Mocking with status: ${status} and stub: ${stub}`);
				return response.status(status).json(responseBody);
			}, 0);
		} else {
			console.log(`Could not find mock with status: ${status} and stub: ${stub}`);
			return next();
		}
	} else {
		return next();
	}
};
