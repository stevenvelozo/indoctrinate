const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libPath = require('path');

class Compile extends libCLICommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'extended_process';

		this.options.Description = 'Run an extended processing step on cataloged content.';

		this.options.CommandArguments.push({ Name: '<appdata_file>', Description: 'The AppData file to load.' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		const tmpResolvedAppDataPath = libPath.resolve(this.ArgumentString);
		this.fable.log.info(`Loading AppData file: [${this.ArgumentString}] Resolved Path: [${tmpResolvedAppDataPath}]`);
		this.fable.AppData = require(tmpResolvedAppDataPath);

		let tmpIndoctrinate = this.fable.serviceManager.instantiateServiceProvider('Indoctrinate', this.CommandOptions);

		return tmpIndoctrinate.extendedProcessContent(fCallback);
	}
}

module.exports = Compile;