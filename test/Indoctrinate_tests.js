/**
* Unit tests for Indoctrinate
*
* @author      Steven Velozo <steven@velozo.com>
*/

const libIndoctrinate = require('../source/Indoctrinate-CLIProgram.js');

const Chai = require("chai");
const Expect = Chai.expect;

suite
(
	'Indoctrinate',
	() =>
	{
		setup ( () => {} );

		suite
		(
			'Execution Sanity',
			()=>
			{
				test
				(
					'The indoctrinate CLIProgram should load up okay.',
					()=>
					{
						Expect(libIndoctrinate.settings.Product).to.equal('Indoctrinate');
					}
				);
			}
		);
	}
);