const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libFS = require('fs');
const libPath = require('path');

class Compile extends libCLICommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'compile';

		this.options.Description = 'Compile content based on a configuration.';

		this.options.CommandOptions.push({ Name: '-c, --catalog_file', Description: 'Write out the catalog Application Data file (this might be pretty big).' });
		this.options.CommandOptions.push({ Name: '-i, --ignore_unknown', Description: 'Ignore unknown file types.' });


		this.options.CommandOptions.push({ Name: '-d, --directory_root [directory_root]', Description: 'The root directory for relative paths in the config.  Defaults to CWD.' });
		this.options.CommandOptions.push({ Name: '-s, --staging_folder [staging_folder]', Description: 'The staging folder for intermediate files generated and/or downloaded during compilation.'})

		this.options.CommandOptions.push({ Name: '-t, --target_output_folder [target_output_folder]', Description: 'The folder to ouput to.' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpCommandOptions = this.CommandOptions;

		// Chck if the directory_root is set, if not, use the current working directory
		if (!tmpCommandOptions.directory_root || tmpCommandOptions.directory_root === '')
		{
			tmpCommandOptions.directory_root = process.cwd();
		}
		else
		{
			// Check if the diretory_root is a relative path, if so, resolve it to an absolute path
			if (!libPath.isAbsolute(tmpCommandOptions.directory_root))
			{
				tmpCommandOptions.directory_root = libPath.resolve(tmpCommandOptions.directory_root);
			}
			tmpCommandOptions.directory_root = libPath.resolve(tmpCommandOptions.directory_root);
		}

		// Check if the target_output_folder is set, if not, use the current working directory
		if (!tmpCommandOptions.target_output_folder || tmpCommandOptions.target_output_folder === '')
		{
			tmpCommandOptions.target_output_folder = process.cwd();
		}
		else
		{
			// Check if the target_output_folder is a relative path, if so, resolve it to an absolute path
			if (!libPath.isAbsolute(tmpCommandOptions.target_output_folder))
			{
				tmpCommandOptions.target_output_folder = libPath.resolve(tmpCommandOptions.target_output_folder);
			}
			tmpCommandOptions.target_output_folder = libPath.resolve(tmpCommandOptions.target_output_folder);
		}

		let tmpIndoctrinate = this.fable.serviceManager.instantiateServiceProvider('Indoctrinate', this.CommandOptions);

		return tmpIndoctrinate.compileContent(fCallback);
	}
}

module.exports = Compile;