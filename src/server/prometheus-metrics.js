const Prometheus = require('prom-client');

const up = new Prometheus.Gauge({
	name: 'up',
	help: '1 = up, 0 = not up'
});
up.set(1);

const httpIncomingRequestsTotal = new Prometheus.Counter({
	name: 'http_incoming_requests_total',
	help: 'Incoming HTTP requests',
	labelNames: ['http_status', 'request_path']
});

const httpIncomingRequestsDurationSeconds = new Prometheus.Histogram({
	name: 'http_incoming_requests_duration_seconds',
	help: 'The duration of incoming HTTP requests in seconds',
	labelNames: ['http_status', 'request_path']
});

module.exports = {
	httpIncomingRequestsTotal,
	httpIncomingRequestsDurationSeconds
};

