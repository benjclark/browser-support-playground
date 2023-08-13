const nock = require('nock');
const {expressJsRequest} = require('../../../../tooling/test-utils');
const errorData = require('../../../../mocked-backend/responses/backend-error.json');
const userinfoData = require('../../../../mocked-backend/responses/idp-userinfo-200.json');
const accessTokenData = require('../../../../mocked-backend/responses/idp-token-200.json');
const researcherData = require('../../../../mocked-backend/responses/researcher.json');
const accountWidgetData = require('../../../../mocked-backend/responses/idp-account-widget-200.json');
const researcherMostRecentPublicationsData = require('../../../../mocked-backend/responses/3-most-recent-publications.json');

jest.mock('../../logger');

describe('Overview route', () => {
	let request;
	const userEmail = '123@123.com';

	const idpBackend = process.env.IDP_BACKEND;
	const dataBackend = process.env.BACKEND;
	let idpScope;
	let dataScope;

	beforeEach(() => {
		idpScope = nock(idpBackend)
			.post('/v1/token')
			.reply(200, accessTokenData)
			.get(/\/v4\/userinfo/)
			.reply(200, userinfoData)
			.get(/\/v2\/account-widget/)
			.reply(200, accountWidgetData);

		request = expressJsRequest();
	});

	afterEach(() => {
		nock.cleanAll();
	});

	// eslint-disable-next-line jest/expect-expect
	it('Serves the page with a 200 in best case', () => {
		dataScope = nock(dataBackend)
			.post('/graphql', /overallUsage/) // getResearcher Query
			.reply(200, researcherData)
			.post('/graphql', /publications\(.*MOST_RECENT/) // getResearcher Most recent Query
			.reply(200, researcherMostRecentPublicationsData);

		return request.get('/overview')
			.set('Cookie', [`idp_session_http=${userEmail}`])
			.send()
			.expect(200)
			.then(() => {
				idpScope.done();
				dataScope.done();
			});
	});

	// eslint-disable-next-line jest/expect-expect
	it('Serves the page with a 400 when a backend error occurs', () => {
		dataScope = nock(dataBackend)
			.post('/graphql', /overallUsage/) // getResearcher Query
			.reply(200, errorData);

		return request.get('/overview')
			.set('Cookie', [`idp_session_http=${userEmail}`])
			.send()
			.expect(400)
			.then(() => {
				idpScope.done();
				dataScope.done();
			});
	});
});
