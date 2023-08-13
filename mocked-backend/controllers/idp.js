module.exports = function (request, response) {
	if (request.method === 'POST' && request.originalUrl.includes('token')) {
		let status;
		const {
			body
		} = request;

		if (body.code && body.grant_type) {
			const validCookieValue = '123@123.com';

			if (body.code === validCookieValue) {
				status = 200;
			}
		}

		status = status || 400;
		response.status(status);

		console.log(`Mocking with status: ${status} and stub: idp-token-${status}.json`);
		return response.json(require(`../responses/idp-token-${status}.json`));
	}

	if (request.method === 'GET' && request.originalUrl.includes('userinfo')) {
		response.status(200);

		console.log(`Mocking with status: 200 and stub: idp-user-info-200.json`);
		return response.json(require(`../responses/idp-userinfo-200.json`));
	}

	if (request.method === 'GET' && request.originalUrl.includes('account-widget')) {
		response.status(200);

		console.log(`Mocking with status: 200 and stub: idp-account-widget-200.json`);
		return response.json(require(`../responses/idp-account-widget-200.json`));
	}
};
