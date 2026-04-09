/**
* Generate Retold Keyword Index Command
*
* Scans the retold modules directory (or loads a previous catalog),
* processes all markdown content, and outputs a lunr-based keyword
* search index for the Docsify hub.
*
* @author Steven Velozo <steven@velozo.com>
*/

const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libPath = require('path');

class GenerateKeywordIndex extends libCLICommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'generate_keyword_index';

		this.options.Description = 'Generate a keyword search index from Retold module documentation.';

		this.options.CommandOptions.push({ Name: '-d, --directory_root [directory_root]', Description: 'The root directory of the retold modules folder.  Defaults to CWD.' });
		this.options.CommandOptions.push({ Name: '-e, --extra_scan [extra_scan]', Description: 'Additional directory to scan (e.g. docs folder for local content).' });
		this.options.CommandOptions.push({ Name: '-o, --output_file [output_file]', Description: 'The output file path for the keyword index JSON.  Defaults to ./retold-keyword-index.json.' });
		this.options.CommandOptions.push({ Name: '-a, --appdata_file [appdata_file]', Description: 'Load a previously saved AppData JSON instead of re-scanning.' });
		this.options.CommandOptions.push({ Name: '-c, --catalog_file', Description: 'Write out the catalog Application Data file.' });
		this.options.CommandOptions.push({ Name: '-x, --excluded_modules [excluded_modules]', Description: 'Comma-separated list of module names to exclude from the keyword index (e.g. "retold-remote-desktop,retold-remote-ios").  Merged with any ExcludedModules list in the loaded config file.' });

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
			tmpCommandOptions.output_file = libPath.resolve(process.cwd(), 'retold-keyword-index.json');
		}
		else
		{
			if (!libPath.isAbsolute(tmpCommandOptions.output_file))
			{
				tmpCommandOptions.output_file = libPath.resolve(tmpCommandOptions.output_file);
			}
		}

		// Resolve extra_scan directory and add it to AdditionalScanFolders
		if (tmpCommandOptions.extra_scan && tmpCommandOptions.extra_scan !== '')
		{
			let tmpExtraScan = libPath.isAbsolute(tmpCommandOptions.extra_scan)
				? tmpCommandOptions.extra_scan
				: libPath.resolve(tmpCommandOptions.extra_scan);
			this.fable.AppData.AdditionalScanFolders = [tmpExtraScan];
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

		// If an appdata file is provided, load it and skip scanning
		if (tmpCommandOptions.appdata_file && tmpCommandOptions.appdata_file !== '')
		{
			let tmpResolvedPath = libPath.resolve(tmpCommandOptions.appdata_file);
			this.fable.log.info(`Loading AppData file: [${tmpCommandOptions.appdata_file}] Resolved Path: [${tmpResolvedPath}]`);
			try
			{
				this.fable.AppData = require(tmpResolvedPath);
			}
			catch (pError)
			{
				this.fable.log.error(`Error loading AppData file [${tmpResolvedPath}]: ${pError}`);
				return fCallback(pError);
			}
			return tmpIndoctrinate.generateKeywordIndexFromAppData(fCallback);
		}

		return tmpIndoctrinate.generateKeywordIndex(fCallback);
	}
}

module.exports = GenerateKeywordIndex;
