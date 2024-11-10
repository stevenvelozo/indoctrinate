/**
* Unit tests for Indoctrinate Format Filters
*
* @author      Steven Velozo <steven@velozo.com>
*/

const libIndoctrinateCatalogFormatFilter = require('../source/services/catalog/filter/Indoctrinate-Catalog-Filter-Format.js');

const _SampleAppData = require('./test_data/Sample_AppData.json');

const _SampleContentDescriptionLarge = require('./test_data/Sample_ContentDescription_Large.json');

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Indoctrinate Catalog Format Filter',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Basic Format Filter Tests',
			()=>
			{
				test
				(
					'The Format Filter should construct properly',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({Format: 'TestFormat'});
						Expect(tmpFormatFilter).to.be.an('object', 'The format filter should construct properly.');
					}
				);
				test
				(
					'The Format Filter should construct without a format',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({});
						Expect(tmpFormatFilter).to.be.an('object', 'The format filter should construct properly.');
					}
				);
				test
				(
					'The Format Filter should match the Markdown format properly',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({Format: 'markdown'});
						let tmpMatched = tmpFormatFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The format filter should match properly.');
					}
				);
				test
				(
					'The Format Filter should not match the JSON format properly',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({Format: 'json'});
						let tmpMatched = tmpFormatFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The format filter should match properly.');
					}
				);
				test
				(
					'Case sensitivity should work',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({Format: 'markDown', CaseSensitive: true});
						let tmpMatched = tmpFormatFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The format filter should match properly.');
					}
				);
				test
				(
					'Case sensitivity should work when matching',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({Format: 'markdown', CaseSensitive: true});
						let tmpMatched = tmpFormatFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The format filter should match properly.');
					}
				);
				test
				(
					'Case sensitivity should work when off',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({Format: 'markdown', CaseSensitive: false});
						let tmpMatched = tmpFormatFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The format filter should match properly.');
					}
				);
				test
				(
					'Arrays of formats should work including case sensitivity',
					()=>
					{
						let tmpFormatFilter = new libIndoctrinateCatalogFormatFilter({Formats: ['markDown'], CaseSensitive: true});
						let tmpMatched = tmpFormatFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The format filter should match properly.');
					}
				);
			}
		);
	}
);