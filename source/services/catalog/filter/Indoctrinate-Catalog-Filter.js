const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

/**
 * Base class for all indoctrinate catalog filters
 * 
 * Beginner (text documentation, prose and book-type compilation) filters to include:
 * - Format
 * - Label
 *
 * @class IndoctrinateCatalogFilter
 * @typedef {IndoctrinateCatalogFilter}
 */
class IndoctrinateCatalogFilter extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateCatalogFilter';
	}

	/**
	 * Match content against the filter
	 * 
	 * TODO: Learn how autogen tools allow us to create an ... abstract object type?  Unsure of terminology for what this would be.
	 *
	 * @param {object} pContentDescription
	 * @returns {boolean}
	 */
	matchContent(pContentDescription)
	{
		return false;
	}

}

module.exports = IndoctrinateCatalogFilter;

module.exports.ServiceTypeHash = 'IndoctrinateCatalogFilter';