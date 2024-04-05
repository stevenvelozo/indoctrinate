const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateServiceProcessor extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateProcessor';
		this.log.info('Constructed Processor Service.');
	}

	processContentCatalog(fCallback)
	{
		// TODO: Implement the content processors
		// This will *at least* generate some autotags based on package.json and other mapped json types with schemas
		this.log.info('... parsing special file types based on any indoctrinate-filetype definitions ...');

		// This will *at least* generate some autotags based on package.json and other mapped json types with schemas
		this.log.info('... generating autolabels based on package hierarchy ...');

		// And build a tree and histogram of terms
		this.log.info('... building histogram of terms ...');

		// And manage vocabulary synchronization (with awareness of hierarchy?)
		this.log.info('... mapping vocabulary based on hierarchy ...');

		return fCallback();
	}
}

module.exports = IndoctrinateServiceProcessor;