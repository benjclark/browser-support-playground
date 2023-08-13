const fetch = require('node-fetch');
const logger = require('../logger');
const {name, version} = require('../../../package.json');

const {
	LOGIN_PAGE_URL,
	IDP_BACKEND
} = process.env;

const defaultOptions = {
	loginPageUrl: LOGIN_PAGE_URL || '/login',
	idpBackend: IDP_BACKEND
};

/**
 * Set properties from the Springer Nature identity provider (a.k.a IDP)
 * account widget onto the given response object.
 * The user info can be leveraged later in the application.
 *
 * Requirement: An accessToken property must have previously attached to the
 * given request object. (See: fetch-access-token middleware).
 *
 * @param {object} options - Configuration options
 * @param {string} [options.loginPageUrl=process.env.LOGIN_PAGE_URL || /login] - Login page URL.
 * @param {string} [options.idpBackend=process.env.IDP_BACKEND] - Url of the IDP backend.
 *
 * @returns {Function} A middleware function.
 */
function fetchAccountWidget(options) {
	options = {
		...defaultOptions,
		...options
	};

	return async function (request, response, next) {
		const {
			loginPageUrl,
			idpBackend
		} = options;

		try {
			if (request.accessToken) {
				// Log off link support a redirect URI.
				const redirectUri = `${request.protocol}://${request.hostname}${request.originalUrl}`;

				const widgetResponse = await fetch(`${idpBackend}/v2/account-widget?redirect_uri=${redirectUri}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${request.accessToken}`,
						'User-Agent': `${name}/${version}`
					}
				});

				if (widgetResponse.status === 200) {
					const json = await widgetResponse.json();
					json.dataTag = JSON.stringify(json.dataTag);
					response.locals.snAccountWidget = json;

					return next();
				}
			}
		} catch (error) {
			logger.warn(`Failed to retrieved account widget for the given accessToken, ${error.message}`);
		}

		return response.redirect(loginPageUrl);
	};
}

module.exports = {
	fetchAccountWidget
};
