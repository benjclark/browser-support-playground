module.exports = {
	getData(propertyName) {
		return JSON.stringify(propertyName);
	},
	isDefined(value) {
		return value !== undefined && value !== null;
	},
	set(propertyName, propertyValue, options) {
		if (arguments.length === 3 && typeof propertyName === 'string') {
			options.data.root[propertyName] = propertyValue;
		}
	},
	concat() {
		if (Object.keys(arguments).length > 0) {
			return Array.from(arguments).slice(0, -1).join('');
		}
		return '';
	}
};
