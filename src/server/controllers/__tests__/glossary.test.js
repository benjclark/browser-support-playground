const nock = require('nock');
const userinfoData = require('../../../../mocked-backend/responses/idp-userinfo-200.json');
const accessTokenData = require('../../../../mocked-backend/responses/idp-token-200.json');
const accountWidgetData = require('../../../../mocked-backend/responses/idp-account-widget-200.json');
const {checkAuthentication} = require('../../../../tooling/test-utils');

jest.mock('../../logger');

describe('Glossary route', () => {
	const userEmail = '123@123.com';

	const idpBackend = process.env.IDP_BACKEND;
	let idpScope;

	afterEach(() => {
		nock.cleanAll();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	describe('with enableGlossaryPage flag ON', () => {
		beforeAll(() => {
			jest.resetModules();
			jest.mock('../../middlewares/feature-flags', () => {
				return {
					setFeatureFlags: (_request, response, next) => {
						response.locals.featureFlags = require('../../../../mocked-backend/responses/feature-flags.json').response;

						// Overrides the fixture one.
						response.locals.featureFlags = Object.assign(response.locals.featureFlags, {
							enableGlossaryPage: true
						});
						next();
					}
				};
			});
		});

		describe('Authentication checks', () => {
			checkAuthentication('/glossary');
		});
	});

	// ==============================================

	describe('with enableGlossaryPage flag OFF', () => {
		beforeAll(() => {
			jest.resetModules();
			jest.mock('../../middlewares/feature-flags', () => {
				return {
					setFeatureFlags: (_request, response, next) => {
						response.locals.featureFlags = require('../../../../mocked-backend/responses/feature-flags.json').response;

						// Overrides the fixture one.
						response.locals.featureFlags = Object.assign(response.locals.featureFlags, {
							enableGlossaryPage: false
						});
						next();
					}
				};
			});
		});

		beforeEach(() => {
			idpScope = nock(idpBackend)
				.post('/v1/token')
				.reply(200, accessTokenData)
				.get(/\/v4\/userinfo/)
				.reply(200, userinfoData)
				.get(/\/v2\/account-widget/)
				.reply(200, accountWidgetData);
		});

		// eslint-disable-next-line jest/expect-expect
		it('Serves a 404', () => {
			const {expressJsRequest} = require('../../../../tooling/test-utils');

			return expressJsRequest().get('/glossary')
				.set('Cookie', [`idp_session_http=${userEmail}`])
				.send()
				.expect(404)
				.then(() => {
					idpScope.done();
				});
		});
	});
});
