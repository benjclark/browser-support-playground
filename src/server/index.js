const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const serveStatic = require('serve-static');
const handlebarsEngine = require('./handlebars-engine');

const logger = require('./logger');
const {assetsManifest} = require('./middlewares/assets-manifest');

const manifestFile = path.resolve(__dirname, '../../dist/assets.json');

// Grabs configurations from environment variables.
const options = {
	environment: process.env.NODE_ENV,
	isDev: process.env.NODE_ENV === 'development',
	isProd: process.env.NODE_ENV === 'production',
	port: process.env.PORT,
	backend: process.env.BACKEND,
	loginPageUrl: process.env.LOGIN_PAGE_URL || '/login',
	platformEnv: process.env.PLATFORM_ENVIRONMENT,
	cookieConsentBundleUrl: process.env.COOKIE_CONSENT_BUNDLE_URL,
	gaMeasurementId: process.env.GA_MEASUREMENT_ID,
	sentryJSLoaderScript: process.env.SENTRY_JS_LOADER_SCRIPT
};

const app = express();

app.locals.footer = require('./context-data/footer.json');

app.locals.footer.currentYear = (new Date()).toISOString().slice(0, 4);

// Enables gzip compression.
app.use(compression());

// Secures your Express apps by setting various HTTP headers.
app.use(helmet({contentSecurityPolicy: false}));
// Enables cookie support.
app.use(cookieParser());

// Sets up handlebars as our view engine.
app.set('views', path.resolve(__dirname, '../view/pages'));
app.engine('.hbs', handlebarsEngine.engine);
app.set('view engine', '.hbs');

// Includes built assets.
app.use('/', serveStatic(path.resolve(__dirname, '../../dist')));

// Includes the manifest file from the build, which lets us add asset fingerprinting to our templates.
app.use(assetsManifest({
	manifestFile,
	readManifestPerRequest: options.isDev
}));

if (options.isDev) {
	const reload = require('reload');

	logger.debug('Enabled live-reload');
	// Sets up live-reload so the browser refreshes whenever the server restarts (thanks to nodemon).
	app.locals.liveReload = true;
	reload(app);

	// We want to parse the body when in development so we can use mocks that make use of req.body
	// With an actual backend, this causes the HTTP body stream to be consumed which stops us from
	// being able to pipe it to the backend.
	app.use(express.urlencoded({extended: true}));
}

app.use('/', require('./router'));

// If we haven't hit anything yet, then cause a 404 error.
app.use((request, _response, next) => next({message: `No routes found for ${request.path}`, status: 404}));

module.exports = {app, options};
