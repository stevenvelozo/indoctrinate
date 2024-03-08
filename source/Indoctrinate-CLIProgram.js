const libCLIProgram = require('pict-service-commandlineutility');

let _Program = new libCLIProgram(require('./Indoctrinate-DefaultSettings.json'),
	[
		// This array contains the command line command classes.
		require('./commands/Indoctrinate-Command-Compile.js')
	]);

module.exports = _Program;