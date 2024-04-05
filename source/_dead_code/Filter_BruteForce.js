// Here are the original algorithms for label filtering.
// They are not used in the current version of the indoctrinate tooling, but are kept here for reference,
// especially with regards to the design of the current filters.

// Why? Filters by name alone became unwieldy.  The pattern ended up encoding logic into multiple parts of the name.

/* Filter Object:

Example Content Description:
{
	"UUID": "9f9a03d8-1f38-4995-bfc8-44af9ce9b238",
	"Type": "URI",
	"Hash": "URI~CONTENT~FILE://Users/stevenvelozo/Code/retold/modules/utility/indoctrinate/docs/examples/data_model/model/entity/animals/Cat.md",
	"Path": "FILE://Users/stevenvelozo/Code/retold/modules/utility/indoctrinate/docs/examples/data_model/model/entity/animals/Cat.md",
	"Location": "/Users/stevenvelozo/Code/retold/modules/utility/indoctrinate/docs/examples/data_model/model/entity/animals",
	"Name": "Cat.md",
	"Format": "Markdown",
	"Content": false,
	"Labels": [
		"__LABELSET_TYPE",
		"FILE",
		"__LABELSET_ADDRESS",
		"docs",
		"examples",
		"data_model",
		"model",
		"entity",
		"animals",
		"__LABELSET_NAME",
		"Cat",
		"__LABELSET_EXTENSION",
		".md",
		"__LABELSET_FILENAME",
		"Cat.md",
		"__LABELSET_FULLPATH",
		"FILE://Users/stevenvelozo/Code/retold/modules/utility/indoctrinate/docs/examples/data_model/model/entity/animals/Cat.md"
	]
}

// The Label filter
{
	// This says the filter is matching on the labels portion of the content description
	Type: 'Label',

	// These are the labels to match either as a single label or as a set of labels
	// (or both if you are sadistic; it will merge them for you)
	Label: 'Cat',
	Labels: ['model', 'entity', ...],

	// TODO: Is this necessary?  Can't actually find a real use case for it.  Seems yak-like.
	//LabelSet: false,       // By default, LabelSet is false so any can be matched

	// This tells the filter whether to match *all* labels passed in or just one.
	MatchAll: true,        // By default, MatchAll is true.

	// This tells the filter whether to match in a case sensitive manner
	CaseSensitive: false,  // By default, CaseSensitive is false.

	// This tells the filter whether the labels need to be proximal to each other
	Proximal: true,        // By default, Proximal is true.

	// This tells the filter whether the labels need to be sequentially the same in both sets
	Sequential: true,      // By default, Sequential is true.

	// This tells the filter whether the labels should be at the end of a label set
	OnlySetEnd: true       // By default, OnlySetEnd is true.
}

NOTE: OnlySetEnd is useful for matching only files in a
		particular folder.



// The Format filter
{
	// This says the filter is matching on the format portion of the content description
	Type: 'Format',

	// This is the format to match
	Format: 'Markdown'
	Formats: ['JSON', 'HTML', 'TXT', ...]

	// This tells the filter whether to match in a case sensitive manner
	CaseSensitive: false  // By default, CaseSensitive is false.
}
*/

// Filter type: Label
// Filter: { Label: 'LABEL_NAME' }


/*

Structure Part Content Types:
- StaticContent

- MergedContent
- FirstContent
- LastContent

- TemplatedContent (?)

- MeadowSchema

- SourceAnnotation

- JSDoc

- NodePackageOverview
- NodePackageDependencies
*/

	filterCheckLabel(pFilter, pContentDescription)
	{
		let tmpContentMatched = false;

		if (typeof(pFilter.Label) != 'string')
		{
			this.fable.log.error(`Label filter expected a string but Filter.Label was a ${typeof(pFilter.Label)}`);
			return false;
		}

		for (let k = 0; k < pContentDescription.Labels.length; k++)
		{
			if (pContentDescription.Labels[k] == pFilter.Label)
			{
				tmpContentMatched = true;
			}
		}

		return tmpContentMatched;
	}

	filterCheckLabelSet(pFilter, pContentDescription)
	{
		if (!Array.isArray(pFilter.LabelSet))
		{
			this.fable.log.error(`Label set filter expected an array but Filter.LabelSet was a ${typeof(pFilter.LabelSet)}`);
			return false;
		}

		// Build a map
		let tmpSetMatches = {};
		for (let i = 0; i < pFilter.LabelSet; i++)
		{
			tmpSetMatches[pFilter.LabelSet] = false;
		}

		for (let k = 0; k < pContentDescription.Labels.length; k++)
		{
			if (tmpSetMatches.hasOwnProperty(pContentDescription.Labels[k]))
			{
				tmpSetMatches[pContentDescription.Labels[k]] = true;
			}
		}

		for (let i = 0; i < pFilter.LabelSet; i++)
		{
			if (!tmpSetMatches[pFilter.LabelSet])
			{
				return false;
			}
		}

		return true;
	}

	filterCheckForwardLabelSet(pFilter, pContentDescription)
	{
		let tmpContentMatched = false;

		return tmpContentMatched;
	}

	filterCheckForwardProximalLabelSet(pFilter, pContentDescription)
	{
		let tmpContentMatched = false;

		for (let k = 0; k < pContentDescription.Labels.length; k++)
		{
			// If we match the first label of the forward label match, see if the rest match in sequence
			if (pFilter.ForwardLabelMatch[0] == pContentDescription.Labels[k])
			{
				let tmpPotentialMatch = true;
				for (let l = 0; l < pFilter.ForwardLabelMatch.length; l++)
				{
					if ((k + l < pContentDescription.Labels.length) && (pFilter.ForwardLabelMatch[l] == pContentDescription.Labels[k + l]))
					{
						// Still in the running for a match!
					}
					else
					{
						tmpPotentialMatch = false;
					}
				}
				if (tmpPotentialMatch)
				{
					tmpContentMatched = true;
				}
			}
		}

		return tmpContentMatched;
	}

	filterCheckForwardProximalEndLabelSet(pFilter, pContentDescription)
	{
		let tmpContentMatched = false;

		for (let k = 0; k < pContentDescription.Labels.length; k++)
		{
			// If we match the first label of the forward label match, see if the rest match in sequence
			if (pFilter.ForwardLabelMatch[0] == pContentDescription.Labels[k])
			{
				let tmpPotentialMatch = true;
				for (let l = 0; l < pFilter.ForwardLabelMatch.length; l++)
				{
					if ((k + l < pContentDescription.Labels.length) && (pFilter.ForwardLabelMatch[l] == pContentDescription.Labels[k + l]))
					{
						// Still in the running for a match!
					}
					else
					{
						tmpPotentialMatch = false;
					}
				}
				if (tmpPotentialMatch)
				{
					// Now check for the end label (EITHER 
						// this is the last label in the set, 
					if (((k + l + 1) >= pContentDescription.Labels.length)
						// or, the next label is a marker for the start of a new set)
						|| (this.fable.DataFormat.stringStartsWith(pContentDescription.Labels[k+l+1], '__LABELSET_')))
					{
						tmpContentMatched = true;
					}
				}
			}
		}

		return tmpContentMatched;
	}