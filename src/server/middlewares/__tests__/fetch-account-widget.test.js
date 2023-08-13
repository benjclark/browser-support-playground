const nock = require('nock');
const accountWidget = require('../../../../mocked-backend/responses/idp-account-widget-200.json');
const {mockRequest} = require('../../../../tooling/test-utils');
const {fetchAccountWidget} = require('../fetch-account-widget');
const {loginPageUrl} = require('../..').options;

jest.mock('../../logger');

describe('Fetch account widget middleware', () => {
	const idpBackend = process.env.IDP_BACKEND;
	let idpScope;

	afterEach(() => {
		nock.cleanAll();
	});

	it(`Calls next() and attach account widget when API has all it needs`, async () => {
		idpScope = nock(idpBackend)
			.get(/\/v2\/account-widget/)
			.reply(200, accountWidget);

		const request = {
			...mockRequest('baz'),
			accessToken: 'foo',
			protocol: 'http',
			hostname: 'bar'
		};

		const response = {
			locals: {}
		};

		const next = jest.fn();

		await fetchAccountWidget()(request, response, next);

		expect(response.locals.snAccountWidget.link).toEqual(accountWidget.link);
		expect(next).toHaveBeenCalled();

		idpScope.done();
	});

	it(`Calls response.redirect(loginPageUrl) if accessToken is not present on the request`, async () => {
		const request = mockRequest();

		const response = {
			redirect: jest.fn()
		};

		await fetchAccountWidget()(request, response);

		expect(response.redirect).toHaveBeenCalledWith(loginPageUrl);

		idpScope.done();
	});

	// Sad paths of calling the endpoint.
	for (const errorStatus of [400, 401, 403]) {
		describe(`With error status ${errorStatus}`, () => {
			beforeEach(() => {
				idpScope = nock(idpBackend)
					.get(/\/v2\/account-widget/)
					.reply(errorStatus);
			});

			it(`Redirects to the login page if \`v2/account-widget\` endpoint returns status code of ${errorStatus}`, async () => {
				const request = {
					accessToken: 'foo',
					protocol: 'http',
					hostname: 'bar',
					originalUrl: 'baz'
				};

				const response = {
					redirect: jest.fn()
				};

				await fetchAccountWidget()(request, response);

				expect(response.redirect).toHaveBeenCalledWith(loginPageUrl);

				idpScope.done();
			});
		});
	}
});
