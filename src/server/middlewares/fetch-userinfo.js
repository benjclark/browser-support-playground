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
 * Set user info from the Springer Nature identity provider (a.k.a IDP)
 * onto the given request and response objects.
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
function fetchUserinfo(options) {
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
				const userinfoResponse = await fetch(`${idpBackend}/v4/userinfo?client-ip=1.1.1.1`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${request.accessToken}`,
						'User-Agent': `${name}/${version}`
					}
				});

				if (userinfoResponse.status === 200) {
					const user = await userinfoResponse.json();

					request.user = user;

					const {
						first_name: firstName,
						last_name: lastName
					} = user.profile;

					response.locals.user = {
						firstName,
						lastName
					};

					return next();
				}
			}
		} catch (error) {
			logger.warn(`Failed to retrieved userinfo for the given accessToken, ${error.message}`);
		}

		return response.redirect(loginPageUrl);
	};
}

module.exports = {
	fetchUserinfo
};
