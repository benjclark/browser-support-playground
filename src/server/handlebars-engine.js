const path = require('path');
const handlebars = require('express-handlebars');
const helpers = require('../view/helpers');

const handlebarsEngine = handlebars.create({
	extname: '.hbs',
	layoutsDir: path.resolve(__dirname, '../view/layout/'),
	defaultLayout: 'default',
	partialsDir: [
		path.resolve(__dirname, '../view/partials/'),
		path.resolve(__dirname, '../../node_modules/@springernature/global-status-message/view')
	],
	helpers
});

module.exports = handlebarsEngine;
