const copyFileContents = require('../../js/helpers/copy-file-contents');

async function browserSupportPlaygroundController(_request, response) {
	const viewContext = {
		title: 'Browser Support Playground',
		banner: require('../../server/context-data/browser-support-announcement'),
		code: await copyFileContents('src/css/main.scss')
	};

	return response.render('browser-support-playground', viewContext);
}

module.exports = {
	browserSupportPlaygroundController
};
