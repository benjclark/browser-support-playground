const helpers = require('..');

describe('Helpers', () => {
	test('getData renders given property value as a string', () => {
		const property = {
			user: 'Jon'
		};
		const output = helpers.getData(property);

		expect(output).toEqual('{"user":"Jon"}');
	});

	describe('set helpers', () => {
		const options = {
			data: {
				root: {}
			}
		};

		it('does not add anything if wrong number of params', () => {
			helpers.set(options);
			expect(options.data.root).toStrictEqual({});
		});

		it('does not add propertyValue for wrong type property', () => {
			helpers.set(true, 'propValue', options);
			expect(options.data.root).toStrictEqual({});
		});

		it('adds propertyValue to propertyName property', () => {
			helpers.set('propName', 'propValue', options);
			expect(options.data.root.propName).toEqual('propValue');
		});
	});

	describe('isDefined returns appropriate boolean', () => {
		it('returns `false` if value is `null`', () => {
			expect(helpers.isDefined(null)).toEqual(false);
		});
		it('returns `false` if value is `undefined`', () => {
			expect(helpers.isDefined()).toEqual(false);
		});
		it('returns `true` if value is `0`', () => {
			expect(helpers.isDefined(0)).toEqual(true);
		});
		it('returns `true` if value is `1`', () => {
			expect(helpers.isDefined(1)).toEqual(true);
		});
	});

	describe('concat returns appropriate concatened string', () => {
		it('returns the n-1 first arguments concatenated', () => {
			// Because in the context of a template, the nth argument is a handlebars business object.
			expect(helpers.concat('one', 2, 'three', {})).toEqual('one2three');
		});
		it('returns an empty string if it has no arguments', () => {
			expect(helpers.concat()).toEqual('');
		});
	});
});
