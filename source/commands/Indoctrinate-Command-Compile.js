const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class Compile extends libCLICommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'compile';

		this.options.Description = 'Compile content based on a configuration.';

		this.options.CommandOptions.push({ Name: '-c, --catalog_file', Description: 'Write out the catalog Application Data file (this might be pretty big).' });


		this.options.CommandOptions.push({ Name: '-d, --directory_root [directory_root]', Description: 'The root directory for relative paths in the config.  Defaults to CWD.' });
		this.options.CommandOptions.push({ Name: '-s, --staging_folder [staging_folder]', Description: 'The staging folder for intermediate files generated and/or downloaded during compilation.'})

		this.options.CommandOptions.push({ Name: '-t, --target_filter [target_filter]', Description: 'The filter to constrain targets by.' });

		this.fable.serviceManager.addServiceType('Indoctrinate', require(`../Indoctrinate-Fable-Service.js`));

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpIndoctrinate = this.fable.serviceManager.instantiateServiceProvider('Indoctrinate', this.CommandOptions);

		return tmpIndoctrinate.compileContent(fCallback);
	}
}

module.exports = Compile;