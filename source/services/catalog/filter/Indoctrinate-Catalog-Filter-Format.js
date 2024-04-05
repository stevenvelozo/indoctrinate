const libIndoctrinateCatalogFilterBase = require('./Indoctrinate-Catalog-Filter.js');


/**
 * Indoctrinate Catalog Format Filter
 *
 * @class IndoctrinateCatalogFilter
 * @typedef {IndoctrinateCatalogFormatFilter}
 * @extends {libIndoctrinateCatalogFilterBase}
 */
class IndoctrinateCatalogFormatFilter extends libIndoctrinateCatalogFilterBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateCatalogFilter-Format';

		// Check and configure the filter
		this.formatsToMatch = [];

		if (this.options.Format)
		{
			this.formatsToMatch.push(this.options.Format);
		}
		if (this.options.Formats)
		{
			for (let i = 0; i < this.options.Formats.length; i++)
			{
				this.formatsToMatch.push(this.options.Formats[i]);
			}
		}

		this.caseSensitive = (this.options.CaseSensitive) ? this.options.CaseSensitive : false;
	}

	/**
	 * Match content against the filter
	 * 
	 * @param {object} pContentDescription
	 * @returns {boolean}
	 */
	matchContent(pContentDescription)
	{
		let tmpContentMatched = false;

		for (let i = 0; i < this.formatsToMatch.length; i++)
		{
			if (!this.caseSensitive)
			{
				if (this.formatsToMatch[i].toLowerCase() == pContentDescription.Format.toLowerCase())
				{
					tmpContentMatched = true;
				}
			}
			else
			{
				if (this.formatsToMatch[i] == pContentDescription.Format)
				{
					tmpContentMatched = true;
				}
			}
		}

		return tmpContentMatched;
	}

}

module.exports = IndoctrinateCatalogFormatFilter;

module.exports.ServiceTypeHash = 'IndoctrinateCatalogFilter-Format';