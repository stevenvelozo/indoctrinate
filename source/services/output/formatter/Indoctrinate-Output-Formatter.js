const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateOutputFormatter extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateOutputFormatter';

		this.contentAssetMap = false;
	}

	writeOutputFile(pFileRelativePath, pFileName, pContent)
	{
		if (!this.contentAssetMap)
		{
			if (!this.fable.AppData.Output)
			{
				this.fable.AppData.Output = {};
			}
			if (!this.fable.AppData.Output.hasOwnProperty(this.UUID))
			{
				this.fable.AppData.Output[this.UUID] = {};
			}
			this.contentAssetMap = this.fable.AppData.Output[this.UUID];
		}

		this.contentAssetMap[`${pFileRelativePath}/${pFileName}`] = pContent;

		return true;
	}

	copyOutputAsset(pAssetGUID, pAssetRelativePath, pAssetFileName)
	{
		return false;
	}

	buildStructure(pStructureDefinition)
	{
		this.writeOutputFile('generated_files', 'default.txt', 'This is the default file and ignores the structure definition.');
		return true;
	}

}

module.exports = IndoctrinateOutputFormatter;