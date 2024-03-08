const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateServiceOutput extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.log.info('Aha?');
	}
}

module.exports = IndoctrinateServiceOutput;