import {expander} from './modules/expander';

if (document.querySelector('[id="more-metrics"]')) {
	expander({
		targetSelector: '[id="more-metrics"]',
		triggerLabel: 'More metrics'
	}).initExpander();
}

