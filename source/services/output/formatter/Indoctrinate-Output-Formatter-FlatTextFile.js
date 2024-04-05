const libIndoctrinateOutputFormatterBase = require('./Indoctrinate-Output-Formatter.js');

class IndoctrinateCatalogFormatFilter extends libIndoctrinateOutputFormatterBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateOutputFormatter';
	}
}

module.exports = IndoctrinateCatalogFormatFilter;