const express = require('express');

const mockedBackendsPort = process.env.MOCKED_BACKENDS_PORT;
const backend = process.env.BACKEND;
const idpBackend = process.env.IDP_BACKEND;

// eslint-disable-next-line new-cap
const router = express.Router();

if (mockedBackendsPort && idpBackend && idpBackend.endsWith(mockedBackendsPort)) {
	router.post('/v1/token', require('./controllers/idp'));
	router.get('/v4/userinfo', require('./controllers/idp'));
	router.get('/v2/account-widget', require('./controllers/idp'));
}

if (mockedBackendsPort && backend && backend.endsWith(mockedBackendsPort)) {
	router.post('/graphql', require('./controllers/graphql'));
	router.get('/api/v2/groups/YOUR-GROUP-NAME-ON-BANDIERA/features', require('./controllers/bandiera-feature-flags'));
}

module.exports = router;
