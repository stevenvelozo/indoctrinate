const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

const libOutputFormatter = require('./formatter/Indoctrinate-Output-Formatter.js');
const libOutputPart = require('./part/Indoctrinate-Output-Part.js');

class IndoctrinateServiceOutput extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateOutput';

		this.fable.addServiceType('IndoctrinateOutputFormatter', libOutputFormatter);
		this.fable.addServiceType('IndoctrinateOutputPart', libOutputPart);

		this.log.info('Constructed Output Service.');
	}

	outputTargets(fCallback)
	{
		if (this.fable.AppData.TargetFilter)
		{
			this.log.info(`Output targets will be filtered to [${this.fable.AppData.TargetFilter}].`);
		}
		return fCallback();
	}
}

module.exports = IndoctrinateServiceOutput;