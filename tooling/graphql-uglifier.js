const {ugql} = require('./test-utils');

module.exports = {
	process(source) {
		return {
			code: `module.exports = \`${ugql(source)}\``
		};
	}
};
