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

		//this.fable.AppData;

		this.log.info('Constructed the Indoctrinate Fable Service.');
	}

	// TODO: This uses the current AppData over CLI parameters which is bad -- but
	//       maybe not in all cases.  Need to diagram each option and decide for
	//       each one.
	prepareConfigurations(fCallback)
	{
		// On the code flow diagram this is the "Source" box
		// If there is a root folder setting already in AppData, prefer this.
		this.fable.AppData.RootFolder = (typeof(this.fable.AppData.RootFolder) == 'string') ? this.fable.AppData.RootFolder
				// If there is a root folder command-line parameter, use that
				: (typeof(this.options.directory_root) == 'string') ? this.options.directory_root
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
		this.fable.AppData.AdditionalScanFolders = (Array.isArray(this.fable.AppData.AdditionalScanFolders)) ? this.fable.AppData.AdditionalScanFolders 
			: (Array.isArray(this.fable.settings.AdditionalScanFolders)) ? this.fable.settings.AdditionalScanFolders 
			: [];
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
				// If this is already in the Appdata, use that.
		this.fable.AppData.OutputFolderPath = (typeof(this.fable.AppData.OutputFolderPath) == 'string') ? libPath.resolve(this.fable.AppData.OutputFolderPath)
				// If there is a target output command-line parameter, use that.
				: (typeof(this.options.target_output_folder) == 'string') ? libPath.resolve(this.options.target_output_folder)
				// Otherwise if there is a target output setting in the settings file, use that.
				: (typeof(this.fable.settings.TargetOutputFolder) == 'string') ? libPath.resolve(this.fable.settings.TargetOutputFolder)
				// Otherwise use the CWD and make a subfolder called dist to use
				// The default is because the github .gitignore for node.js ignores dist folders.
				: libPath.resolve(`${this.fable.AppData.RootFolder}/dist`);

		// On the code flow diagram this is the "Staging" box
				// If there is a staging command-line parameter, use that.
		this.fable.AppData.StageFolderPath = (typeof(this.fable.AppData.StageFolderPath) == 'string') ? libPath.resolve(this.fable.AppData.StageFolderPath)
				// If there is a staging command-line parameter, use that.
				: (typeof(this.options.staging_folder) == 'string') ? libPath.resolve(this.options.staging_folder)
				// Otherwise if there is a staging folder in the settings file, use that.
				// The default is just indoctrinate_dontent_staging in the output folder path.
				: libPath.resolve(`${this.fable.AppData.OutputFolderPath}/indoctrinate_content_staging`);

		this.fable.AppData.TargetFilter = (typeof(this.fable.AppData.TargetFilter) == 'string') ? this.fable.AppData.TargetFilter
				: (typeof(this.options.target_filter) == 'string') ? this.options.target_filter 
				: false;

		this.fable.AppData.WriteCatalogFile = (typeof(this.fable.AppData.WriteCatalogFile) == 'boolean') ? this.fable.AppData.WriteCatalogFile
				: (typeof(this.options.catalog_file) == 'boolean') ? this.options.catalog_file 
				: true;

		this.fable.AppData.IgnoreUnknownTypes = (typeof(this.fable.AppData.IgnoreUnknownTypes) == 'boolean') ? this.fable.AppData.IgnoreUnknownTypes
				: (typeof(this.options.ignore_unknown) == 'boolean') ? this.options.ignore_unknown 
				: false;

		return fCallback();
	}

	disableCatalogWrites(fCallback)
	{
		this.log.trace(`Disabling Catalog Writes -- stashing current setting of ${this.fable.AppData.WriteCatalogFile}`);
		this.stashedWriteCatalogFile = this.fable.AppData.WriteCatalogFile ? this.fable.AppData.WriteCatalogFile : false;
		this.fable.AppData.WriteCatalogFile = false;
		return fCallback();
	}

	restoreCatalogWrites(fCallback)
	{
		this.log.trace(`Restoring Catalog Writes -- setting to stashed setting of ${this.stashedWriteCatalogFile}`);
		this.fable.AppData.WriteCatalogFile = this.stashedWriteCatalogFile ? this.stashedWriteCatalogFile : false;
		return fCallback();
	}

	writeCatalogAppDataFile(fCallback)
	{
		if (this.fable.AppData.WriteCatalogFile)
		{
			this.log.trace(`Caching Catalog Application Data to ${this.fable.AppData.StageFolderPath}/Indoctrinate-Catalog-AppData.json`);
			this.fable.FilePersistence.writeFile(libPath.join(this.fable.AppData.StageFolderPath, 'Indoctrinate-Catalog-AppData.json'), JSON.stringify(this.fable.AppData,null,4), fCallback);
		}
		else
		{
			return fCallback();
		}
	}

	beginPhase(pAnticipate, pPhaseBeginMessage)
	{
		pAnticipate.anticipate(this.writeCatalogAppDataFile.bind(this));
		pAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(pPhaseBeginMessage);
				return fNext();
			}.bind(this));
	}

	initializeServiceProviders(fCallback)
	{
		this.log.info('Instantiating required fable services...')
		// Get the extraneous services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('FilePersistence');

		// Get the noun services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceCatalog');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceStructure');

		// Get the verb services up and ready to go
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceInput');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceProcessor');
		this.fable.serviceManager.instantiateServiceProvider('IndoctrinateServiceOutput');
		this.log.info('...fable services instantiated.')

		return fCallback();
	}

	prepareDestinationFolder(fCallback)
	{
		this.log.info(`Creating Target Output (Destination) folder [${this.fable.AppData.OutputFolderPath}].`);
		this.fable.FilePersistence.makeFolderRecursive(this.fable.AppData.OutputFolderPath, fCallback);
	}

	prepareStagingFolder(fCallback)
	{
		this.log.info(`Creating Staging folder [${this.fable.AppData.StageFolderPath}].`);
		this.fable.FilePersistence.makeFolderRecursive(this.fable.AppData.StageFolderPath, fCallback);
	}

	endPhase(pAnticipate, pPhaseEndMessage)
	{
		pAnticipate.anticipate(this.writeCatalogAppDataFile.bind(this));
		pAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(pPhaseEndMessage);
				return fNext();
			}.bind(this));
	}

	compileContent(fCallback)
	{
		let tmpAnticipate = this.fable.newAnticipate();

		this.beginPhase(tmpAnticipate, 'Indoctrination Phase 0: Compilation Environment Preparation');
		tmpAnticipate.anticipate(this.initializeServiceProviders.bind(this));
		tmpAnticipate.anticipate(this.prepareConfigurations.bind(this));
		tmpAnticipate.anticipate(this.prepareDestinationFolder.bind(this));
		tmpAnticipate.anticipate(this.prepareStagingFolder.bind(this));
		this.endPhase(tmpAnticipate, 'Preparation [Phase 0] Completed');

		this.beginPhase(tmpAnticipate, `Indoctrination Phase 1: Cataloging Source Content Metadata`);
		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceInput.scan.bind(this.fable.IndoctrinateServiceInput));
		// This is done in two steps because the first scan can find extra folders that we may want to scan
		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceInput.scanExtraFiles.bind(this.fable.IndoctrinateServiceInput));
		this.endPhase(tmpAnticipate, 'Cataloging [Phase 1] Completed');

		this.beginPhase(tmpAnticipate, `Indoctrination Phase 2: Processing Source Content Files`);
		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceProcessor.processContentCatalog.bind(this.fable.IndoctrinateServiceProcessor));
		this.endPhase(tmpAnticipate, 'Processing [Phase 2] Completed');


		this.beginPhase(tmpAnticipate, `Documentation Phase 3: Generating Structured Content`);
		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceOutput.outputTargets.bind(this.fable.IndoctrinateServiceOutput));
		this.endPhase(tmpAnticipate, 'Generation [Phase 3] Completed');

		this.beginPhase(tmpAnticipate, `Documentation Phase 4: Copying Content to Destination`);
		this.endPhase(tmpAnticipate, 'Copying [Phase 4] Completed');

		this.beginPhase(tmpAnticipate, `Documentation Phase 5: Cleanup....`);
		this.endPhase(tmpAnticipate, 'Cleanup [Phase 5] Completed');

		return tmpAnticipate.wait(fCallback);
	}

	extendedProcessContent(fCallback)
	{
		let tmpAnticipate = this.fable.newAnticipate();

		// No need to write the catalog file until we're done processing the set.
		tmpAnticipate.anticipate(this.disableCatalogWrites.bind(this));

		this.beginPhase(tmpAnticipate, 'Indoctrination Phase 0: Processing Environment Preparation');
		tmpAnticipate.anticipate(this.initializeServiceProviders.bind(this));
		tmpAnticipate.anticipate(this.prepareConfigurations.bind(this));
		tmpAnticipate.anticipate(this.prepareDestinationFolder.bind(this));
		tmpAnticipate.anticipate(this.prepareStagingFolder.bind(this));
		this.endPhase(tmpAnticipate, 'Preparation [Phase 0] Completed');

		this.beginPhase(tmpAnticipate, `Indoctrination Phase 1: Preparing the catalog for extended processing of Ingested Content`);
		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceProcessor.prepareCatalogForProcessing.bind(this.fable.IndoctrinateServiceProcessor));
		this.endPhase(tmpAnticipate, 'Processing [Phase 1] Completed');

		this.beginPhase(tmpAnticipate, `Indoctrination Phase 2: Executing extended processing of Ingested Content`);
		tmpAnticipate.anticipate(this.fable.IndoctrinateServiceProcessor.processContentCatalog.bind(this.fable.IndoctrinateServiceProcessor));
		tmpAnticipate.anticipate(this.restoreCatalogWrites.bind(this));
		this.endPhase(tmpAnticipate, 'Processing [Phase 2] Completed');

		return tmpAnticipate.wait(fCallback);
	}
}

module.exports = IndoctrinateFableService;