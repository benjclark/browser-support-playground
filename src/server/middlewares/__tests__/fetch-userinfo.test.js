const nock = require('nock');
const userInfo = require('../../../../mocked-backend/responses/idp-userinfo-200.json');
const {mockRequest} = require('../../../../tooling/test-utils');
const {fetchUserinfo} = require('../fetch-userinfo');
const {loginPageUrl} = require('../..').options;

jest.mock('../../logger');

describe('Fetch userinfo middleware', () => {
	const idpBackend = process.env.IDP_BACKEND;
	let idpScope;

	afterEach(() => {
		nock.cleanAll();
	});

	it(`Calls next() and attach user info when API has all it needs`, async () => {
		idpScope = nock(idpBackend)
			.get(/\/v4\/userinfo/)
			.reply(200, userInfo);

		const request = mockRequest();
		request.accessToken = 'foo';

		const response = {
			locals: {}
		};

		const next = jest.fn();

		await fetchUserinfo()(request, response, next);

		expect(request.user).toEqual(userInfo);
		expect(response.locals.user).toEqual({
			firstName: userInfo.profile.first_name,
			lastName: userInfo.profile.last_name
		});
		expect(next).toHaveBeenCalled();

		idpScope.done();
	});

	it(`Calls response.redirect(loginPageUrl) if accessToken is not present on the request`, async () => {
		const request = mockRequest();

		const response = {
			redirect: jest.fn()
		};

		await fetchUserinfo()(request, response);

		expect(response.redirect).toHaveBeenCalledWith(loginPageUrl);

		idpScope.done();
	});

	// Sad paths of calling the endpoint.
	for (const errorStatus of [400, 401, 403]) {
		describe(`With error status ${errorStatus}`, () => {
			beforeEach(() => {
				idpScope = nock(idpBackend)
					.get(/\/v4\/userinfo/)
					.reply(errorStatus);
			});

			it(`Redirects to the login page if \`v4/userinfo\` endpoint returns status code of ${errorStatus}`, async () => {
				const request = mockRequest();
				request.accessToken = 'foo';

				const response = {
					redirect: jest.fn()
				};

				await fetchUserinfo()(request, response);

				expect(response.redirect).toHaveBeenCalledWith(loginPageUrl);

				idpScope.done();
			});
		});
	}
});
