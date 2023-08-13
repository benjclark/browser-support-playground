const {ugql} = require('../../../../tooling/test-utils');

const {getPublications} = require('../publication');

describe(`Publication queries unit tests`, () => {
	describe(`getPublications`, () => {
		it('Formats a getPublications query according to provided arguments', () => {
			let expectedQuery = require('../../../../fixtures/get-publications.graphql');
			expect(ugql(getPublications({
				snid: '4da7525b-a54d-7801-911a-20469fd3045f_SN',
				take: 3,
				sortMode: 'mostRecent'}))).toEqual(expectedQuery);
		});
	});
});
