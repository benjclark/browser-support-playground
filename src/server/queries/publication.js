/**
 * Format a query to get a list of publications.
 *
 * @param {object} parameters - Parameters for the query to API.
 * @param {string[]} [parameters.publicationIds=[]] - List of ids of the publications to get.
 * @param {string} [parameters.snid=null] - Id of a researcher to get publications from.
 * @param {number} [parameters.take=null] - Number of records we wish to be returned.
 * @param {string} [parameters.sortMode='mostRecent'] - By which mode among mostRecent and mostCited to sort the records by.
 * @param {object} [_flags={}] - Application feature flags as a map map of string:boolean pairs.
 * @returns {string} String representing the GraphQL query to get the publications for the given parameters.
 */
const getPublications = ({publicationIds = [], snid = null, take = null, sortMode = 'mostRecent'}, _flags = {}) => {
	let parameters = '';

	if (publicationIds && publicationIds.length > 0) { // publicationIds has precedence over snid.
		parameters += `ids:[${publicationIds.map(id => `"${id}"`).join(',')}]`;
	} else if (snid) {
		parameters += `snid: "${snid}"`;
	}

	if (parameters.length > 0) {
		const sortModes = {
			mostRecent: 'MOST_RECENT',
			mostCited: 'TOTAL_CITATIONS'
		};

		if (sortModes[sortMode]) {
			parameters += `,sortMode:{mode:${sortModes[sortMode]},order:DESC}`;
		}

		if (Number.isInteger(take)) {
			parameters += `,take:${take}`;
		}
	}

	const query = `
		query getPublicationsQuery {
			publications(${parameters}) {
				id
				title
				publicationDate
				url
			}
		}
	`;

	// Uncomment to grab formatted query in the console to update '../../../fixtures/get-publications.graphql'
	// console.log(query);

	return query;
};

module.exports = {
	getPublications
};
