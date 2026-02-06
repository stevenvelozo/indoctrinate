/**
* Unit tests for Retold Keyword Index Generation
*
* @author Steven Velozo <steven@velozo.com>
*/

const libPict = require('pict-service-commandlineutility');
const libLunr = require('lunr');
const libIndoctrinateCompiler = require('../source/Indoctrinate-Fable-Service.js');

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Retold Keyword Index Generation',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Markdown Stripping',
			() =>
			{
				test
				(
					'Should strip markdown formatting to plain text',
					(fNext) =>
					{
						let tmpPict = new libPict();
						tmpPict.addServiceType('IndoctrinateCompiler', libIndoctrinateCompiler);
						let tmpCompiler = tmpPict.instantiateServiceProvider('IndoctrinateCompiler', {});

						let tmpKeywordIndex = tmpPict.IndoctrinateRetoldKeywordIndex;
						Expect(tmpKeywordIndex).to.be.an('object');

						// Headers
						let tmpResult = tmpKeywordIndex.stripMarkdown('# Hello World');
						Expect(tmpResult).to.equal('Hello World');

						// Links
						tmpResult = tmpKeywordIndex.stripMarkdown('[Click Here](http://example.com)');
						Expect(tmpResult).to.equal('Click Here');

						// Emphasis
						tmpResult = tmpKeywordIndex.stripMarkdown('This is **bold** and *italic*');
						Expect(tmpResult).to.include('bold');
						Expect(tmpResult).to.include('italic');

						// Code blocks
						tmpResult = tmpKeywordIndex.stripMarkdown('Text before\n```javascript\nconst x = 1;\n```\nText after');
						Expect(tmpResult).to.include('Text before');
						Expect(tmpResult).to.include('Text after');
						Expect(tmpResult).to.not.include('const x');

						// Inline code
						tmpResult = tmpKeywordIndex.stripMarkdown('Use `npm install` to install');
						Expect(tmpResult).to.include('Use');
						Expect(tmpResult).to.include('to install');

						// Null/empty
						Expect(tmpKeywordIndex.stripMarkdown('')).to.equal('');
						Expect(tmpKeywordIndex.stripMarkdown(null)).to.equal('');
						Expect(tmpKeywordIndex.stripMarkdown(undefined)).to.equal('');

						return fNext();
					}
				);
			}
		);

		suite
		(
			'Keyword Index from Mock Modules',
			() =>
			{
				test
				(
					'Should build a searchable keyword index from mock modules',
					(fNext) =>
					{
						let tmpPict = new libPict();
						tmpPict.instantiateServiceProvider('Dates');
						tmpPict.addServiceType('IndoctrinateCompiler', libIndoctrinateCompiler);

						let tmpRunDate = tmpPict.Dates.dayJS().format(`YYYY-MM-DDTHH-mm-ss-SSSZZ`);

						let tmpCompiler = tmpPict.instantiateServiceProvider('IndoctrinateCompiler', {
							catalog_file: false,
							directory_root: `${__dirname}/test_data/mock_modules`,
							staging_folder: `${__dirname}/../dist/unit_tests/stage/keyword-test-${tmpRunDate}`,
							target_output_folder: `${__dirname}/../dist/unit_tests/target/keyword-test-${tmpRunDate}`,
							output_file: `${__dirname}/../dist/unit_tests/target/keyword-test-${tmpRunDate}/retold-keyword-index.json`,
						});

						Expect(tmpCompiler).to.be.an('object');

						tmpCompiler.generateKeywordIndex(
							(pError) =>
							{
								Expect(pError).to.not.be.an('Error');

								let tmpIndexResult = tmpCompiler.retoldKeywordIndex;
								Expect(tmpIndexResult).to.be.an('object');
								Expect(tmpIndexResult.Generated).to.be.a('string');
								Expect(tmpIndexResult.DocumentCount).to.be.a('number');
								Expect(tmpIndexResult.DocumentCount).to.be.greaterThan(0);
								Expect(tmpIndexResult.LunrIndex).to.be.an('object');
								Expect(tmpIndexResult.Documents).to.be.an('object');

								// Verify the lunr index can be loaded and searched
								let tmpLunrIndex = libLunr.Index.load(tmpIndexResult.LunrIndex);
								Expect(tmpLunrIndex).to.be.an('object');

								// Search for a term that should be in the mock content
								let tmpResults = tmpLunrIndex.search('fable');
								Expect(tmpResults).to.be.an('array');
								Expect(tmpResults.length).to.be.greaterThan(0);

								// Search for a term specific to meadow docs
								let tmpMeadowResults = tmpLunrIndex.search('schema');
								Expect(tmpMeadowResults).to.be.an('array');
								Expect(tmpMeadowResults.length).to.be.greaterThan(0);

								// Verify document references exist for results
								for (let i = 0; i < tmpResults.length; i++)
								{
									let tmpDocRef = tmpResults[i].ref;
									Expect(tmpIndexResult.Documents).to.have.property(tmpDocRef);
									Expect(tmpIndexResult.Documents[tmpDocRef]).to.have.property('Module');
									Expect(tmpIndexResult.Documents[tmpDocRef]).to.have.property('Group');
									Expect(tmpIndexResult.Documents[tmpDocRef]).to.have.property('DocPath');
								}

								// Search for CRUD (meadow-specific)
								let tmpCrudResults = tmpLunrIndex.search('crud');
								Expect(tmpCrudResults).to.be.an('array');
								Expect(tmpCrudResults.length).to.be.greaterThan(0);

								return fNext();
							}
						);
					}
				);
			}
		);
	}
);
