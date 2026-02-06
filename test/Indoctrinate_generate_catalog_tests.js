/**
* Unit tests for Retold Documentation Catalog Generation
*
* @author Steven Velozo <steven@velozo.com>
*/

const libPict = require('pict-service-commandlineutility');
const libIndoctrinateCompiler = require('../source/Indoctrinate-Fable-Service.js');

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Retold Catalog Generation',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Sidebar Parsing',
			() =>
			{
				test
				(
					'Should parse a standard _sidebar.md into a navigation tree',
					(fNext) =>
					{
						let tmpPict = new libPict();
						tmpPict.addServiceType('IndoctrinateCompiler', libIndoctrinateCompiler);
						let tmpCompiler = tmpPict.instantiateServiceProvider('IndoctrinateCompiler', {});

						let tmpRetoldCatalog = tmpPict.IndoctrinateRetoldCatalog;
						Expect(tmpRetoldCatalog).to.be.an('object');

						let tmpSidebarContent = [
							'- Getting Started',
							'',
							'  - [Introduction](/)',
							'  - [Quick Start](getting-started.md)',
							'',
							'- Configuration',
							'',
							'  - [Configuration](configuration.md)',
							'',
							'- API Reference',
							'',
							'  - [API Reference](api-reference.md)',
						].join('\n');

						let tmpResult = tmpRetoldCatalog.parseSidebar(tmpSidebarContent);

						Expect(tmpResult).to.be.an('array');
						Expect(tmpResult.length).to.equal(3);

						// First section: Getting Started
						Expect(tmpResult[0].Title).to.equal('Getting Started');
						Expect(tmpResult[0].Children).to.be.an('array');
						Expect(tmpResult[0].Children.length).to.equal(2);
						Expect(tmpResult[0].Children[0].Title).to.equal('Introduction');
						Expect(tmpResult[0].Children[0].Path).to.equal('README.md');
						Expect(tmpResult[0].Children[1].Title).to.equal('Quick Start');
						Expect(tmpResult[0].Children[1].Path).to.equal('getting-started.md');

						// Second section: Configuration
						Expect(tmpResult[1].Title).to.equal('Configuration');
						Expect(tmpResult[1].Children.length).to.equal(1);

						// Third section: API Reference
						Expect(tmpResult[2].Title).to.equal('API Reference');
						Expect(tmpResult[2].Children.length).to.equal(1);
						Expect(tmpResult[2].Children[0].Path).to.equal('api-reference.md');

						return fNext();
					}
				);

				test
				(
					'Should handle empty and null sidebar content',
					(fNext) =>
					{
						let tmpPict = new libPict();
						tmpPict.addServiceType('IndoctrinateCompiler', libIndoctrinateCompiler);
						let tmpCompiler = tmpPict.instantiateServiceProvider('IndoctrinateCompiler', {});

						let tmpRetoldCatalog = tmpPict.IndoctrinateRetoldCatalog;

						Expect(tmpRetoldCatalog.parseSidebar('')).to.be.an('array').that.is.empty;
						Expect(tmpRetoldCatalog.parseSidebar(null)).to.be.an('array').that.is.empty;
						Expect(tmpRetoldCatalog.parseSidebar(undefined)).to.be.an('array').that.is.empty;

						return fNext();
					}
				);

				test
				(
					'Should normalize sidebar paths correctly',
					(fNext) =>
					{
						let tmpPict = new libPict();
						tmpPict.addServiceType('IndoctrinateCompiler', libIndoctrinateCompiler);
						let tmpCompiler = tmpPict.instantiateServiceProvider('IndoctrinateCompiler', {});

						let tmpRetoldCatalog = tmpPict.IndoctrinateRetoldCatalog;

						// Root path converts to README.md
						Expect(tmpRetoldCatalog.normalizeSidebarPath('/')).to.equal('README.md');

						// Directory paths get README.md appended
						Expect(tmpRetoldCatalog.normalizeSidebarPath('api/')).to.equal('api/README.md');

						// Leading slash stripped
						Expect(tmpRetoldCatalog.normalizeSidebarPath('/getting-started.md')).to.equal('getting-started.md');

						// Normal paths unchanged
						Expect(tmpRetoldCatalog.normalizeSidebarPath('getting-started.md')).to.equal('getting-started.md');

						return fNext();
					}
				);
			}
		);

		suite
		(
			'Catalog Generation from Mock Modules',
			() =>
			{
				test
				(
					'Should scan mock modules and build a catalog',
					(fNext) =>
					{
						let tmpPict = new libPict();
						tmpPict.instantiateServiceProvider('Dates');
						tmpPict.addServiceType('IndoctrinateCompiler', libIndoctrinateCompiler);

						let tmpRunDate = tmpPict.Dates.dayJS().format(`YYYY-MM-DDTHH-mm-ss-SSSZZ`);

						let tmpCompiler = tmpPict.instantiateServiceProvider('IndoctrinateCompiler', {
							catalog_file: false,
							directory_root: `${__dirname}/test_data/mock_modules`,
							staging_folder: `${__dirname}/../dist/unit_tests/stage/catalog-test-${tmpRunDate}`,
							target_output_folder: `${__dirname}/../dist/unit_tests/target/catalog-test-${tmpRunDate}`,
							output_file: `${__dirname}/../dist/unit_tests/target/catalog-test-${tmpRunDate}/retold-catalog.json`,
							github_org: 'stevenvelozo',
							branch: 'master'
						});

						Expect(tmpCompiler).to.be.an('object');

						tmpCompiler.generateCatalog(
							(pError) =>
							{
								Expect(pError).to.not.be.an('Error');

								let tmpCatalog = tmpCompiler.retoldCatalog;
								Expect(tmpCatalog).to.be.an('object');
								Expect(tmpCatalog.Generated).to.be.a('string');
								Expect(tmpCatalog.GitHubOrg).to.equal('stevenvelozo');
								Expect(tmpCatalog.DefaultBranch).to.equal('master');
								Expect(tmpCatalog.Groups).to.be.an('array');

								// We should have at least fable and meadow groups (pict has no docs)
								let tmpFableGroup = tmpCatalog.Groups.find((pGroup) => pGroup.Key === 'fable');
								let tmpMeadowGroup = tmpCatalog.Groups.find((pGroup) => pGroup.Key === 'meadow');
								let tmpPictGroup = tmpCatalog.Groups.find((pGroup) => pGroup.Key === 'pict');

								Expect(tmpFableGroup).to.be.an('object');
								Expect(tmpFableGroup.Name).to.equal('Fable');
								Expect(tmpFableGroup.Modules).to.be.an('array');
								Expect(tmpFableGroup.Modules.length).to.be.greaterThan(0);

								// Check the fable module has docs
								let tmpFableModule = tmpFableGroup.Modules.find((pMod) => pMod.Name === 'test-fable-module');
								Expect(tmpFableModule).to.be.an('object');
								Expect(tmpFableModule.HasDocs).to.equal(true);
								Expect(tmpFableModule.HasCover).to.equal(true);
								Expect(tmpFableModule.Sidebar).to.be.an('array');
								Expect(tmpFableModule.Sidebar.length).to.be.greaterThan(0);
								Expect(tmpFableModule.DocFiles).to.be.an('array');
								Expect(tmpFableModule.DocFiles).to.include('README.md');

								// Check meadow module
								Expect(tmpMeadowGroup).to.be.an('object');
								let tmpMeadowModule = tmpMeadowGroup.Modules.find((pMod) => pMod.Name === 'test-meadow-module');
								Expect(tmpMeadowModule).to.be.an('object');
								Expect(tmpMeadowModule.HasDocs).to.equal(true);
								Expect(tmpMeadowModule.Sidebar).to.be.an('array');

								// Check pict module has no docs
								if (tmpPictGroup)
								{
									let tmpNoDocs = tmpPictGroup.Modules.find((pMod) => pMod.Name === 'test-no-docs-module');
									if (tmpNoDocs)
									{
										Expect(tmpNoDocs.HasDocs).to.equal(false);
									}
								}

								return fNext();
							}
						);
					}
				);
			}
		);
	}
);
