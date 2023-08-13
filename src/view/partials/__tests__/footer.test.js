/**
 * @jest-environment jsdom
 */

const footer = require('../footer.hbs');
const footerContext = require('../../../server/context-data/footer.json');

const render = context => {
	document.body.innerHTML = footer(context);
};

describe('Footer partial', () => {
	it('displays the footer element if there is one in the context', () => {
		render({
			footer: footerContext
		});

		const footerElement = document.querySelector('[data-test="global-footer"]');

		expect(footerElement).not.toBe(null);
	});

	it('displays the footer nav element if there is one in the context', () => {
		const context = {
			footer: footerContext
		};

		render(context);

		const navElement = document.querySelector('[data-test="global-footer"] nav');

		expect(navElement).not.toBe(null);
		expect(navElement.querySelectorAll('ul > li').length).toEqual(context.footer.navigation.links.length);

		for (const item of context.footer.navigation.links) {
			if (item.buttonProperties) {
				let found;
				Array.from(navElement.querySelectorAll('button')).every(button => {
					found = button.textContent.trim() === item.text;
					if (found) {
						// Break the loop.
						return false;
					}
					return true;
				});

				// eslint-disable-next-line jest/no-conditional-expect
				expect(found).toBe(true);
			} else if (item.url) {
				// eslint-disable-next-line jest/no-conditional-expect
				expect(navElement.querySelector(`[href="${item.url}"]`).textContent.trim()).toBe(item.text);
			}
		}
	});

	it('displays the logo if there is an image in the context', () => {
		const context = {
			footer: footerContext
		};

		render(context);

		const {link, src, alt} = context.footer.image;

		const imgLinkElement = document.querySelector(`a[href="${link}"]`);
		expect(imgLinkElement).not.toBe(null);

		const imgElement = imgLinkElement.querySelector(`img[src="${src}"][alt="${alt}"]`);
		expect(imgElement).not.toBe(null);
	});

	it('displays the copyright as expected', () => {
		render({
			footer: {
				...footerContext,
				currentYear: '2022'
			}
		});

		const copyrightElement = document.querySelector('[data-test="copyright"]');

		expect(copyrightElement.textContent.trim()).toBe(`© 2022 Springer Nature`);
	});

	it('displays nothing if there are no footer data', () => {
		render({});

		const footerElement = document.querySelector('footer');

		expect(footerElement).toBe(null);
	});

	it('displays no navigation if there are no navigation data', () => {
		render({
			footer: {}
		});

		const footerElement = document.querySelector('[data-test="global-footer"]');
		const navElement = footerElement.querySelector('nav');

		expect(navElement).toBe(null);
	});
});
