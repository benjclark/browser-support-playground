const {ugql} = require('../../../../tooling/test-utils');

const {getResearcher} = require('../researcher');

describe(`Researcher queries unit tests`, () => {
	describe(`getResearcher`, () => {
		it('Formats a getResearcher query according to provided arguments', () => {
			let expectedQuery = require('../../../../fixtures/get-researcher.graphql');
			expect(ugql(getResearcher('4da7525b-a54d-7801-911a-20469fd3045f_SN'))).toEqual(expectedQuery);
		});
	});
});
