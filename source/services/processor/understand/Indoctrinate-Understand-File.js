const libIndoctrinateProcessingTask = require('../Indoctrinate-Service-ProcessingTask.js');

const libMagicBytes = require('magic-bytes.js');

class IndoctrinateUnderstandFile extends libIndoctrinateProcessingTask
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateUnderstandFile';
	}

	checkMatch(pContentDescription)
	{
		return false;
	}

	processContentFile(fCallback, pContentDescription)
	{
		console.log(`--> Getting the magic bytes for ${this.constructFileName(pContentDescription)}`);
		let tmpFileHeaderBytes = this.readBytesSync(pContentDescription, 0, 100);
		// TODO: Add this as an optional persist -- definitely not every time.
		//this.addContentToExtendedCatalogData(pContentDescription, tmpFileHeaderBytes, 'MB_HDRB');
		let tmpMagicByteData = libMagicBytes.filetypemime(tmpFileHeaderBytes);
		if (tmpMagicByteData.length > 0)
		{
			console.log(`  > Magic Bytes: ${JSON.stringify(tmpMagicByteData)}`);
			let tmpMagicByteExtension = libMagicBytes.filetypeextension(tmpFileHeaderBytes);
			if (tmpMagicByteExtension.length > 0)
			{
				if (tmpMagicByteExtension.length > 1)
				{
					console.log(`  > Multiple file extensions found for file; defaulting to first: ${JSON.stringify(tmpMagicByteExtension)}`);
				}
				this.addContentToExtendedCatalogData(pContentDescription, tmpMagicByteExtension[0], 'MB_EXT');
			}
		}
		else
		{
			console.log(`  > File type could not be determined from magic bytes.`);
		}
		// This is to save bytes in ginormous json.
		this.addContentToExtendedCatalogData(pContentDescription, tmpMagicByteData, 'MB_MIME');
		return fCallback();
	}
}

module.exports = IndoctrinateUnderstandFile;

module.exports.ServiceTypeHash = 'IndoctrinateUnderstandFile';