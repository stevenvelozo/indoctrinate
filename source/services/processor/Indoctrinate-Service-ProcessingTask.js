const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

const libFS = require('fs');
const libPath = require('path');

class IndoctrinateServiceProcessingTask extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateProcessor';
		//this.log.info('Constructed Extended Processor Service.');
	}

	readBytesSync(pContentDescription, pStartByte, pLength)
	{
		const tmpFileName = this.constructFileName(pContentDescription);
		const tmpFileDescriptor = libFS.openSync(tmpFileName, 'r');
		// Manually create a buffer to store the bytes
		const tmpByteBuffer = Buffer.alloc(100);
		// Read the first n bytes
		libFS.readSync(tmpFileDescriptor, tmpByteBuffer, pStartByte, pLength, pStartByte);
		// Manually close the file descriptor
		libFS.closeSync(tmpFileDescriptor);
		// Now return the byte buffer
		return tmpByteBuffer;
	}

	constructFileName(pContentDescription)
	{
		return libPath.join(pContentDescription.Location, pContentDescription.Name);
	}

	processContentFile(fCallback, pContentDescription)
	{
		return fCallback();
	}

	prepareDescriptionForExtendedContent(pContentDescription)
	{
		if (typeof(pContentDescription) != 'object')
		{
			this.log.error('Attempted to prepare extended content description for undefined content but object was not passed in.');
			return false;
		}

		if (!('ExtendedContent' in pContentDescription))
		{
			pContentDescription.ExtendedContent = {};
		}

		return true;
	}

	addContentToExtendedCatalogData(pContentDescription, pContentToAdd, pExtendedContentAddress)
	{
		let tmpExtendedContentAddress = (typeof(pExtendedContentAddress) === 'undefined') ? this.serviceType : pExtendedContentAddress;

		if (typeof(pContentToAdd) === 'undefined')
		{
			this.log.error(`Attempted to add undefined content to extended catalog data for ${this.constructFileName(pContentDescription)}`);
			return false;
		}

		this.prepareDescriptionForExtendedContent(pContentDescription);

		if (tmpExtendedContentAddress in pContentDescription.ExtendedContent)
		{
			this.log.warn(`Adding content to extended catalog data for ${this.constructFileName(pContentDescription)} to extended content address ${tmpExtendedContentAddress} and data already exists.  It will be overwritten.`);
		}

		pContentDescription.ExtendedContent[tmpExtendedContentAddress] = pContentToAdd;
		return true;
	}
}

module.exports = IndoctrinateServiceProcessingTask;