/**
* Unit tests for Indoctrinate Label Filters
*
* @author      Steven Velozo <steven@velozo.com>
*/

const libIndoctrinateCatalogLabelFilter = require('../source/services/catalog/filter/Indoctrinate-Catalog-Filter-Label.js');

const _SampleContentDescriptionLarge = require('./test_data/Sample_ContentDescription_Large.json');

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Indoctrinate Catalog Label Filter',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Basic Label Filter Tests',
			()=>
			{
				test
				(
					'The Label Filter should construct properly',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'TestLabel'});
						Expect(tmpLabelFilter).to.be.an('object', 'The label filter should construct properly.');
					}
				);
				test
				(
					'The Label Filter should construct without a label',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({});
						Expect(tmpLabelFilter).to.be.an('object', 'The label filter should construct properly.');
					}
				);

				/*****************************************************************
				 * Testing for the matchAny (match a single label) algorithm
				 */
				test
				(
					'The matchAny Label Filter should match the SalwaterFish label properly',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'SaltwaterFish'});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAny Label Filter should not match the blibbity label properly',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'blibbity'});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAny Label Filter should not match the Salwaterfish label when cases differ and case sensitivity is on',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'Saltwaterfish', CaseSensitive: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAny Label Filter should match the Salwaterfish label when cases do not differ and case sensitivity is on',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'SaltwaterFish', CaseSensitive: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAny Label Filter should match the Salwaterfish label when cases differ and case sensitivity is off (which is default)',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'Saltwaterfish', CaseSensitive: false});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAny Label Filter should match the SalwaterFish label at the End of a Set (because it is the end of a file name and extensions are a different set)',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'SaltwaterFish', OnlySetEnd: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAny Label Filter should not match the book label at the End of a Set',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Label: 'book', OnlySetEnd: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAny Label Filter should not match an empty label set',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);


				/*****************************************************************
				 * Testing for the matchAll (match all labels) algorithm
				 */
				test
				(
					'The matchAll nonsequential Label Filter should match the book and SalwaterFish and 03 and .md and FILE labels in any order',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['SaltwaterFish', 'FILE', 'book', '03', '.md'], MatchAll: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
						tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['SaltwaterFish', 'book', 'FILE', '03', '.md'], MatchAll: true});
						tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAll nonsequential Label Filter should not match the labels in any order if it has blippity in there',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['SaltwaterFish', 'FILE', 'book', 'blippity', '03', '.md'], MatchAll: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAll nonsequential Label Filter should not match with no labels to match',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: [], MatchAll: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAll nonsequential Label Filter match proximal sets of labels in any order',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['docs', 'examples', 'book', 'chapters', '03'], MatchAll: true, Proximal: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
						tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['docs', 'chapters', '03', 'examples', 'book'], MatchAll: true, Proximal: true});
						tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAll nonsequential Label Filter does not match proximal sets of labels in any order when the labels are not proximal',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['docs', 'examples', 'SaltwaterFish', 'chapters', '03'], MatchAll: true, Proximal: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAll nonsequential Label Filter match proximal sets of labels in any order with set ends as long as all of them are set ends',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['FILE', '03', 'SaltwaterFish', '.md'], MatchAll: true, OnlySetEnd: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAll nonsequential Label Filter match proximal sets of labels in any order with set ends as long as all of them are not set ends',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['FILE', '03', 'book', 'SaltwaterFish', '.md'], MatchAll: true, OnlySetEnd: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchAll nonsequential Label Filter match proximal sets of labels in any order with set ends if one is a nonexistant blippity',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['FILE', '03', 'blippity', 'SaltwaterFish', '.md'], MatchAll: true, OnlySetEnd: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);


				/*****************************************************************
				 * Testing for the matchSequential (match all labels sequentially) algorithm
				 */
				test
				(
					'The matchSequential Label Filter should not match the labels in any order if it has blippity in there',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['SaltwaterFish', 'FILE', 'book', 'blippity', '03', '.md'], MatchAll: true, Sequential: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchSequential Label Filter should not match the labels in any order if the labels are out of order',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['SaltwaterFish', 'FILE', 'book', '03', '.md'], MatchAll: true, Sequential: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchSequential Label Filter should match the labels in any order if the labels are in order',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['FILE', 'book', '03', 'SaltwaterFish', '.md'], MatchAll: true, Sequential: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchSequential Label Filter should fail match the labels in any order if the labels are in order and should be proximal',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['FILE', 'book', '03', 'SaltwaterFish', '.md'], MatchAll: true, Sequential: true, Proximal: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchSequential Label Filter should match the labels if the labels are proximally in order and should be proximal',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['docs', 'examples', 'book', 'chapters'], MatchAll: true, Sequential: true, Proximal: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(true, 'The label filter should match properly.');
					}
				);
				test
				(
					'The matchSequential Label Filter should match the labels if the labels are proximally not in order and should be proximal',
					()=>
					{
						let tmpLabelFilter = new libIndoctrinateCatalogLabelFilter({Labels: ['docs', 'book', 'examples', 'chapters'], MatchAll: true, Sequential: true, Proximal: true});
						let tmpMatched = tmpLabelFilter.matchContent(_SampleContentDescriptionLarge);
						Expect(tmpMatched).to.equal(false, 'The label filter should match properly.');
					}
				);
			}
		);
	}
);