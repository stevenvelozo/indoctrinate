const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateServiceInput extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateInput';

		// Add and instantiate the ingestor service provider if it isn't already available.
		if (!this.fable.IndoctrinateIngestor)
		{
			this.fable.serviceManager.addServiceType('IndoctrinateIngestor', require(`./Indoctrinate-Service-Ingestor.js`));
			this.fable.serviceManager.instantiateServiceProvider('IndoctrinateIngestor');

			this.fable.serviceManager.addServiceType('IndoctrinateFileScanner', require(`./Indoctrinate-Service-FileScanner.js`));
			this.fable.serviceManager.instantiateServiceProvider('IndoctrinateFileScanner');
			this.fable.IndoctrinateFileScanner.buildIgnoredFileNameMap();
		}

		this.log.info('Constructed Input Service.');
	}

	scan(fCallback)
	{
		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate((fNext) => { this.fable.log.info(`Root folder Scan Beginning...`); return fNext(); });

		// Scan the root folder
		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.fable.IndoctrinateFileScanner.gatherFilesRecursively(this.fable.AppData.RootFolder, this.fable.AppData.RootFolder, fNext);
			}.bind(this));

		tmpAnticipate.anticipate((fNext) => { this.fable.log.info(`...Root Folder Scan Complete!!!`); return fNext(); });

		tmpAnticipate.wait(fCallback);
	}

	scanExtraFiles(fCallback)
	{
		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate((fNext) => { this.fable.log.info(`Additional Folder Scan Beginning...`); return fNext(); });

		for (let i = 0; i < this.fable.AppData.AdditionalScanFolders.length; i++)
		{
			tmpAnticipate.anticipate(
				function (fNext)
				{
					this.fable.IndoctrinateFileScanner.gatherFilesRecursively(this.fable.AppData.AdditionalScanFolders[i], this.fable.AppData.AdditionalScanFolders[i], fNext);
				}.bind(this));
		}

		tmpAnticipate.anticipate((fNext) => { this.fable.log.info(`...Additional Folder Scan Complete!!!`); return fNext(); });

		tmpAnticipate.wait(fCallback);
	}
}

module.exports = IndoctrinateServiceInput;