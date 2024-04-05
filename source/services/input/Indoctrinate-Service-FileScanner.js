
const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

const libFS = require('fs');
const libPath = require('path');

class FileScanner extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateFileScanner';
		this.log.info('Constructed File Scanner Service.');
	}

	buildIgnoredFileNameMap(pIgnoredFileNames)
	{
		this.ignoredFileNames = Array.isArray(pIgnoredFileNames) ? pIgnoredFileNames :
			Array.isArray(this.options.IgnoredFileNames) ? this.options.IgnoredFileNames :
			Array.isArray(this.fable.settings.IgnoredFileNames) ? this.fable.settings.IgnoredFileNames :
			["node_modules", ".git", ".DS_Store"]
		
		this.ignoredFileNameMap = {};

		for (let i = 0; i < this.ignoredFileNames.length; i++)
		{
			this.ignoredFileNameMap[this.ignoredFileNames[i]] = true;
		}
	}

	gatherFilesRecursively(pRootPath, pPath, fCallback)
	{
		libFS.readdir(pPath,
			(pError, pFiles) =>
			{
				this.fable.Utility.eachLimit(pFiles, 1,
					(pFileName, fEnumerationComplete)=>
					{
						let tmpFilePath = libPath.join(pPath, pFileName);
						let tmpStat = libFS.stat(tmpFilePath,
							(pFileStatError, pFileStats) =>
							{
								if (pFileStatError)
								{
									return fEnumerationComplete('File stat error during enumeration:'+pEnumerationError);
								}


								if (this.ignoredFileNameMap.hasOwnProperty(pFileName))
								{
									// This is one of the ignored files; skip it and its children if it is a folder.
									this.fable.log.trace(`(ignoring) [${tmpFilePath}] - in ignore set!`);
									return fEnumerationComplete();
								}
								else if (pFileStats && pFileStats.isDirectory())
								{
									return this.gatherFilesRecursively(pRootPath, tmpFilePath, fEnumerationComplete);
								}
								else
								{
									this.fable.IndoctrinateServiceCatalog.catalogContent(this.fable.IndoctrinateIngestor.createContentDescriptionFromFile(tmpFilePath));
									// See about adding this to the catalog.
									return fEnumerationComplete();
								}
							});
					},
					(pEnumerationError) =>
					{
						if (pEnumerationError)
						{
							return fCallback(`Error during recursive content file scan in folder [${pPath}]: ${pEnumerationError}`);
						}
						return fCallback();
					});
			});
	}
}

module.exports = FileScanner;