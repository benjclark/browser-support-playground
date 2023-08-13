const {createLogger, format, transports} = require('winston');

const {simple, combine, errors, json} = format;

const options = {
	isProd: process.env.NODE_ENV === 'production',
	sentryDSNServerSide: process.env.SENTRY_DSN_SERVER_SIDE,
	platformEnv: process.env.PLATFORM_ENVIRONMENT
};

const transportsList = [
	new transports.Console()
];

if (options.isProd) {
	const Sentry = require('winston-transport-sentry-node').default;

	transportsList.push(new Sentry({
		sentry: {
			dsn: options.sentryDSNServerSide,
			environment: options.platformEnv,
			serverName: 'YOUR-PROJECT-NAME-FOR-THIS-APP-ON-SENTRY'
		},
		level: 'error'
	}));
}

const logger = createLogger({
	level: 'info',
	exitOnError: false,
	format: options.isProd ? combine(errors({stack: true}), json()) : combine(errors({stack: true}), simple()),
	transports: transportsList
});

module.exports = logger;
