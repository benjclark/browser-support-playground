/* eslint-disable camelcase */
const morgan = require('morgan');

/**
 * Formats as a JSON and output to console.
 *
 * @param {object} jsonKeyNamesToApacheTokens Map of JSON key names to Apache tokens (e.g. {path: ':url', time: ':date[iso]'}).
 */
function format(jsonKeyNamesToApacheTokens) {
	const keys = Object.keys(jsonKeyNamesToApacheTokens);
	const token = /^:([\w-]{2,})(?:\[([^\]]+)])?$/;

	return function (tokens, request, response) {
		const data = {
			log_level: 'INFO',
			log_type: 'ACCESS',
			hostname: `${request.ip}${process.env.PORT ? `:${process.env.PORT}` : ''}`,
			service: 'researcher-portal-frontend'
		};
		for (const key of keys) {
			const value = token.exec(jsonKeyNamesToApacheTokens[key]);
			data[key] = value === null ?
				jsonKeyNamesToApacheTokens[key] :
				tokens[value[1]](request, response, value[2]);
		}
		console.log(JSON.stringify(data));
	};
}

/**
 * Wrapper around morgan middleware so that we enhance it with JSON format as output.
 * Note: options.immediate allows us to execute the middleware in a serverless context (e.g in tests).
 *
 * @params {object} [options] `morgan` middleware options.
 * @param {boolean} [options.immediate] Tells morgan middleware to either log immediate or to wait onHeaders and onFinished.
 */
function httpAccessLogger(options = {}) {
	return morgan(format({
		verb: ':method',
		user_agent: ':user-agent',
		status: ':status',
		uri: ':url',
		path: ':url',
		response_time: ':response-time',
		time: ':date[iso]'
	}), options);
}

module.exports = {
	httpAccessLogger
};
