const nock = require('nock');
const featureFlagsData = require('../../../../mocked-backend/responses/feature-flags.json');
const {setFeatureFlags} = require('../feature-flags');

jest.mock('../../logger');

describe('Feature flags middleware', () => {
	let next;
	const {
		backend
	} = require('../..').options;
	const originalEnvironmentVariables = process.env;

	beforeEach(() => {
		next = jest.fn();
		process.env = {...originalEnvironmentVariables};
	});

	afterEach(() => {
		jest.clearAllMocks();
		process.env = originalEnvironmentVariables;
	});

	it('calls next() if able to fetch feature flags', async () => {
		const response = {
			locals: {}
		};

		nock(backend)
			.get('/api/v2/groups/YOUR-GROUP-NAME-ON-BANDIERA/features')
			.reply(200, featureFlagsData);

		await setFeatureFlags(undefined, response, next);

		expect(next).toHaveBeenCalled();
		expect(response.locals.featureFlags).toEqual(featureFlagsData.response);
	});

	it('returns an empty feature flags map if there is no BANDIERA_URL environment variable set', async () => {
		const response = {
			locals: {}
		};

		delete process.env.BANDIERA_URL;

		await setFeatureFlags(undefined, response, next);

		expect(next).toHaveBeenCalled();
		expect(response.locals.featureFlags).toEqual({});
	});

	it('logs an error if fetch to feature flags service return a "500" status', async () => {
		const logger = require('../../logger');
		const response = {
			locals: {}
		};

		nock(backend)
			.get('/api/v2/groups/YOUR-GROUP-NAME-ON-BANDIERA/features')
			.reply(500);

		await setFeatureFlags(undefined, response, next);

		expect(logger.error).toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
		expect(response.locals.featureFlags).toEqual({});
	});

	it('logs an error if fetch to feature flags service return a anything but "200" or "500" status', async () => {
		const logger = require('../../logger');
		const response = {
			locals: {}
		};

		nock(backend)
			.get('/api/v2/groups/YOUR-GROUP-NAME-ON-BANDIERA/features')
			.reply(418);

		await setFeatureFlags(undefined, response, next);

		expect(logger.error).toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
		expect(response.locals.featureFlags).toEqual({});
	});

	it('logs an warning if fetch to feature flags is timeouting', async () => {
		const logger = require('../../logger');
		const response = {
			locals: {}
		};

		nock(backend)
			.get('/api/v2/groups/YOUR-GROUP-NAME-ON-BANDIERA/features')
			.delayConnection(2000)
			.reply(503);

		await setFeatureFlags(undefined, response, next);

		expect(logger.warn).toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
		expect(response.locals.featureFlags).toEqual({});
	});
});
