const getResearcher = (id, _flags = {}) => {
	const query = `
		query getResearcherQuery {
			researcher(id: "${id}") {
				profile {
					firstname
				}
				citations {
					total
				}
				publications {
					totalFromSN
					overallUsage {
						overallDownloads,
						overallViews
					}
				}
			}
		}
	`;

	// Uncomment to grab formatted query in the console to update '../../../fixtures/get-researcher.graphql'
	// console.log(query);

	return query;
};

module.exports = {
	getResearcher
};
