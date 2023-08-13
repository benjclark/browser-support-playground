/* eslint-disable max-nested-callbacks */
const supertest = require('supertest');

/**
 * Creates a mocked Express JS request.
 * Ideal for unit tests.
 *
 * @param {object} options Options map.
 * @param {string} [options.originalUrl='/'] Mock for Express request.originalUrl.
 *
 * @returns {object} Mocked Express JS request.
 */
function mockRequest({originalUrl} = {}) {
	return {
		originalUrl: originalUrl || '/'
	};
}

/**
 * Creates a mocked Express JS response.
 * Ideal for unit tests.
 *
 * @returns {object} Mocked Express JS response.
 */
function mockResponse() {
	const response = {
		locals: {
			featureFlags: {}
		}
	};

	response.status = jest.fn().mockReturnValue(response);
	response.render = jest.fn().mockReturnValue(response);

	return response;
}

/**
 * Generates an object from which allows to issue (GET, POST...) requests and
 * get responses based onto our Express application implementation.
 * Ideal to run integration tests.
 *
 * @param {boolean} isMockedRenderEngine Whether or not the template should be
 * mocked with dummy output or its real content.
 *
 * @returns {object} A supertest request object.
 */
function expressJsRequest(isMockedRenderEngine = true) {
	const {app} = require('../src/server');

	if (isMockedRenderEngine) {
		app.engine('.hbs', jest.fn()
			.mockImplementation((_viewPath, _options, callback) => {
				callback(null, 'dummy output');
			}));
	}

	return supertest(app);
}

/**
* Given a path that lives behind the authentication wall, run a bunch of tests
* focused on validating that the route secured.
*
* @param {string} The path to the route under test.
*/
function checkAuthentication(path) {
	const nock = require('nock');

	const accessTokenData = require('../mocked-backend/responses/idp-token-200.json');
	const userinfoData = require('../mocked-backend/responses/idp-userinfo-200.json');
	const accountWidgetData = require('../mocked-backend/responses/idp-account-widget-200.json');
	const {expressJsRequest} = require('../tooling/test-utils');

	describe('Check authentication for route: ' + path, () => {
		let request;
		const userEmail = '123@123.com';

		const idpBackend = process.env.IDP_BACKEND;
		let idpScope;

		beforeEach(() => {
			request = expressJsRequest();
		});

		afterEach(() => {
			nock.cleanAll();
		});

		afterAll(() => {
			jest.clearAllMocks();
		});

		// eslint-disable-next-line jest/expect-expect
		it('Serves the page with a 200 in best case', () => {
			idpScope = nock(idpBackend)
				.post('/v1/token')
				.reply(200, accessTokenData)
				.get(/\/v4\/userinfo/)
				.reply(200, userinfoData)
				.get(/\/v2\/account-widget/)
				.reply(200, accountWidgetData);

			return request.get(path)
				.set('Cookie', [`idp_session_http=${userEmail}`])
				.send()
				.expect(200)
				.then(() => {
					idpScope.done();
				});
		});

		// eslint-disable-next-line jest/expect-expect
		it('Redirects to login page if IDP cookie is missing', () => {
			return request.get(path)
				.send()
				.expect(302);
		});

		// Sad paths of calling the `/v1/token` endpoint.
		for (const errorStatus of [400, 401, 500]) {
			describe(`When \`/v1/token\` responds with error status ${errorStatus}`, () => {
				beforeEach(() => {
					idpScope = nock(idpBackend)
						.post('/v1/token')
						.reply(errorStatus);
				});

				// eslint-disable-next-line jest/expect-expect
				it(`Redirects to the login page`, async () => {
					return request.get(path)
						.set('Cookie', [`idp_session_http=${userEmail}`])
						.send()
						.expect(302)
						.then(() => {
							idpScope.done();
						});
				});
			});
		}

		// Sad paths of calling the `/v4/userinfo` endpoint.
		for (const errorStatus of [400, 401, 500]) {
			describe(`When \`/v4/userinfo\` responds with error status ${errorStatus}`, () => {
				beforeEach(() => {
					idpScope = nock(idpBackend)
						.post('/v1/token')
						.reply(200, accessTokenData)
						.get(/\/v4\/userinfo/)
						.reply(errorStatus);
				});

				// eslint-disable-next-line jest/expect-expect
				it(`Redirects to the login page`, async () => {
					return request.get(path)
						.set('Cookie', [`idp_session_http=${userEmail}`])
						.send()
						.expect(302)
						.then(() => {
							idpScope.done();
						});
				});
			});
		}

		// Sad paths of calling the `/v2/account-widget` endpoint.
		for (const errorStatus of [400, 401, 500]) {
			describe(`When \`/v2/account-widget\` responds with error status ${errorStatus}`, () => {
				beforeEach(() => {
					idpScope = nock(idpBackend)
						.post('/v1/token')
						.reply(200, accessTokenData)
						.get(/\/v4\/userinfo/)
						.reply(200, userinfoData)
						.get(/\/v2\/account-widget/)
						.reply(errorStatus);
				});

				// eslint-disable-next-line jest/expect-expect
				it(`Redirects to the login page`, async () => {
					return request.get(path)
						.set('Cookie', [`idp_session_http=${userEmail}`])
						.send()
						.expect(302)
						.then(() => {
							idpScope.done();
						});
				});
			});
		}
	});
}

/**
 * Uglifies the given string representation of a GraphQL query by:
 * - Removing any white space in front of commas and add a carriage return behind them.
 * - Making every brace on its own line
 * - Removing every blank lines
 * - Removing leading and traling spaces from each line
 * This makes it easier to compare 2 GraphQL queries for equality.
 *
 * @param {string} query GraphQL query to uglify.
 *
 * @returns {string} The uglified query.
 */
function ugql(query) {
	let uglifiedQuery;

	// Removes any white space in front of commas and add a carriage return behind them.
	uglifiedQuery = query.replace(/\s+(,)|(,)/gm, ',\n');
	// Makes every brace on its own line.
	uglifiedQuery = uglifiedQuery.replace(/([()[\]{}])/gm, '\n$1\n');
	// Remove any blank lines.
	uglifiedQuery = uglifiedQuery.replace(/^\s*\n/gm, '');
	// Remove leading and trailing white spaces from each line.
	uglifiedQuery = uglifiedQuery.replace(/^\s+|\s+$/gm, '');

	return uglifiedQuery;
}

// eslint-disable-next-line jest/no-export
module.exports = {
	mockRequest,
	mockResponse,
	expressJsRequest,
	checkAuthentication,
	ugql
};
