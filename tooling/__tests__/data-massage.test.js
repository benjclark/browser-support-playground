const {
	formatPublication
} = require('../data-massage');

describe('Data massage module', () => {
	describe('formatPublication function', () => {
		const publication = {
			publicationDate: '2018-12-13',
			journal: {
				title: 'Nature Cancer'
			}
		};

		it('Converts publication date to "MMMM YYYY" format', () => {
			expect(formatPublication(publication).publicationDate).toStrictEqual('December 2018');
		});

		it('Should not throw error if missing a property', () => {
			expect(() => {
				formatPublication({});
			}).not.toThrow();
		});

		it('Converts publication date to "N/A" if it is empty', () => {
			expect(formatPublication({}).publicationDate).toStrictEqual('N/A');
		});
	});
});
