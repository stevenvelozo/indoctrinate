const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

const libFS = require('fs');
const libPath = require('path');
const libCrypto = require('crypto');

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
		const tmpByteBuffer = Buffer.alloc(pLength);
		libFS.readSync(tmpFileDescriptor, tmpByteBuffer, 0, pLength, pStartByte);
		libFS.closeSync(tmpFileDescriptor);
		return tmpByteBuffer;
	}

	readTailBytesSync(pContentDescription, pLength)
	{
		const tmpFileName = this.constructFileName(pContentDescription);
		const tmpStat = libFS.statSync(tmpFileName);
		let tmpActualLength = pLength;
		if (tmpStat.size < tmpActualLength)
		{
			tmpActualLength = tmpStat.size;
		}
		const tmpStartByte = tmpStat.size - tmpActualLength;
		return this.readBytesSync(pContentDescription, tmpStartByte, tmpActualLength);
	}

	computeMD5Sync(pContentDescription)
	{
		const tmpFileName = this.constructFileName(pContentDescription);
		const tmpHash = libCrypto.createHash('md5');
		const tmpBuffer = libFS.readFileSync(tmpFileName);
		tmpHash.update(tmpBuffer);
		return tmpHash.digest('hex');
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