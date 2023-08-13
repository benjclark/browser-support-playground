/* eslint-disable camelcase */
const {httpAccessLogger} = require('../http-access-logger');

describe('HTTP access logger middleware', () => {
	const originalEnvironmentVariables = process.env;

	beforeEach(() => {
		process.env = {...originalEnvironmentVariables};
	});

	afterEach(() => {
		jest.clearAllMocks();
		process.env = originalEnvironmentVariables;
	});

	// eslint-disable-next-line jest/expect-expect
	it('Logs the expected JSON into the console', async () => {
		// Mock console.log so it does not pollute the output.
		jest.spyOn(global.console, 'log').mockImplementation();
		jest.spyOn(global.JSON, 'stringify').mockImplementation();

		const date = new Date('2022-06-08T10:12:27.476Z');
		jest.spyOn(global, 'Date').mockImplementation(() => date);

		process.env.PORT = '8888';

		const request = {
			headers: {
				'user-agent': 'Test UA'
			},
			ip: '127.0.0.1',
			method: 'GET',
			url: '/test'
		};
		const response = {};
		const next = jest.fn();

		const expectedData = {
			// Hard coded values in the middleware.
			log_level: 'INFO',
			log_type: 'ACCESS',
			service: 'researcher-portal-frontend',
			// Non hard coded values.
			verb: request.method,
			hostname: `${request.ip}:${process.env.PORT}`,
			user_agent: request.headers['user-agent'],
			status: undefined, // Not testable because we use immediate
			uri: request.url,
			path: request.url,
			response_time: undefined, // Not testable because we use immediate
			time: '2022-06-08T10:12:27.476Z' // Mocked time (see above).
		};

		httpAccessLogger({
			// immediate, because we do not have a server running in this context.
			immediate: true
		})(request, response, next);

		expect(global.JSON.stringify).toHaveBeenCalledWith(expectedData);
	});
});
