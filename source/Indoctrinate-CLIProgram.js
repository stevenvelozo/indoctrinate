const libCLIProgram = require('pict-service-commandlineutility');

let _Program = new libCLIProgram(require('./Indoctrinate-DefaultSettings.json'),
	[
		require('./commands/Indoctrinate-Command-Compile.js'),
		require('./commands/Indoctrinate-Command-ExtendedProcess.js')
	]);

_Program.fable.serviceManager.addServiceType('Indoctrinate', require(`./Indoctrinate-Fable-Service.js`));

module.exports = _Program;