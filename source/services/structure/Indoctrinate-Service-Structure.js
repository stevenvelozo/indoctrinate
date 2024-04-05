const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateServiceStructure extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'IndoctrinateStructure';

		this.log.info('Constructed Structure Service.');

		this.structuresMap = false;
	}

	validateStructure(pStructure)
	{
		if (typeof(pStructure) !== 'object')
		{
			this.log.warn(`Indoctrinate tried to validate a structure but failed.  pStructure was not an object; it was ${typeof(pStructure)}`);
			return false;
		}

		return true;
	
	}

	addStructure(pStructure)
	{
		if (!this.structuresMap)
		{
			if (!this.fable.AppData.StructuresMap)
			{
				this.fable.AppData.StructuresMap = {};
			}
			this.structuresMap = this.fable.AppData.StructuresMap;
		}

		if (typeof(pStructure) !== 'object')
		{
			this.log.warn(`Indoctrinate tried to add a structure but failed.  pStructure was not an object; it was ${typeof(pStructure)}`);
			return false;
		}

		if (!pStructure.hasOwnProperty('Hash'))
		{
			this.log.warn(`Indoctrinate tried to add a structure but failed.  pStructure did not have a Hash property.`);
			return false;
		}

		if (this.structuresMap.hasOwnProperty(pStructure.Hash))
		{
			this.log.warn(`A structure with the hash ${pStructure.Hash} already exists; it will be overwitten.`);
		}

		if (!this.validateStructure(pStructure))
		{
			this.log.warn(`Indoctrinate tried to add a structure but failed.  The structure did not pass validation.`, {Structure:pStructure});
		}

		this.structuresMap[pStructure.Hash] = pStructure;

		return true;
	}
}

module.exports = IndoctrinateServiceStructure;