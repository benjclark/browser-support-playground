// Winston logger configured to log to Console and to Sentry.
const logger = require('./src/server/logger');
// The actual Express application.
const {app} = require('./src/server');

const port = process.env.PORT;

app.listen(port, () => {
	logger.info(`🚀 Server started on http://local.fs.springernature.com:${port} (${process.env.NODE_ENV})`);
});

module.exports = app;
