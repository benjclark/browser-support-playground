/* eslint-disable max-nested-callbacks */
const nock = require('nock');
const tokenResponse = require('../../../../mocked-backend/responses/idp-token-200.json');
const {fetchAccessToken} = require('../fetch-access-token');
const {loginPageUrl} = require('../..').options;

jest.mock('../../logger');

describe('Fetch access token middleware', () => {
	const idpBackend = process.env.IDP_BACKEND;
	let idpScope;

	afterEach(() => {
		nock.cleanAll();
	});

	const cookies = ['idp_session_http', 'idp_session'];

	for (const cookie of cookies) {
		describe(`With cookie ${cookie}`, () => {
			it(`Calls next() if access token can be retrieved`, async () => {
				idpScope = nock(idpBackend)
					.post('/v1/token')
					.reply(200, tokenResponse);

				const request = {
					cookies: {}
				};
				request.cookies[cookie] = 'a-valid-session-id';

				const next = jest.fn();

				await fetchAccessToken()(request, undefined, next);

				expect(request.accessToken).toEqual(tokenResponse.access_token);
				expect(next).toHaveBeenCalled();

				idpScope.done();
			});

			// Sad paths of calling the endpoint.
			for (const errorStatus of [400, 401, 500]) {
				describe(`With error status ${errorStatus}`, () => {
					beforeEach(() => {
						idpScope = nock(idpBackend)
							.post('/v1/token')
							.reply(errorStatus);
					});

					it(`Redirects to the login page if \`v1/token\` endpoint returns status code of ${errorStatus}`, async () => {
						const request = {
							cookies: {}
						};
						request.cookies[cookie] = 'baz';

						const response = {
							redirect: jest.fn()
						};

						await fetchAccessToken()(request, response);

						expect(response.redirect).toHaveBeenCalledWith(loginPageUrl);

						idpScope.done();
					});
				});
			}
		});
	}

	it(`Calls response.redirect(loginPageUrl) cookie is none of IDP's supported cookies`, async () => {
		const request = {
			cookies: {}
		};
		request.cookies.foo = 'baz';

		const response = {
			redirect: jest.fn()
		};

		await fetchAccessToken()(request, response);

		expect(response.redirect).toHaveBeenCalledWith(loginPageUrl);
	});
});
