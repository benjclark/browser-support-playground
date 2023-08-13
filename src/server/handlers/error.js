const logger = require('../logger');

function isClientException(statusCode) {
	return !Number.isNaN(statusCode) && statusCode >= 400 && statusCode < 500;
}

function isServerException(statusCode) {
	return !Number.isNaN(statusCode) && statusCode >= 500 && statusCode < 600;
}

/**
 * Improves given errorInstance by trying to provide more meaningful properties.
 * It provides at least message and status.
 * Optionally it provides originalUrl and stack.
 *
 * @param {object} errorInstance - Instance of an error.
 * @param {object} request - Express request object.
 */
function decorateError(errorInstance, request) {
	const message = errorInstance.message || 'Unknown exception';
	const status = errorInstance.status || 500;

	if (errorInstance.status) {
		// If a status code was not assigned by default attach the originalUrl.
		errorInstance.message = `HTTP ${status} ─ ${message}`;
		errorInstance.originalUrl = request.originalUrl;
	}

	errorInstance.status = status;
}

/**
 * Instead of using try{} catch(e) {} in each middleware, controller... we wrap
 * their call with the present function.
 * This present function then passes the error down the middlewares chain up to
 * the one that handles it.
 * This comes handy with middlewares, controllers... using async/await.
 *
 * @param {object} underWatchFunction - function under watch.
 */
function catchErrors(underWatchFunction) {
	const returnFunction = function (request, response, next) {
		return underWatchFunction(request, response, next).catch(error => next(error));
	};

	if (underWatchFunction.name) {
		// This is a hack so that we see the underWatchFunction's name in our
		// telemetry stack traces. Otherwise this is traced as `<anonymous>` (not useful!).
		Object.defineProperty(returnFunction, 'name', {
			value: `_${underWatchFunction.name}`,
			configurable: true
		});
	}

	return returnFunction;
}

/**
 * Express Error renderer.
 *
 * @param {object} error - The error that occurred.
 * @param {object} request - The express request.
 * @param {object} response - The express response.
 * @param {function} _next - The express next callback.
 */
function errorRenderer(error, request, response, next) {
	const {featureFlags} = response.locals;

	if (process.env.node_env === 'development' || featureFlags.enableVerboseErrorMessages) {
		verboseErrorRenderer(error, request, response, next);
	} else {
		compactErrorRenderer(error, request, response, next);
	}
}

/**
 * Express verbose Error renderer.
 *
 * In development we show good error messages so if we hit a syntax error or
 * any other previously un-handled error, we can show good info on what
 * happened.
 *
 * @param {object} error - The error that occurred.
 * @param {object} request - The express request.
 * @param {object} response - The express response.
 * @param {function} _next - The express next callback.
 */
function verboseErrorRenderer(error, request, response, _next) {
	decorateError(error, request);

	const {status} = error;
	const isClientError = isClientException(status);
	const isServerError = isServerException(status);

	const viewContext = {
		...error,
		stack: error.stack ? error.stack.replace(/[_-\da-z]+.js:\d+:\d+/gi, '<mark>$&</mark>') : '',
		isClientError,
		isServerError
	};

	if (isClientError) {
		viewContext.title = 'Page not found';
	} else {
		viewContext.title = 'Sorry, we are having a problem with our system';
	}

	logger.log('error', {...error});

	return response.status(status).render('error', viewContext);
}

/**
 * Express compact Error renderer.
 * No stacktraces are leaked to user.
 *
 * @param {object} error - The error that occurred.
 * @param {object} request - The express request.
 * @param {object} response - The express response.
 * @param {function} _next - The express next callback.
 */
function compactErrorRenderer(error, request, response, _next) {
	decorateError(error, request);

	const {status} = error;
	const isClientError = isClientException(status);
	const isServerError = isServerException(status);

	const viewContext = {
		status,
		isClientError,
		isServerError
	};

	if (isClientError) {
		viewContext.title = 'Page not found';
	} else {
		viewContext.title = 'Sorry, we are having a problem with our system';
	}

	logger.log('error', {...error});

	return response.status(status).render('error', viewContext);
}

/**
 * Checks data from return from API call to check if it carry errors.
 *
 * @param {object} data - Data returned
 * @param {object} next - Express next() function
 * @returns {object} The API data in happy scenario.
 * @throws Error in case of errors property attached to data.
 */
function checkAPIData(data) {
	if (data.errors || typeof data.data === 'undefined') {
		const error = new Error(data.errors ? data.errors[0].message : `UnexpectedData: ${data}`);
		error.status = 400;
		throw error;
	}
	return data.data;
}

module.exports = {
	decorateError,
	catchErrors,
	errorRenderer,
	checkAPIData
};
