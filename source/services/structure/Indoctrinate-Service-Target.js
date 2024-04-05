const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateServiceTarget extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'IndoctrinateTarget';

		this.log.info('Constructed Target Service.');

		this.TargetsMap = false;
	}

	validateTarget(pTarget)
	{
		if (typeof(pTarget) !== 'object')
		{
			this.log.warn(`Indoctrinate tried to validate a Target but failed.  pTarget was not an object; it was ${typeof(pTarget)}`);
			return false;
		}

		return true;
	}

	addTarget(pTarget)
	{
		if (!this.TargetsMap)
		{
			if (!this.fable.AppData.TargetsMap)
			{
				this.fable.AppData.TargetsMap = {};
			}
			this.TargetsMap = this.fable.AppData.TargetsMap;
		}

		if (typeof(pTarget) !== 'object')
		{
			this.log.warn(`Indoctrinate tried to add a Target but failed.  pTarget was not an object; it was ${typeof(pTarget)}`);
			return false;
		}

		if (!pTarget.hasOwnProperty('Hash'))
		{
			this.log.warn(`Indoctrinate tried to add a Target but failed.  pTarget did not have a Hash property.`);
			return false;
		}

		if (this.TargetsMap.hasOwnProperty(pTarget.Hash))
		{
			this.log.warn(`A Target with the hash ${pTarget.Hash} already exists; it will be overwitten.`);
		}

		if (!this.validateTarget(pTarget))
		{
			this.log.warn(`Indoctrinate tried to add a Target but failed.  The Target did not pass validation.`, {Target:pTarget});
		}

		this.TargetsMap[pTarget.Hash] = pTarget;

		return true;
	}
}

module.exports = IndoctrinateServiceTarget;