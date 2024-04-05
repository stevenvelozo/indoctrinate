const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

// TODO: Make these fable services?  Fits the pattern, adds a little complexity.
//       Discuss first, pattern later.  Does not affect execution behavior just maintenance and dependencies.
const libCatalogFilterBase = require('./filter/Indoctrinate-Catalog-Filter.js');
const libCatalogFilterFormat = require('./filter/Indoctrinate-Catalog-Filter-Format.js');
const libCatalogFilterLabel = require('./filter/Indoctrinate-Catalog-Filter-Label.js');

const libCatalogLabelManager = require('./Indoctrinate-Catalog-LabelManager.js');

class IndoctrinateServiceCatalog extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateCatalog';

		this.catalog = false;
		this.catalogIndices = [];

		this.fable.addServiceType('IndoctrinateCatalogFilter', libCatalogFilterBase);

		this.log.info('Constructed Catalog Service.');
	}

	createCatalogFilterByType(pFilterDefinition)
	{
		if ((typeof(pFilterDefinition) !== 'object') || (!pFilterDefinition.hasOwnProperty('Type')))
		{
			// If the filter definition isn't an object or doesn't have a type property, make it a useless base class filter.
			// This won't return anything.
			this.fable.log.warn(`Indoctrinate tried to create a catalog filter by type but failed.  Type of pFilterDefinition was ${typeof(pFilterDefinition)}`);
			this.fable.instantiateServiceProvider('IndoctrinateCatalogFilter', pFilterDefinition);
		}

		// Add more catalog filter types here
		switch(pFilterDefinition.Type)
		{
			case 'Label':
				return this.fable.instantiateServiceProviderFromPrototype('IndoctrinateCatalogFilter', pFilterDefinition, this.fable.getUUID(), libCatalogFilterLabel);

			case 'Format':
				return this.fable.instantiateServiceProviderFromPrototype('IndoctrinateCatalogFilter', pFilterDefinition, this.fable.getUUID(), libCatalogFilterFormat);
	
			default:
				this.fable.log.warn(`Indoctrinate tried to create a catalog filter by type but failed due to unrecognized type:  pFilterDefinition.Type was ${pFilterDefinition.Type}`);
				return new libCatalogFilterBase(pFilterDefinition);
		}
	}

	gatherContentByFilterSet(pFilterDefinitions)
	{
		let tmpFilterSet = [];
		let tmpMatchedContentList = [];

		if (!Array.isArray(pFilterDefinitions))
		{
			// No content from the catalog if no filters.  Fair is fair.
			return tmpMatchedContentList;
		}

		for (let i = 0; i < pFilterDefinitions.length; i++)
		{
			//For each filter definition, construct a catalog filter.
			tmpFilterSet.push(this.createCatalogFilterByType(pFilterDefinitions[i]));
		}

		// Now match each piece of content in the catalog against the filter set.
		for (let k = 0; k < this.catalogIndices.length; k++)
		{
			let tmpCurrentContent = this.catalog[this.catalogIndices[k]];
			let tmpContentMatches = false;

			for (let l = 0; l < tmpFilterSet.length; l++)
			{
				// For each filter, see if the current content matches.
				if (tmpFilterSet[l].matchContent(tmpCurrentContent))
				{
					// It matched!
					tmpContentMatches = true;
				}
			}

			if (tmpContentMatches)
			{
				tmpMatchedContentList.push(tmpCurrentContent);
			}
		}

		// The matched content list is returned
		return tmpMatchedContentList;
	}

	matchContentByFilterSet(pFilterSet, pContentDescription)
	{
		let tmpContentMatched = false;

		let tmpFilterSet = (Array.isArray(pFilterSet)) ? pFilterSet
							: (typeof(pFilterSet) == 'object') ? [pFilterSet]
							: [];  // If it's not an array or an object, it is empty (so will not match anything in the catalog)

		// Right now this just ORs the filters together.
		// TODO: Determine if there is a need for something more complex; none of the use cases are suggesting so yet.
		for (let j = 0; j < tmpFilterSet.length; j++)
		{
			let tmpFilter = tmpFilterSet[j];

			if (tmpFilter.matchContent(pContentDescription))
			{
				tmpContentMatched = true;
			}
		}

		return tmpContentMatched;
	}

	rebuildCatalogIndices()
	{
		this.catalogIndices = Object.keys(this.catalog);
	}

	catalogContent(pContentDescription)
	{
		// Check that there was an object returned
		if (!pContentDescription)
		{
			return false;
		}
		// Lazily instantiate the catalog, and create it in AppData if it doesn't exist.
		if (!this.catalog)
		{
			if (!this.fable.AppData.SourceContentCatalog)
			{
				this.fable.AppData.SourceContentCatalog = {};
			}
			this.catalog = this.fable.AppData.SourceContentCatalog;
		}

		if (!this.catalogIndices)
		{
			if (!this.fable.AppData.SourceContentCatalogIndices)
			{
				this.fable.AppData.SourceContentCatalogIndices = [];
			}
			this.catalogIndices = this.fable.AppData.SourceContentCatalogIndices;
		}

		if (pContentDescription.Format == 'UNKNOWN')
		{
			return false;
		}

		if (this.catalog.hasOwnProperty(pContentDescription.Hash))
		{
			this.fable.log.warn(`Indoctrinate cataloging hash [${pContentDescription.Hash}] but the hash already exists.  The UUID ${pContentDescription.UUID} is replacing ${this.catalog[pContentDescription.Hash].UUID} ... this shouldn't be possible with files.`)
		}

		this.fable.log.trace(`Indoctrinate cataloging hash [${pContentDescription.Hash}] UUID ${pContentDescription.UUID}.`)
		this.catalog[pContentDescription.Hash] = pContentDescription;

		// Now rebuild the indices (which is just an array)
		// TODO: This is inefficient to do every time we add something to the catalog; maybe make it an explicit step?
		this.rebuildCatalogIndices();

		return true;
	}
}

module.exports = IndoctrinateServiceCatalog;