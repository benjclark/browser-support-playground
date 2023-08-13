const express = require('express');
const {browserSupportPlaygroundController} = require('./controllers/browser-support-playground');
const {catchErrors} = require('./handlers/error');

// eslint-disable-next-line new-cap
const router = express.Router();
router.get('/', function (req, res) {
	res.redirect('/browser-support-playground');
});
router.use('/browser-support-playground', catchErrors(browserSupportPlaygroundController));

module.exports = router;
