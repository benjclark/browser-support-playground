import {Expander} from '@springernature/brand-context';

/**
 * Create appropriate markup for the expander to function.
 *
 * @param {object} config Config necessary to setup the creator.
 * @param {string} config.targetSelector Selector for the target wrapper element.
 * @param {string} config.triggerLabel Text label of the trigger element.
 * @returns {object} - Public API of the creator.
 */
function expander(config = {}) {
	const {
		targetSelector,
		triggerLabel
	} = config;
	let triggerElement;

	if (typeof targetSelector !== 'string') {
		throw new TypeError(`Could not init the expander. Incorrect configuration, targetSelector is expected to be of type "string" but was ${typeof targetSelector}`);
	}

	if (typeof triggerLabel !== 'string') {
		throw new TypeError(`Could not init the expander. Incorrect configuration, triggerLabel is expected to be of type "string" but was ${typeof triggerLabel}`);
	}

	const targetElement = document.querySelector(targetSelector);

	// API
	return {
		initExpander
	};

	function initExpander() {
		addExpanderTrigger();
		const myExpander = new Expander(
			triggerElement,
			targetElement
		);
		myExpander.init();
	}

	function addExpanderTrigger() {
		triggerElement = document.createElement('button');
		triggerElement.dataset.expander = '';
		triggerElement.dataset.expanderTarget = `#${targetElement.id}`;
		triggerElement.classList.add('u-button', 'u-button--secondary', 'u-button--small');
		triggerElement.textContent = triggerLabel;
		targetElement.classList.add('u-mt-8');
		targetElement.insertAdjacentHTML('beforebegin', triggerElement.outerHTML);

		// Explicit reselecting the element so that the event listener can be added
		triggerElement = document.querySelector(`button[data-expander-target="#${targetElement.id}"]`);
	}
}

export {
	expander
};
