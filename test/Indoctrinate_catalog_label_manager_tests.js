/**
* Unit tests for Indoctrinate Label Manager
*
* @author      Steven Velozo <steven@velozo.com>
*/

const libIndoctrinateCatalogLabelManager = require('../source/services/catalog/Indoctrinate-Catalog-LabelManager.js');

const _SampleContentDescriptionLarge = require('./test_data/Sample_ContentDescription_Large.json');
const getCleanContentDescriptionLarge = () => { return JSON.parse(JSON.stringify(_SampleContentDescriptionLarge)); };

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Indoctrinate Catalog Label Manager',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Basic Label Manager Tests',
			()=>
			{
				test
				(
					'The Label Manager should construct properly',
					()=>
					{
						let tmpLabelManager = new libIndoctrinateCatalogLabelManager();
						Expect(tmpLabelManager).to.be.an('object', 'The label manager should construct properly.');
					}
				);
				test
				(
					'The Label Manager should be able to count labels',
					()=>
					{
						let tmpLabelManager = new libIndoctrinateCatalogLabelManager();
						Expect(tmpLabelManager.countLabels(_SampleContentDescriptionLarge)).to.equal(11, 'The label manager should be able to count labels.');
						Expect(tmpLabelManager.countLabels(_SampleContentDescriptionLarge, 'SaltwaterFish', false)).to.equal(3, 'The label manager should be able to count labels with an exact match.');
						Expect(tmpLabelManager.countLabels(_SampleContentDescriptionLarge, 'SaltwaterFish', true)).to.equal(1, 'The label manager should be able to count labels with an exact match.');
						Expect(tmpLabelManager.countLabels(_SampleContentDescriptionLarge, 'SaltwaterFish')).to.equal(1, 'The label manager should default to exact match when counting labels.');
					}
				);
				test
				(
					'The Label Manager should be able to insert labels at the end of a set',
					()=>
					{
						let tmpLabelManager = new libIndoctrinateCatalogLabelManager();
						let tmpContentDescription = getCleanContentDescriptionLarge();
						tmpLabelManager.insertLabelAtEndOfSet(tmpContentDescription, 'Media', 'TYPE');
						Expect(tmpContentDescription.Labels[2]).to.equal('Media', 'The label manager should be able to insert a label at the end of a set.');
						tmpLabelManager.insertLabelAtEndOfSet(tmpContentDescription, 'Carrot', 'FAVORITEBABYFOOD');
						Expect(tmpContentDescription.Labels[18]).to.equal('__LABELSET_FAVORITEBABYFOOD', 'The label manager should be able to insert a label at the end of a set.');
						Expect(tmpContentDescription.Labels[19]).to.equal('Carrot', 'The label manager should be able to insert a label at the end of a set.');
					}
				);
			}
		);
	}
);