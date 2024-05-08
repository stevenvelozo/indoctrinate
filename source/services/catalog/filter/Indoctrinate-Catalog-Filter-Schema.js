const libIndoctrinateCatalogFilterBase = require('./Indoctrinate-Catalog-Filter.js');


/**
 * Indoctrinate Catalog Schema Filter
 *
 * @class IndoctrinateCatalogFilter
 * @typedef {IndoctrinateCatalogSchemaFilter}
 * @extends {libIndoctrinateCatalogFilterBase}
 */
class IndoctrinateCatalogSchemaFilter extends libIndoctrinateCatalogFilterBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateCatalogFilter-Schema';

		// Check and configure the filter
		this.SchemasToMatch = [];

		if (this.options.Schema)
		{
			this.SchemasToMatch.push(this.options.Schema);
		}
		if (this.options.Schemas)
		{
			for (let i = 0; i < this.options.Schemas.length; i++)
			{
				this.SchemasToMatch.push(this.options.Schemas[i]);
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

		for (let i = 0; i < this.SchemasToMatch.length; i++)
		{
			if (!this.caseSensitive)
			{
				if (this.SchemasToMatch[i].toLowerCase() == pContentDescription.Schema.toLowerCase())
				{
					tmpContentMatched = true;
				}
			}
			else
			{
				if (this.SchemasToMatch[i] == pContentDescription.Schema)
				{
					tmpContentMatched = true;
				}
			}
		}

		return tmpContentMatched;
	}

}

module.exports = IndoctrinateCatalogSchemaFilter;

module.exports.ServiceTypeHash = 'IndoctrinateCatalogFilter-Schema';