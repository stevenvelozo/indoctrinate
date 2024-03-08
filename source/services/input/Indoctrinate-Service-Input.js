const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateServiceInput extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		//let tmpOptions = Object.assign({}, defaultHeadLightRestClientOptions, pOptions);
		super(pFable, pOptions, pServiceHash);
		this.log.info('Ah.');
	}
}

module.exports = IndoctrinateServiceInput;