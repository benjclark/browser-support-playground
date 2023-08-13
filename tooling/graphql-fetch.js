const fetch = require('node-fetch');

const {name, version} = require('../package.json');

/**
 * Issues the fetch request to perform the given GraphQL query and variables.
 *
 * @param {string} query - GraphQL query.
 * @param {object} [variables] - GraphQL variables.
 * @returns {object} Promise that should resolve to data returned by the API.
 */
function queryAPI(query, variables) {
	const body = JSON.stringify({
		query,
		variables
	});

	// Uncomment to grab API calls body
	// console.log(body);

	return fetch(`${process.env.BACKEND}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'User-Agent': `${name}/${version}`
		},
		body
	}).then(async response => {
		const data = await response.json();

		// Uncomment to grab API call data in console output to update ./fixtures/ files.
		// console.log(JSON.stringify(data));

		return data;
	});
}

module.exports = {queryAPI};
