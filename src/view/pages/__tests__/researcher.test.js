/**
 * @jest-environment jsdom
 */

const {axe} = require('../../../../tooling/jest-axe-helper');
const handlebarsEngine = require('../../../server/handlebars-engine');
const researcher = require('../../../../fixtures/researcher-view.json');
const researcherTemplate = require('../researcher.hbs');

const render = async context => {
	const partials = await handlebarsEngine.getPartials();

	document.body.innerHTML = researcherTemplate(context, {
		partials,
		helpers: {
			isDefined: require('../../helpers').isDefined
		}
	});
};

describe('Researcher overview page', () => {
	it('has a h1 as the main heading', async () => {
		await render(researcher);

		const headingElement = document.querySelector('[data-test="page-main-heading"]');

		expect(headingElement.textContent).toEqual(researcher.title);
	});

	it('has a latest metrics section', async () => {
		await render(researcher);

		const sectionElement = document.querySelector('[data-test="latest-metrics-section"]');
		const sectionHeading = sectionElement.querySelector('h2');
		expect(sectionHeading.textContent).toEqual('Latest Springer Nature metrics');
	});

	it('has a "Latest Springer Nature articles"', async () => {
		await render(researcher);

		const sectionElement = document.querySelector('[data-test="your-articles-section"]');
		const sectionHeading = sectionElement.querySelector('h2');
		const expectedArticleTitles = researcher.mostRecent.map(article => article.title);
		const foundArticleTitles = [...sectionElement.querySelectorAll('[data-test="article-title"]')].map(element => element.textContent.trim());

		expect(sectionHeading.textContent).toEqual('Latest Springer Nature articles');
		expect(foundArticleTitles).toStrictEqual(expectedArticleTitles);
	});

	it('has no accessibility errors', async () => {
		await render(researcher);

		const result = await axe(document.body);

		expect(document.body.innerHTML.length).not.toBe(0);

		expect(result).toHaveNoViolations();
	});
});

