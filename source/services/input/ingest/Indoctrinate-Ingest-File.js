const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateIngestFile extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateIngestFile';
	}

	checkMatch(pContentDescription)
	{

	}

	ingestFile(pContentDescription)
	{
		return false;
	}
}

module.exports = IndoctrinateIngestFile;

module.exports.ServiceTypeHash = 'IndoctrinateIngestFile';