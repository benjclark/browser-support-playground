// Require dependencies
const opentelemetry = require('@opentelemetry/sdk-node');
const {HttpInstrumentation} = require('@opentelemetry/instrumentation-http');
const {ExpressInstrumentation} = require('@opentelemetry/instrumentation-express');
const {WinstonInstrumentation} = require('@opentelemetry/instrumentation-winston');
const {diag, DiagConsoleLogger, DiagLogLevel} = require('@opentelemetry/api');
const {ZipkinExporter} = require('@opentelemetry/exporter-zipkin');
const {Resource} = require('@opentelemetry/resources');

// Add your zipkin url (`http://localhost:9411/api/v2/spans` is used as
// default) and application name to the Zipkin options.
// You can also define your custom headers which will be added automatically.
const options = {
	serviceName: 'YOUR-SERVICE-NAME',
	url: 'http://zipkin-sink.tracing.springernature.io:80/api/v2/spans'
};

const exporter = new ZipkinExporter(options);

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new opentelemetry.NodeSDK({
	resource: new Resource({
		'service.name': 'YOUR-SERVICE-NAME',
		app: 'YOUR-APP-NAME'
	}),
	traceExporter: process.env.NODE_ENV === 'production' ? exporter : new opentelemetry.tracing.ConsoleSpanExporter(),
	instrumentations: [
	// Express instrumentation expects HTTP layer to be instrumented
		new HttpInstrumentation(),
		new ExpressInstrumentation(),
		new WinstonInstrumentation({
			// Optional hook to insert additional context to log metadata.
			// Called after trace context is injected to metadata.
			logHook: (span, record) => {
				// eslint-disable-next-line camelcase
				record.w3c_traceid = span._spanContext.traceId;
			}
		})
	]
});

sdk.start();
