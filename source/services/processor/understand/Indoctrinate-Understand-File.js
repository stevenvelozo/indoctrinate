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

		// Read the last 100 bytes of the file (tail signature)
		try
		{
			let tmpTailBytes = this.readTailBytesSync(pContentDescription, 100);
			this.addContentToExtendedCatalogData(pContentDescription, tmpTailBytes.toString('hex'), 'MB_TAIL');
		}
		catch (pTailError)
		{
			console.log(`  > Could not read tail bytes: ${pTailError.message}`);
		}

		// Compute MD5 hash of the file
		try
		{
			let tmpMD5 = this.computeMD5Sync(pContentDescription);
			console.log(`  > MD5: ${tmpMD5}`);
			this.addContentToExtendedCatalogData(pContentDescription, tmpMD5, 'FILE_MD5');
		}
		catch (pMD5Error)
		{
			console.log(`  > Could not compute MD5: ${pMD5Error.message}`);
		}

		return fCallback();
	}
}

module.exports = IndoctrinateUnderstandFile;

module.exports.ServiceTypeHash = 'IndoctrinateUnderstandFile';