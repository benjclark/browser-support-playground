module.exports = function (request, response) {
	const stub = 'feature-flags.json';
	const status = 200;

	// Simulates backend response latency...
	setTimeout(() => {
		console.log(`Mocking with status: ${status} and stub: ${stub}`);
		return response.status(status).json(require(`../responses/${stub}`));
	}, 0);
};

