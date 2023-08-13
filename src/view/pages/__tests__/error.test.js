/**
 * @jest-environment jsdom
 */

const {axe} = require('../../../../tooling/jest-axe-helper');
const handlebarsEngine = require('../../../server/handlebars-engine');
const errorTemplate = require('../error.hbs');

const render = async context => {
	const partials = await handlebarsEngine.getPartials();
	document.body.innerHTML = errorTemplate(context, {
		partials
	});
};

describe('Error page', () => {
	it('displays status and message', async () => {
		await render({
			status: 304,
			message: 'error message',
			isClientError: false,
			isServerError: false
		});

		expect(document.querySelector('[data-test="status-code"]')).not.toBeNull();
		expect(document.querySelector('[data-test="message"]').textContent).toMatch('error message');
	});

	it('displays 404', async () => {
		await render({
			status: 404,
			isClientError: true,
			isServerError: false
		});
		expect(document.querySelector('[data-test="message"]').textContent).toMatch('The information you’re looking for cannot be found, it may be temporarily unavailable or permanently removed');
	});

	it('displays 501', async () => {
		await render({
			status: 501,
			isClientError: false,
			isServerError: true
		});
		expect(document.querySelector('[data-test="message"]').textContent).toMatch('We are working to fix the problem and hope to be up and running shortly. Try to refresh the page or return later');
	});

	it('displays stack', async () => {
		await render({
			stack: 'the stack trace'
		});

		expect(document.querySelector('[data-test="stack"]').textContent).toMatch('the stack trace');
	});

	it('has no accessibility errors', async () => {
		await render({
			status: 404,
			isClientError: true,
			isServerError: false
		});

		const result = await axe(document.body);

		expect(result).toHaveNoViolations();
	});
});
