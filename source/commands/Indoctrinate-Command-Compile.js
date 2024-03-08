const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class Compile extends libCLICommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'compile';

		this.options.Description = 'Compile content based on a configuration.';

		this.options.CommandOptions.push({ Name: '-c, --config [config_file]', Description: 'The indoctrinate configuration file to use.' });

		this.options.CommandOptions.push({ Name: '-d, --directory_root [directory_root]', Description: 'The root directory for relative paths in the config.  Defaults to CWD.' });

		this.options.CommandOptions.push({ Name: '-t, --target_output [target_output]', Description: 'The target output.  Defaults to ALL targets.' });

		this.options.CommandOptions.push({ Name: '-s, --stage_folder [stage_folder]', Description: 'The staging folder for intermediate files generated and/or downloaded during compilation.'})

		this.fable.serviceManager.addServiceType('IndoctrinateServiceInput', require(`../services/input/Indoctrinate-Service-Input.js`));
		this.fable.serviceManager.addServiceType('IndoctrinateServiceStructure', require(`../services/structure/Indoctrinate-Service-Structure.js`));
		this.fable.serviceManager.addServiceType('IndoctrinateServiceOutput', require(`../services/output/Indoctrinate-Service-Output.js`));
		
		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceInput');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceStructure');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceOutput');

		let tmpEntityType = this.ArgumentString;

		let tmpFilter = (typeof(this.CommandOptions.filter) == 'undefined') ? 'FBV~Deleted~EQ~0' : this.CommandOptions.filter;
		
	}
}

module.exports = Compile;