/* eslint-disable camelcase */
const Prometheus = require('prom-client');
const ResponseTime = require('response-time');
const {
	httpIncomingRequestsTotal,
	httpIncomingRequestsDurationSeconds
} = require('../prometheus-metrics');

// Namespace (one worded name of your app).
const prefix = 'YOUR_APP_NAME';

Prometheus.collectDefaultMetrics({
	prefix: `${prefix}_`,
	gcDurationBuckets: [0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10]
});

// Inspired from the `express-prometheus-middleware` module.
// eslint-disable-next-line new-cap
module.exports = ResponseTime((request, response, time) => {
	const {originalUrl} = request;
	const {status_code, statusCode} = response;

	if (!originalUrl.startsWith('/internal/metrics')) {
		const labels = {
			http_status: status_code || statusCode, // Normalisation
			request_path: originalUrl
		};

		httpIncomingRequestsTotal.inc(labels);

		httpIncomingRequestsDurationSeconds.observe(labels, time / 1000);
	}
	// NOTE: Else branch not testable due to reverse proxy to port 9999 where
	// metrics app is running.
});
