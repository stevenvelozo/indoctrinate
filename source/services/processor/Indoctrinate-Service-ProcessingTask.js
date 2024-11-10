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
		const tmpFileDescriptor = libFS.openSync(this.constructFileName(pContentDescription), 'r');
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
}

module.exports = IndoctrinateServiceProcessingTask;