/**
 * @jest-environment jsdom
 */

const {axe} = require('../../../../tooling/jest-axe-helper');
const handlebarsEngine = require('../../../server/handlebars-engine');
const defaultLayout = require('../default.hbs');

const render = async context => {
	const partials = await handlebarsEngine.getPartials();

	const renderedLayout = defaultLayout(context, {
		partials
	});

	document.write(renderedLayout);
	document.close();
};

describe('Default layout', () => {
	it('includes the cookie consent script if cookieConsentBundleUrl is provided', async () => {
		await render({
			cookieConsentBundleUrl: '/foo/foo.js'
		});

		const cookieConsentScript = document.querySelector('[data-test="cookie-consent-script"]');
		expect(cookieConsentScript).not.toBe(null);
		expect(cookieConsentScript.getAttribute('src')).toEqual('/foo/foo.js');
	});

	it('does NOT include the cookie consent script if cookieConsentBundleUrl is NOT provided', async () => {
		await render();

		const cookieConsentScript = document.querySelector('[data-test="cookie-consent-script"]');
		expect(cookieConsentScript).toBe(null);
	});

	it('has no accessibility errors', async () => {
		let result;

		await render({
			body: '<main>Main content</main>'
		});
		expect(document.body.innerHTML.length).not.toBe(0);

		result = await axe(document.body);
		expect(result).toHaveNoViolations();
	});
});
