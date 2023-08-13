/**
 * @jest-environment jsdom
 */

const header = require('../header.hbs');

const render = async context => {
	document.body.innerHTML = header(context, {
		helpers: {
			isDefined: require('../../helpers').isDefined
		}
	});
};

describe('Header partial', () => {
	it('has a logo link and skip link', () => {
		render({});

		const logoLink = document.querySelector('[data-test="logo-link"]');
		expect(logoLink.getAttribute('href')).toEqual('/overview');

		const skipLink = document.querySelector('[data-test="skip-link"]');
		expect(skipLink.getAttribute('href')).toEqual('#main-content');
	});

	it('displays a My account link if SN account widget is not available', () => {
		const myAccountPageUrl = '/my-account';
		render({
			myAccountPageUrl,
			user: {
				firstName: 'John',
				lastName: 'Doe'
			}
		});

		const myAccountPageLinkElement = document.querySelector('[data-test="my-account-link"]');
		expect(myAccountPageLinkElement).not.toBe(null);
		expect(myAccountPageLinkElement.getAttribute('href')).toBe(myAccountPageUrl);
	});

	it('displays the SN account widget if it is available', () => {
		const hrefSNAccountWidget = '/my-account';

		render({
			featureFlags: {
				enableSNAccountWidget: true
			},
			snAccountWidget: {
				link: `<a href="${hrefSNAccountWidget}">My account</a>`
			}
		});
		const snAccountWidgetLinkElement = document.querySelector(`[href="${hrefSNAccountWidget}"]`);
		expect(snAccountWidgetLinkElement).not.toBeNull();
	});
});
