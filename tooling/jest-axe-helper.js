const {configureAxe} = require('jest-axe');

const axe = configureAxe({
	rules: {
		// This is here in case we need to disable rules.
		// Try not to as much as possible thank you!
	}
});

module.exports = {
	axe
};
