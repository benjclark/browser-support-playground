/**
 * @jest-environment jsdom
 */

const {expander} = require('../expander');

const fixture = `
	<div id="target1">Target 1</div>
`;

describe('Expander component', () => {
	beforeEach(() => {
		document.body.innerHTML = fixture;
	});

	it('errors if it misses the mandatory config', () => {
		expect(() => {
			expander();
		}).toThrowError('Could not init the expander. Incorrect configuration, targetSelector is expected to be of type "string" but was undefined');

		expect(() => {
			expander({
				targetSelector: '#target1'
			});
		}).toThrowError('Could not init the expander. Incorrect configuration, triggerLabel is expected to be of type "string" but was undefined');
	});

	it('has add a trigger(button) above the target wrapper', () => {
		const triggerLabel = 'Toggle me';
		const targetSelector = '#target1';

		expander({
			targetSelector,
			triggerLabel
		}).initExpander();

		const triggerElement = document.querySelector('button[data-expander-target="#target1"]');

		expect(triggerElement).not.toBeNull();
		expect(triggerElement.textContent).toStrictEqual(triggerLabel);
	});
});

