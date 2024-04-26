/**
* Unit tests for Indoctrinate Cataloger
*
* @author      Steven Velozo <steven@velozo.com>
*/

const libPict = require('pict-service-commandlineutility');
const libIndoctrinateCompiler = require('../source/Indoctrinate-Fable-Service.js');

const _SampleContentDescriptionLarge = require('./test_data/Sample_ContentDescription_Large.json');

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Indoctrinate Catalog Test',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Basic Catalog Tests',
			()=>
			{
				test
				(
					'The Filter should construct properly',
					(fNext)=>
					{
						let tmpPict = new libPict();
						tmpPict.instantiateServiceProvider('Dates');

						tmpPict.addServiceType('IndoctrinateCompiler', libIndoctrinateCompiler);

						let tmpCompiler = tmpPict.instantiateServiceProvider('IndoctrinateCompiler');

						Expect(tmpCompiler).to.be.an('object', 'The compmiler should construct properly.');

						// Synthesize command-line parameters in here
						let tmpRunDate = tmpPict.Dates.dayJS().format(`YYYY-MM-DDTHH-mm-ss-SSSZZ`);
						tmpCompiler.CommandOptions = (
							{
								catalog_file: false,
								//directory_root: `${__dirname}/dist/indoctrinate-test-${tmpRunDate}`
							});

						tmpCompiler.compileContent(
							() =>
							{
								Expect(tmpCompiler.fable).to.have.property('IndoctrinateServiceCatalog');
								
								let tmpPackageJSONList = tmpCompiler.fable.IndoctrinateServiceCatalog.gatherContentByFilterSet([{Type:'Format', Format:'PackageDotJSON'}]);
								Expect(tmpPackageJSONList).to.be.an('array');
								Expect(tmpPackageJSONList.length).to.be.greaterThan(0);

								let tmpMarkdownList = tmpCompiler.fable.IndoctrinateServiceCatalog.gatherContentByFilterSet([{Labels:['examples', 'book', 'chapters', '02'], Type:'Label', MatchAll:true, Proximal:true, Sequential:true, OnlySetEnd:true}]);
								Expect(tmpMarkdownList).to.be.an('array');
								Expect(tmpMarkdownList.length).to.equal(2);

								return fNext();
							}
						);
					}
				);
			}
		);
	}
);