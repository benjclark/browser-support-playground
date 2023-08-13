/* eslint-disable camelcase */
const nock = require('nock');
const featureFlagsData = require('../../../../mocked-backend/responses/feature-flags.json');
const userinfoData = require('../../../../mocked-backend/responses/idp-userinfo-200.json');
const accessTokenData = require('../../../../mocked-backend/responses/idp-token-200.json');
const accountWidgetData = require('../../../../mocked-backend/responses/idp-account-widget-200.json');
const {expressJsRequest} = require('../../../../tooling/test-utils');
const {
	httpIncomingRequestsTotal,
	httpIncomingRequestsDurationSeconds
} = require('../../prometheus-metrics.js');

jest.mock('../../prometheus-metrics');

describe('Prometheus middleware', () => {
	let request;
	const originalEnvironmentVariables = process.env;
	const userEmail = '123@123.com';

	const idpBackend = process.env.IDP_BACKEND;
	const bandieraBackend = process.env.BANDIERA_URL;
	let idpScope;
	let bandieraScope;

	beforeEach(() => {
		idpScope = nock(idpBackend)
			.post('/v1/token')
			.reply(200, accessTokenData)
			.get(/\/v4\/userinfo/)
			.reply(200, userinfoData)
			.get(/\/v2\/account-widget/)
			.reply(200, accountWidgetData);

		bandieraScope = nock(bandieraBackend)
			.get('/api/v2/groups/YOUR-GROUP-NAME-ON-BANDIERA/features')
			.reply(200, featureFlagsData);

		request = expressJsRequest(false);
		process.env = {...originalEnvironmentVariables};
	});

	afterEach(() => {
		nock.cleanAll();
		jest.clearAllMocks();
		process.env = originalEnvironmentVariables;
	});

	it('Metrics are incremented or observed', () => {
		process.env.NODE_ENV = 'production';

		return request.get('/glossary')
			.set('Cookie', [`idp_session_http=${userEmail}`])
			.send()
			.expect(200)
			.then(_response => {
				const labels = {
					http_status: 200,
					request_path: '/glossary'
				};

				expect(httpIncomingRequestsTotal.inc).toHaveBeenCalledWith(labels);

				const [requestsDurationObserveCallArguments] = httpIncomingRequestsDurationSeconds.observe.mock.calls[0];
				expect(requestsDurationObserveCallArguments).toEqual(labels);

				idpScope.done();
				bandieraScope.done();
			});
	});
});
