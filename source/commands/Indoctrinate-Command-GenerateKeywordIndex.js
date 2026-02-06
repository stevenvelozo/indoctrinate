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
		this.options.CommandOptions.push({ Name: '-o, --output_file [output_file]', Description: 'The output file path for the keyword index JSON.  Defaults to ./retold-keyword-index.json.' });
		this.options.CommandOptions.push({ Name: '-a, --appdata_file [appdata_file]', Description: 'Load a previously saved AppData JSON instead of re-scanning.' });
		this.options.CommandOptions.push({ Name: '-c, --catalog_file', Description: 'Write out the catalog Application Data file.' });

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
