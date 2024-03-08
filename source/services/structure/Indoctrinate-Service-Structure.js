const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateServiceStructure extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.log.info('Oho.');
	}
}

module.exports = IndoctrinateServiceStructure;