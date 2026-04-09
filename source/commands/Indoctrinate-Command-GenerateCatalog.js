/**
* Generate Retold Documentation Catalog Command
*
* Scans the retold modules directory, discovers documentation,
* parses sidebars, and outputs a unified navigation catalog JSON.
*
* @author Steven Velozo <steven@velozo.com>
*/

const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libPath = require('path');

class GenerateCatalog extends libCLICommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'generate_catalog';

		this.options.Description = 'Generate a unified documentation catalog from Retold modules.';

		this.options.CommandOptions.push({ Name: '-d, --directory_root [directory_root]', Description: 'The root directory of the retold modules folder.  Defaults to CWD.' });
		this.options.CommandOptions.push({ Name: '-o, --output_file [output_file]', Description: 'The output file path for the catalog JSON.  Defaults to ./retold-catalog.json.' });
		this.options.CommandOptions.push({ Name: '-b, --branch [branch]', Description: 'The default git branch for GitHub raw URLs.  Defaults to master.' });
		this.options.CommandOptions.push({ Name: '-g, --github_org [github_org]', Description: 'The GitHub organization or user for raw URLs.  Defaults to stevenvelozo.' });
		this.options.CommandOptions.push({ Name: '-c, --catalog_file', Description: 'Write out the catalog Application Data file (this might be pretty big).' });
		this.options.CommandOptions.push({ Name: '-x, --excluded_modules [excluded_modules]', Description: 'Comma-separated list of module names to exclude from the catalog (e.g. "retold-remote-desktop,retold-remote-ios").  Merged with any ExcludedModules list in the loaded config file.' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpCommandOptions = this.CommandOptions;

		// Resolve directory_root
		if (!tmpCommandOptions.directory_root || tmpCommandOptions.directory_root === '')
		{
			tmpCommandOptions.directory_root = process.cwd();
		}
		else
		{
			if (!libPath.isAbsolute(tmpCommandOptions.directory_root))
			{
				tmpCommandOptions.directory_root = libPath.resolve(tmpCommandOptions.directory_root);
			}
			tmpCommandOptions.directory_root = libPath.resolve(tmpCommandOptions.directory_root);
		}

		// Resolve output_file
		if (!tmpCommandOptions.output_file || tmpCommandOptions.output_file === '')
		{
			tmpCommandOptions.output_file = libPath.resolve(process.cwd(), 'retold-catalog.json');
		}
		else
		{
			if (!libPath.isAbsolute(tmpCommandOptions.output_file))
			{
				tmpCommandOptions.output_file = libPath.resolve(tmpCommandOptions.output_file);
			}
		}

		// Set defaults for branch and github_org
		if (!tmpCommandOptions.branch || tmpCommandOptions.branch === '')
		{
			tmpCommandOptions.branch = 'master';
		}

		if (!tmpCommandOptions.github_org || tmpCommandOptions.github_org === '')
		{
			tmpCommandOptions.github_org = 'stevenvelozo';
		}

		// Resolve ExcludedModules from the auto-gathered config file plus any
		// CLI flag.  This ends up as an already-resolved array on the command
		// options so the Indoctrinate service can read it directly.
		let tmpExcludedModules = [];
		if (this.pict && this.pict.ProgramConfiguration && Array.isArray(this.pict.ProgramConfiguration.ExcludedModules))
		{
			for (let i = 0; i < this.pict.ProgramConfiguration.ExcludedModules.length; i++)
			{
				let tmpEntry = this.pict.ProgramConfiguration.ExcludedModules[i];
				if (typeof(tmpEntry) === 'string' && tmpEntry.length > 0 && tmpExcludedModules.indexOf(tmpEntry) < 0)
				{
					tmpExcludedModules.push(tmpEntry);
				}
			}
		}
		if (typeof(tmpCommandOptions.excluded_modules) === 'string' && tmpCommandOptions.excluded_modules.length > 0)
		{
			let tmpCLIParts = tmpCommandOptions.excluded_modules.split(',');
			for (let i = 0; i < tmpCLIParts.length; i++)
			{
				let tmpCLIEntry = tmpCLIParts[i].trim();
				if (tmpCLIEntry.length > 0 && tmpExcludedModules.indexOf(tmpCLIEntry) < 0)
				{
					tmpExcludedModules.push(tmpCLIEntry);
				}
			}
		}
		tmpCommandOptions.ExcludedModules = tmpExcludedModules;

		let tmpIndoctrinate = this.fable.serviceManager.instantiateServiceProvider('Indoctrinate', this.CommandOptions);

		return tmpIndoctrinate.generateCatalog(fCallback);
	}
}

module.exports = GenerateCatalog;
