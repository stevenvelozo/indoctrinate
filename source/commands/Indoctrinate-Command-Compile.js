const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libPath = require('path');

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


		this.fable.serviceManager.addServiceType('IndoctrinateServiceInput', require(`../services/input/Indoctrinate-Service-Input.js`));
		this.fable.serviceManager.addServiceType('IndoctrinateServiceCatalog', require(`../services/catalog/Indoctrinate-Service-Catalog.js`));
		this.fable.serviceManager.addServiceType('IndoctrinateServiceProcessor', require(`../services/processor/Indoctrinate-Service-Processor.js`));
		this.fable.serviceManager.addServiceType('IndoctrinateServiceStructure', require(`../services/structure/Indoctrinate-Service-Structure.js`));
		this.fable.serviceManager.addServiceType('IndoctrinateServiceOutput', require(`../services/output/Indoctrinate-Service-Output.js`));

		this.addCommand();
	}

	prepareConfigurations(fCallback)
	{
		// Get the extraneous services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('FilePersistence');

		// Get the noun services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceCatalog');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceStructure');

		// Get the verb services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceInput');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceProcessor');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceOutput');

		// On the code flow diagram this is the "Source" box
				// If there is a root folder command-line parameter, use that
		this.pict.AppData.RootFolder = (typeof(this.CommandOptions.directory_root) == 'string') ? this.CommandOptions.directory_root
				// Otherwise if there is a root folder setting in the settings file, use that.
				: (typeof(this.fable.settings.RootFolder) == 'string') ? libPath.resolve(this.fable.settings.RootFolder)
				// Otherwise use the cwd
				: libPath.resolve(process.cwd());
		// Setup the ingestor to not create content tags for the root folder
		// NOTE: The root folder will likely change from workstation to workstation.
		this.fable.IndoctrinateIngestor.setRootFolderLabelSetFromPath(this.pict.AppData.RootFolder);
		// Add the root folder to the folders to scan
		this.fable.log.info(`Root folder [${this.pict.AppData.RootFolder}] will be scanned recursively for content...`);
		// TODO: We can add more "folders to scan" before starting the scan if we want to, either from CLI or a loaded config.  Just push them into the above array.

		// On the code flow diagram this is additional entries to the "Source" box
		this.pict.AppData.AdditionalScanFolders = (Array.isArray(this.fable.settings.AdditionalScanFolders)) ? this.fable.settings.AdditionalScanFolders : [];
		for (let i = 0; i < this.pict.AppData.AdditionalScanFolders; i++)
		{
			// TODO: Add error handling for bad paths?
			this.pict.AppData.AdditionalScanFolders[i] = libPath.resolve(this.pict.AppData.AdditionalScanFolders[i]);
		}

		// Setup the ingestor to not create content tags for the root folder
		// NOTE: The root folder will likely change from workstation to workstation.
		this.fable.IndoctrinateIngestor.setRootFolderLabelSetFromPath(this.pict.AppData.RootFolder);
		// Add the root folder to the folders to scan
		// TODO: We can add more "folders to scan" before starting the scan if we want to, either from CLI or a loaded config.  Just push them into the above array.

		// On the code flow diagram this is the "Destination" box
				// If there is a target output command-line parameter, use that.
		this.pict.AppData.OutputFolderPath = (typeof(this.CommandOptions.target_output) == 'string') ? libPath.resolve(this.CommandOptions.target_output)
				// Otherwise if there is a target output setting in the settings file, use that.
				: (typeof(this.fable.settings.TargetOutputFolder) == 'string') ? libPath.resolve(this.fable.settings.TargetOutputFolder)
				// Otherwise use the CWD and make a subfolder called dist to use
				// The default is because the github .gitignore for node.js ignores dist folders.
				: libPath.resolve(`${this.pict.AppData.RootFolder}/dist`);

		// On the code flow diagram this is the "Staging" box
				// If there is a staging command-line parameter, use that.
		this.pict.AppData.StageFolderPath = (typeof(this.CommandOptions.staging_folder) == 'string') ? libPath.resolve(this.CommandOptions.staging_folder)
				// Otherwise if there is a staging folder in the settings file, use that.
				// The default is just indoctrinate_dontent_staging in the output folder path.
				: libPath.resolve(`${this.pict.AppData.OutputFolderPath}/indoctrinate_content_staging`);

		this.pict.AppData.TargetFilter = (typeof(this.CommandOptions.target_filter) == 'string') ? this.CommandOptions.target_filter : false;

		this.pict.AppData.WriteCatalogFile = (typeof(this.CommandOptions.catalog_file) == 'boolean') ? this.CommandOptions.catalog_file : false;

		return fCallback();
	}

	writeCatalogAppDataFile(fCallback)
	{
		if (this.pict.AppData.WriteCatalogFile)
		{
			this.log.trace(`Caching Catalog Application Data to ${this.AppData.StageFolderPath}/Indoctrinate-Catalog-AppData.json`);
			this.fable.FilePersistence.writeFile(libPath.join(this.AppData.StageFolderPath, 'Indoctrinate-Catalog-AppData.json'), JSON.stringify(this.pict.AppData,null,4), fCallback);
		}
		else
		{
			return fCallback();
		}
	}

	compileContent(fCallback)
	{
		this.log.info(`Compiling documentation...`);

		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.log.info(`Documentation Phase 0: Preparing configurations....`);
				return this.prepareConfigurations(fNext);
			});

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.fable.log.info(`Target Output (Destination) folder [${this.pict.AppData.OutputFolderPath}] will be written to for each target hash.`);
				this.log.info(`...Creating Target Output (Destination) Folder if Necessary...`);
				this.fable.FilePersistence.makeFolderRecursive(this.fable.AppData.OutputFolderPath, fNext);
			});

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.fable.log.info(`Staging folder [${this.pict.AppData.StageFolderPath}] will contain the catalog, index and any necessary intermediate binary files.`);
				this.log.info(`...Creating Staging Folder if Necessary...`);
				this.fable.FilePersistence.makeFolderRecursive(this.fable.AppData.StageFolderPath, fNext);
			});

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.log.info(`Documentation Phase 1: Gathering source content metadata....`);
				return this.writeCatalogAppDataFile(fNext);
			});

		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceInput.scan.bind(this.fable.IndoctrinateServiceInput));
		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceInput.scanExtraFiles.bind(this.fable.IndoctrinateServiceInput));

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.log.info(`Documentation Phase 2: Compiling documentation content as data....`);
				return this.writeCatalogAppDataFile(fNext);
			});

		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceProcessor.processContentCatalog.bind(this.fable.IndoctrinateServiceProcessor));

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.log.info(`Documentation Phase 3: Generated structured content sets....`);
				return this.writeCatalogAppDataFile(fNext);
			});

		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceOutput.outputTargets.bind(this.fable.IndoctrinateServiceOutput));

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.log.info(`Documentation Phase 4: Copying content to custom destinations....`);
				return this.writeCatalogAppDataFile(fNext);
			});

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.log.info(`Documentation Phase 5: Cleanup....`);
				return this.writeCatalogAppDataFile(fNext);
			});

		tmpAnticipate.anticipate(
			(fNext)=>
			{
				this.log.info(`Documentation Phase 6: Indoctrination is complete.`);
				return this.writeCatalogAppDataFile(fNext);
			});

		return tmpAnticipate.wait(fCallback);

	}

	onRunAsync(fCallback)
	{
		return this.compileContent(fCallback);
	}
}

module.exports = Compile;