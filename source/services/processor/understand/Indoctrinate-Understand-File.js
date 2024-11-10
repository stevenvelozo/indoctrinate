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
		console.log(`  > ${JSON.stringify(libMagicBytes.filetypemime(this.readBytesSync(pContentDescription, 0, 100)))}`);
		return fCallback();
	}
}

module.exports = IndoctrinateUnderstandFile;

module.exports.ServiceTypeHash = 'IndoctrinateUnderstandFile';