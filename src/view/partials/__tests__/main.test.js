/**
 * @jest-environment jsdom
 */

const mainPartial = require('../main.hbs');

const render = (context, body) => {
	const options = {
		data: {
			'partial-block': body
		}
	};

	document.body.innerHTML = mainPartial(context, options);
};

describe('Main partial block', () => {
	const context = {
		h1: 'Your overview'
	};

	it('Displays pageTitle and main content', () => {
		render(context, 'Main content');

		expect(document.querySelector('[data-test="main-container"]').textContent).toMatch('Main content');
		expect(document.querySelector('[data-test="page-main-heading"]').innerHTML.trim()).toStrictEqual(context.h1);
	});
});
