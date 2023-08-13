const fetch = require('node-fetch');

const logger = require('../logger');
const {name, version} = require('../../../package.json');

async function setFeatureFlags(_request, response, next) {
	response.locals.featureFlags = {};

	const server = process.env.BANDIERA_URL;

	if (server) {
		const abortController = new AbortController();
		const timeout = setTimeout(() => {
			abortController.abort();
		}, 1000);

		try {
			const bandieraResponse = await fetch(`${server}/api/v2/groups/YOUR-GROUP-NAME-ON-BANDIERA/features`, {
				signal: abortController.signal,
				method: 'GET',
				headers: {
					'User-Agent': `${name}/${version}`
				}
			});

			const {status} = bandieraResponse;

			switch (status) {
				case 200: {
					const features = await bandieraResponse.json();
					response.locals.featureFlags = features.response || {};
					break;
				}
				case 500: {
					throw new Error(`${server} delivers an error when fetching flags`);
				}
				default: {
					throw new Error(`Unexpected response code (${status}) return from ${server} when fetching flags`);
				}
			}
		} catch (error) {
			if (error.name === 'AbortError') {
				logger.warn('Fetch request to Bandiera was aborted because of a timeout');
			} else {
				logger.error(`Unable to fetch feature flags from ${server}, ${error}`);
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	return next();
}

module.exports = {
	setFeatureFlags
};
