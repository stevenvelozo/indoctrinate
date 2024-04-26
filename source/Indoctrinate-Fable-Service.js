const libPict = require('pict');
const libPath = require('path');

class IndoctrinateFableService extends libPict.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateFableService';

		if (!this.fable.hasOwnProperty('IndoctrinateServiceCatalog'))
		{
			this.fable.serviceManager.addServiceType('IndoctrinateServiceCatalog', require(`./services/catalog/Indoctrinate-Service-Catalog.js`));
		}
		if (!this.fable.hasOwnProperty('IndoctrinateServiceStructure'))
		{
			this.fable.serviceManager.addServiceType('IndoctrinateServiceStructure', require(`./services/structure/Indoctrinate-Service-Structure.js`));
		}

		if (!this.fable.hasOwnProperty('IndoctrinateServiceInput'))
		{
			this.fable.serviceManager.addServiceType('IndoctrinateServiceInput', require(`./services/input/Indoctrinate-Service-Input.js`));
		}
		if (!this.fable.hasOwnProperty('IndoctrinateServiceProcessor'))
		{
			this.fable.serviceManager.addServiceType('IndoctrinateServiceProcessor', require(`./services/processor/Indoctrinate-Service-Processor.js`));
		}
		if (!this.fable.hasOwnProperty('IndoctrinateServiceOutput'))
		{
			this.fable.serviceManager.addServiceType('IndoctrinateServiceOutput', require(`./services/output/Indoctrinate-Service-Output.js`));
		}

		if (!this.fable.hasOwnProperty('AppData'))
		{
			this.fable.AppData = {};
		}

		this.operation = this.fable.instantiateServiceProvider('Operation',
			{
				Name: 'Indoctrinate Content Compilation and Transformation'
			})

		this.fable.AppData.Operation = this.operation.state;

		this.log.info('Constructed the Indoctrinate Fable Service.');
	}

	prepareConfigurations(fCallback)
	{
		this.setProgressTrackerTotalOperations(1);

		// On the code flow diagram this is the "Source" box
				// If there is a root folder command-line parameter, use that
		this.fable.AppData.RootFolder = (typeof(this.options.directory_root) == 'string') ? this.options.directory_root
				// Otherwise if there is a root folder setting in the settings file, use that.
				: (typeof(this.fable.settings.RootFolder) == 'string') ? libPath.resolve(this.fable.settings.RootFolder)
				// Otherwise use the cwd
				: libPath.resolve(process.cwd());

		// Setup the ingestor to not create content tags for the root folder
		// NOTE: The root folder will likely change from workstation to workstation.
		this.fable.IndoctrinateIngestor.setRootFolderLabelSetFromPath(this.fable.AppData.RootFolder);
		// Add the root folder to the folders to scan
		this.log.info(`Root folder [${this.fable.AppData.RootFolder}] will be scanned recursively for content...`);
		// TODO: We can add more "folders to scan" before starting the scan if we want to, either from CLI or a loaded config.  Just push them into the above array.

		// On the code flow diagram this is additional entries to the "Source" box
		this.fable.AppData.AdditionalScanFolders = (Array.isArray(this.fable.settings.AdditionalScanFolders)) ? this.fable.settings.AdditionalScanFolders : [];
		for (let i = 0; i < this.fable.AppData.AdditionalScanFolders; i++)
		{
			// TODO: Add error handling for bad paths?
			this.fable.AppData.AdditionalScanFolders[i] = libPath.resolve(this.fable.AppData.AdditionalScanFolders[i]);
		}

		// Setup the ingestor to not create content tags for the root folder
		// NOTE: The root folder will likely change from workstation to workstation.
		this.fable.IndoctrinateIngestor.setRootFolderLabelSetFromPath(this.fable.AppData.RootFolder);
		// Add the root folder to the folders to scan
		// TODO: We can add more "folders to scan" before starting the scan if we want to, either from CLI or a loaded config.  Just push them into the above array.

		// On the code flow diagram this is the "Destination" box
				// If there is a target output command-line parameter, use that.
		this.fable.AppData.OutputFolderPath = (typeof(this.options.target_output) == 'string') ? libPath.resolve(this.options.target_output)
				// Otherwise if there is a target output setting in the settings file, use that.
				: (typeof(this.fable.settings.TargetOutputFolder) == 'string') ? libPath.resolve(this.fable.settings.TargetOutputFolder)
				// Otherwise use the CWD and make a subfolder called dist to use
				// The default is because the github .gitignore for node.js ignores dist folders.
				: libPath.resolve(`${this.fable.AppData.RootFolder}/dist`);

		// On the code flow diagram this is the "Staging" box
				// If there is a staging command-line parameter, use that.
		this.fable.AppData.StageFolderPath = (typeof(this.options.staging_folder) == 'string') ? libPath.resolve(this.options.staging_folder)
				// Otherwise if there is a staging folder in the settings file, use that.
				// The default is just indoctrinate_dontent_staging in the output folder path.
				: libPath.resolve(`${this.fable.AppData.OutputFolderPath}/indoctrinate_content_staging`);

		this.fable.AppData.TargetFilter = (typeof(this.options.target_filter) == 'string') ? this.options.target_filter : false;

		this.fable.AppData.WriteCatalogFile = (typeof(this.options.catalog_file) == 'boolean') ? this.options.catalog_file : true;

		this.incrementProgressTracker(1);

		return fCallback();
	}

	writeCatalogAppDataFile(fCallback)
	{
		this.setProgressTrackerTotalOperations(1);

		if (this.fable.AppData.WriteCatalogFile)
		{
			this.log.trace(`Caching Catalog Application Data to ${this.fable.AppData.StageFolderPath}/Indoctrinate-Catalog-AppData.json`);
			this.incrementProgressTracker(1);
			this.fable.FilePersistence.writeFile(libPath.join(this.fable.AppData.StageFolderPath, 'Indoctrinate-Catalog-AppData.json'), JSON.stringify(this.fable.AppData,null,4), fCallback);
		}
		else
		{
			this.incrementProgressTracker(1);
			return fCallback();
		}
	}

	compileContent(fCallback)
	{
		this.operation.info(`Indoctrination compiler warming up...`);

		// Get the extraneous services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('FilePersistence');

		// Get the noun services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceCatalog');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceStructure');

		// Get the verb services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceInput');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceProcessor');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceOutput');


		this.operation.addStep(this.writeCatalogAppDataFile, 'Indoctrination Phase 0: Perparation');

		this.operation.addStep(this.prepareConfigurations, 'Preparing Configurations');

		this.operation.addStep(
			function (fNext)
			{
				this.setProgressTrackerTotalOperations(1);
				this.fable.FilePersistence.makeFolderRecursive(this.fable.AppData.OutputFolderPath, fNext);
				this.incrementProgressTracker(1);
			}, {}, `Creating Target Output (Destination) folder [${this.fable.AppData.OutputFolderPath}].`);

		this.operation.addStep(
			(fNext)=>
			{
				this.fable.FilePersistence.makeFolderRecursive(this.fable.AppData.StageFolderPath, fNext);
			}, {}, `Creating Staging folder [${this.fable.AppData.StageFolderPath}].`);

		this.operation.addStep(this.writeCatalogAppDataFile, `Indoctrination Phase 1: Gathering source content metadata....`);

		this.operation.addStep(this.fable.IndoctrinateServiceInput.scan.bind(this.fable.IndoctrinateServiceInput));
		this.operation.addStep(this.fable.IndoctrinateServiceInput.scanExtraFiles.bind(this.fable.IndoctrinateServiceInput));

		this.operation.addStep(this.writeCatalogAppDataFile, `Indoctrination Phase 1: Gathering source content metadata....`);

		this.operation.addStep(this.fable.IndoctrinateServiceProcessor.processContentCatalog.bind(this.fable.IndoctrinateServiceProcessor));

		this.operation.addStep(this.writeCatalogAppDataFile, `Documentation Phase 2: Compiling documentation content as data....`);

		this.operation.addStep(this.writeCatalogAppDataFile, `Documentation Phase 3: Generated structured content sets....`);
		this.operation.addStep(this.fable.IndoctrinateServiceOutput.outputTargets.bind(this.fable.IndoctrinateServiceOutput));

		this.operation.addStep(this.writeCatalogAppDataFile, `Documentation Phase 4: Copying content to custom destinations....`);

		this.operation.addStep(this.writeCatalogAppDataFile, `Documentation Phase 5: Cleanup....`);

		this.operation.addStep(this.writeCatalogAppDataFile, `Documentation Phase 6: Indoctrination is complete.`);

		return this.operation.execute(fCallback);
	}
}

module.exports = IndoctrinateFableService;