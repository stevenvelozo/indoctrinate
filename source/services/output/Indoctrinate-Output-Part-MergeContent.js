const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateOutputPart extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateOutputPart';

		this.contentAssetMap = false;
	}

	generatePart(pPartDefinition, pContentDescriptions)
	{
		this.log.warn('IndoctrinateOutputPart.generatePart() is not implemented.', {PartDefinition:pPartDefinition, ContentDescriptions:pContentDescriptions});
		return '';
	}
}

module.exports = IndoctrinateOutputPart;