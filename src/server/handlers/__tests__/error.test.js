const {
	mockResponse,
	mockRequest
} = require('../../../../tooling/test-utils');

const {
	decorateError,
	errorRenderer,
	checkAPIData
} = require('../error');

jest.mock('../../logger');

describe('Error handlers module', () => {
	describe('decorateError function', () => {
		it('adds default status to given error', () => {
			const errorInstance = {};
			const request = mockRequest();
			decorateError(errorInstance, request);

			expect(errorInstance.status).toBe(500);
		});

		it('adds default message if errorInstance has a status and no message', () => {
			const errorInstance = {
				status: 499
			};
			const request = mockRequest();
			decorateError(errorInstance, request);

			expect(errorInstance.message).toBe(`HTTP ${errorInstance.status} ─ Unknown exception`);
		});

		it('adds default message and adds originalUrl if errorInstance has a status and no message', () => {
			const errorInstance = {
				status: 499
			};
			const originalUrl = '/test?query=test';
			const request = mockRequest({
				originalUrl
			});
			decorateError(errorInstance, request);

			expect(errorInstance.message).toBe(`HTTP ${errorInstance.status} ─ Unknown exception`);
			expect(errorInstance.originalUrl).toBe(originalUrl);
		});

		it('enhances error message and add originalUrl if errorInstance has a status and message', () => {
			const message = 'This is a test';
			const errorInstance = {
				status: 499,
				message
			};
			const originalUrl = '/test?query=test';
			const request = mockRequest({
				originalUrl
			});
			decorateError(errorInstance, request);

			expect(errorInstance.message).toBe(`HTTP ${errorInstance.status} ─ ${message}`);
			expect(errorInstance.originalUrl).toBe(originalUrl);
		});
	});

	describe('verboseErrorRenderer function', () => {
		it('renders error page with some errorDetails', () => {
			const originalUrl = '/testUrl';
			const status = 500;
			const message = 'Internal server error';
			const stack = 'Error stack at index.js:47:32';
			const highlightedStack = 'Error stack at <mark>index.js:47:32</mark>';
			const error = {
				status,
				message,
				stack
			};
			const verboseError = {
				isClientError: false,
				isServerError: true,
				status,
				message: `HTTP ${status} ─ ${message}`,
				stack: highlightedStack,
				originalUrl,
				title: 'Sorry, we are having a problem with our system'
			};
			const request = mockRequest({
				originalUrl
			});
			const response = mockResponse();

			response.locals.featureFlags.enableVerboseErrorMessages = true;

			errorRenderer(error, request, response);

			expect(response.status).toHaveBeenCalledWith(status);
			expect(response.render).toHaveBeenCalledWith('error', verboseError);
		});

		it('renders error page with some empty stack if no stack available', () => {
			const originalUrl = '/testUrl';
			const status = 500;
			const message = 'Internal server error';
			const expectedStack = '';
			const error = {
				status,
				message
			};
			const verboseError = {
				isClientError: false,
				isServerError: true,
				status,
				message: `HTTP ${status} ─ ${message}`,
				stack: expectedStack,
				originalUrl,
				title: 'Sorry, we are having a problem with our system'
			};
			const request = mockRequest({
				originalUrl
			});
			const response = mockResponse();

			response.locals.featureFlags.enableVerboseErrorMessages = true;

			errorRenderer(error, request, response);

			expect(response.status).toHaveBeenCalledWith(status);
			expect(response.render).toHaveBeenCalledWith('error', verboseError);
		});

		it('renders error page with some client error', () => {
			const originalUrl = '/testUrl';
			const status = 404;
			const message = 'Internal server error';
			const expectedStack = '';
			const error = {
				status,
				message
			};
			const verboseError = {
				isClientError: true,
				isServerError: false,
				status,
				message: `HTTP ${status} ─ ${message}`,
				stack: expectedStack,
				originalUrl,
				title: 'Page not found'
			};
			const request = mockRequest({
				originalUrl
			});
			const response = mockResponse();

			response.locals.featureFlags.enableVerboseErrorMessages = true;

			errorRenderer(error, request, response);

			expect(response.status).toHaveBeenCalledWith(status);
			expect(response.render).toHaveBeenCalledWith('error', verboseError);
		});
	});

	describe('compactErrorRenderer function', () => {
		it('renders error page without too much details', () => {
			const originalUrl = '/testUrl';
			const status = 500;

			const error = {
				status,
				message: 'Internal server error',
				stack: 'Error stack at index.js:47:32'
			};
			const viewContext = {
				isClientError: false,
				isServerError: true,
				status,
				title: 'Sorry, we are having a problem with our system'
			};
			const request = mockRequest({
				originalUrl
			});
			const response = mockResponse();

			errorRenderer(error, request, response);

			expect(response.status).toHaveBeenCalledWith(status);
			expect(response.render).toHaveBeenCalledWith('error', viewContext);
		});
	});

	describe('checkAPIData function', () => {
		it('returns data property of passed object if no errors property', () => {
			const innerData = {
				testProperty: 'test'
			};
			const data = {
				data: innerData
			};

			expect(checkAPIData(data)).toEqual(innerData);
		});

		it('throws UnexpectedData error if the passed object has not data and no errors', () => {
			const data = {
				noErrors: 'No errors',
				noData: 'No data'
			};

			expect(() => {
				checkAPIData(data);
			}).toThrowError(`UnexpectedData: ${data}`);
		});

		it('throws first error from the errors array in the passed object', () => {
			const errors = [{
				message: 'Error 1'
			}];
			const data = {
				errors
			};

			expect(() => {
				checkAPIData(data);
			}).toThrowError(errors[0].message);
		});
	});
});
