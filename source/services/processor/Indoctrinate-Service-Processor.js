const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

const libIndoctrinateUnderstandFile = require('./understand/Indoctrinate-Understand-File.js');

class IndoctrinateServiceProcessor extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'IndoctrinateProcessor';

		this.processingTasks = [];

		this.fable.addServiceTypeIfNotExists('IndoctrinateProcessorUnderstandFile', libIndoctrinateUnderstandFile);

		this.processingTasks.push(this.fable.instantiateServiceProviderWithoutRegistration('IndoctrinateProcessorUnderstandFile'));

		this.log.info('Constructed Processor Service.');
	}

	prepareCatalogForProcessing(fCallback)
	{
		this.log.info('Preparing Content Catalog for Processing...');

		return fCallback();
	}

	processContentCatalog(fCallback)
	{
		let tmpFileList = Object.keys(this.fable.AppData.SourceContentCatalog);

		this.log.info(`Processing ${tmpFileList.length} files in the content catalog...`);

		let tmpProgressTracker = this.fable.instantiateServiceProviderWithoutRegistration('ProgressTrackerSet');
		tmpProgressTracker.createProgressTracker('ProcessCatalog', tmpFileList.length);
		tmpProgressTracker.startProgressTracker('ProcessCatalog');

		let tmpAnticipate = this.fable.newAnticipate();

		// This will *at least* generate some autotags based on package.json and other mapped json types with schemas
		//this.log.info('... parsing special file types based on any indoctrinate-filetype definitions ...');

		// This will *at least* generate some autotags based on package.json and other mapped json types with schemas
		//this.log.info('... generating autolabels based on package hierarchy ...');

		// And build a tree and histogram of terms
		//this.log.info('... building histogram of terms ...');

		// And manage vocabulary synchronization (with awareness of hierarchy?)
		//this.log.info('... mapping vocabulary based on hierarchy ...');

		for (let i = 0; i < tmpFileList.length; i++)
		{
			tmpProgressTracker.incrementProgressTracker('ProcessCatalog');
			for (let j = 0; j < this.processingTasks.length; j++)
			{
				tmpAnticipate.anticipate(
					function (fProcessorCallback)
					{
						this.processingTasks[j].processContentFile(fProcessorCallback, this.fable.AppData.SourceContentCatalog[tmpFileList[i]]);
					}.bind(this));
			}
			this.log.info(`...processed [${tmpFileList[i]}] ${tmpProgressTracker.getProgressTrackerStatusString('ProcessCatalog')}`);
		}

		tmpProgressTracker.endProgressTracker('ProcessCatalog');
		tmpProgressTracker.logProgressTrackerStatus('ProcessCatalog');

		return fCallback();
	}
}

module.exports = IndoctrinateServiceProcessor;