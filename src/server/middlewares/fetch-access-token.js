const fetch = require('node-fetch');
const logger = require('../logger');
const {name, version} = require('../../../package.json');

const {
	LOGIN_PAGE_URL,
	IDP_BACKEND,
	IDP_CLIENT_USERNAME,
	IDP_CLIENT_TOKEN,
	IDP_TOKEN_GRANT_TYPE
} = process.env;

const defaultOptions = {
	loginPageUrl: LOGIN_PAGE_URL || '/login',
	idpBackend: IDP_BACKEND,
	clientUsername: IDP_CLIENT_USERNAME,
	clientToken: IDP_CLIENT_TOKEN,
	grantType: IDP_TOKEN_GRANT_TYPE
};

/**
 * Set an access token from the Springer Nature identity provider (a.k.a IDP)
 * onto the given request object.
 * This is also a way to valid the IDP session cookie.
 * The token can be leveraged later in the middleware chain to fetch some user
 * information as well as the account widget.
 *
 * @param {object} options - Configuration options
 * @param {string} [options.loginPageUrl=process.env.LOGIN_PAGE_URL || /login] - Login page URL.
 * @param {string} [options.idpBackend=process.env.IDP_BACKEND] - Url of the IDP backend.
 * @param {string} [options.clientUsername=process.env.IDP_CLIENT_USERNAME] - IDP API client user name.
 * @param {string} [options.clientToken=process.env.IDP_CLIENT_TOKEN] - IDP API client token.
 * @param {string} [options.grantType=process.env.IDP_TOKEN_GRANT_TYPE] - IDP token grant type URL.
 *
 * @returns {Function} A middleware function.
 */
function fetchAccessToken(options) {
	options = {
		...defaultOptions,
		...options
	};

	return async function (request, response, next) {
		const {
			loginPageUrl,
			idpBackend,
			clientUsername,
			clientToken,
			grantType
		} = options;
		const cookieName = request.cookies.idp_session ? 'idp_session' : 'idp_session_http';

		// We have a cookie, is it from a valid user
		if (request.cookies[cookieName]) {
			try {
				const basicAuthToken = Buffer.from(`${clientUsername}:${clientToken}`).toString('base64');

				const body = new URLSearchParams();
				body.append('code', request.cookies[cookieName]);
				body.append('grant_type', grantType);

				const tokenResponse = await fetch(`${idpBackend}/v1/token`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization: `Basic ${basicAuthToken}`,
						'User-Agent': `${name}/${version}`
					},
					body: body.toString()
				});

				// eslint-disable-next-line max-depth
				if (tokenResponse.status === 200) {
					const {
						access_token: accessToken
					} = await tokenResponse.json();

					request.accessToken = accessToken;

					return next();
				}
			} catch (error) {
				logger.warn(`Failed to retrieved the access token, ${error.message}`);
			}
		}

		response.redirect(loginPageUrl);
	};
}

module.exports = {
	fetchAccessToken
};
