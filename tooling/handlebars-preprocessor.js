module.exports = {
	process(source) {
		return {
			code: `
				const Handlebars = require('handlebars');
				module.exports = Handlebars.compile(\`${source}\`);
			`
		};
	}
};
