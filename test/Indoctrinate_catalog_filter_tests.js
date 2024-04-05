/**
* Unit tests for Indoctrinate Format Filters
*
* @author      Steven Velozo <steven@velozo.com>
*/

const libIndoctrinateCatalogFilter = require('../source/services/catalog/filter/Indoctrinate-Catalog-Filter.js');

const _SampleContentDescriptionLarge = require('./test_data/Sample_ContentDescription_Large.json');

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Indoctrinate Catalog Filter Base Class',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Basic Filter Tests',
			()=>
			{
				test
				(
					'The Filter should construct properly',
					()=>
					{
						let tmpFilter = new libIndoctrinateCatalogFilter({});
						Expect(tmpFilter).to.be.an('object', 'The filter should construct properly.');
					}
				);
				test
				(
					'The Filter base class should never match anything',
					()=>
					{
						let tmpFilter = new libIndoctrinateCatalogFilter({});
						let tmpMatched = tmpFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The format filter never match.');
					}
				);
			}
		);
	}
);