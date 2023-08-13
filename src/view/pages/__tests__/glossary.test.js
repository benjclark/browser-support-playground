/**
 * @jest-environment jsdom
 */

const {axe} = require('../../../../tooling/jest-axe-helper');
const handlebarsEngine = require('../../../server/handlebars-engine');
const glossaryTemplate = require('../glossary.hbs');

const render = async context => {
	const partials = await handlebarsEngine.getPartials();

	document.body.innerHTML = glossaryTemplate(context, {
		partials
	});
};

describe('Glossary page', () => {
	it('has a h1 as the main heading', async () => {
		const context = {
			title: 'Glossary'
		};

		await render(context);

		const headingElement = document.querySelector('[data-test="page-main-heading"]');

		expect(headingElement.textContent).toEqual(context.title);
	});

	it('has no accessibility errors', async () => {
		const context = {
			title: 'Glossary'
		};

		await render(context);
		expect(document.body.innerHTML.length).not.toBe(0);

		const result = await axe(document.body);
		expect(result).toHaveNoViolations();
	});
});

