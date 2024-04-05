const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

class IndoctrinateCatalogLabelManager extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateCatalogLabelManager';
	}

	countLabels(pContentDescription, pSearchString, pExactMatch)
	{
		let tmpExactMatch = (typeof(pExactMatch) === 'boolean') ? pExactMatch : true;

		let tmpSearchString = (typeof(pSearchString) === 'string') ? pSearchString : false;

		let tmpMatchCount = 0;

		for (let i = 0; i < pContentDescription.Labels.length; i++)
		{
			if (pContentDescription.Labels[i].indexOf('__LABELSET_') !== -1)
			{
				// TODO: Do Labelsets count as labels?
				continue;
			}
			else if (!tmpSearchString)
			{
				tmpMatchCount++;
			}
			else if (tmpExactMatch)
			{
				if (pContentDescription.Labels[i] === pSearchString)
				{
					tmpMatchCount++;
				}
			}
			else
			{
				if (pContentDescription.Labels[i].indexOf(pSearchString) !== -1)
				{
					tmpMatchCount++;
				}
			}
		}

		return tmpMatchCount;
	}

	getContentLabelSetIndex(pContentDescription, pLabelSetIdentifier)
	{
		if (typeof(pContentDescription) !== 'object')
		{
			throw new Error('Content description must be an object.');
		}

		// TODO: Should we allow numbers as well?  Aghhh
		if (typeof(pLabelSetIdentifier) !== 'string')
		{
			throw new Error('Label set identifier must be a string.');
		}

		if (!pContentDescription.Labels)
		{
			return false;
		}

		let tmpLabelSetIdentifier = `__LABELSET_${pLabelSetIdentifier}`;

		for (let i = 0; i < pContentDescription.Labels.length; i++)
		{
			if (pContentDescription.Labels[i] === tmpLabelSetIdentifier)
			{
				return i;
			}
		}

		return false;
	}

	addLabelSet(pContentDescription, pLabelSetIdentifier)
	{
		if (typeof(pContentDescription) !== 'object')
		{
			throw new Error('Content description must be an object.');
		}

		if (typeof(pLabelSetIdentifier) !== 'string')
		{
			throw new Error('Label set identifier must be a string.');
		}

		if (pLabelSetIdentifier.length === 0)
		{
			throw new Error('Label set identifier must be at least one character long.');
		}

		if (!pContentDescription.Labels)
		{
			pContentDescription.Labels = [];
		}

		let tmpLabelSetIndex = this.getContentLabelSetIndex(pContentDescription, pLabelSetIdentifier);

		// Testing for truthiness doesn't work due to "TYPE" being at index 0 and that being falsey.
		// This case is covered in the unit tests.
		if (typeof(tmpLabelSetIndex) == 'number')
		{
			return tmpLabelSetIndex;
		}

		let tmpLabelSetIdentifier = `__LABELSET_${pLabelSetIdentifier}`;
		pContentDescription.Labels.push(tmpLabelSetIdentifier);
		return (pContentDescription.Labels.length-1);
	}

	getNextLabelSetIndex(pContentDescription, pLabelIndex)
	{
		if (typeof(pContentDescription) !== 'object')
		{
			throw new Error('Content description must be an object.');
		}

		if (typeof(pLabelIndex) !== 'number')
		{
			throw new Error('Label index must be a number.');
		}

		if (!pContentDescription.Labels)
		{
			pContentDescription.Labels = [];
		}

		if (pLabelIndex < 0 || pLabelIndex >= pContentDescription.Labels.length)
		{
			return false;
		}

		// Now figure out where the next label set starts (or the end)
		for (let i = pLabelIndex + 1; i < pContentDescription.Labels.length; i++)
		{
			if (pContentDescription.Labels[i].indexOf('__LABELSET_') !== -1)
			{
				return i;
			}
		}
		return false;
	}

	insertLabelAtEndOfSet(pContentDescription, pLabel, pLabelSetIdentifier)
	{
		let tmpLabelSetStartIndex = this.addLabelSet(pContentDescription, pLabelSetIdentifier);

		if (typeof(tmpLabelSetStartIndex) !== 'number')
		{
			throw new Error(`Could not insert label ${pLabel}.  There was a problem finding or creating the set.`);
		}

		let tmpNextLabelSetIndex = this.getNextLabelSetIndex(pContentDescription, tmpLabelSetStartIndex);

		if (typeof(tmpNextLabelSetIndex) !== 'number')
		{
			pContentDescription.Labels.push(pLabel);
		}
		else
		{
			pContentDescription.Labels.splice(tmpNextLabelSetIndex, 0, pLabel);
		}
	}

	addContentLabel(pContentDescription, pLabel, pLabelSetIdentifier)
	{
		if (typeof(pContentDescription) !== 'object')
		{
			throw new Error('Content description must be an object.');
		}

		if (typeof(pLabel) !== 'string')
		{
			throw new Error('Label must be a string.');
		}

		if (pLabel.length === 0)
		{
			throw new Error('Label must be at least one character long.');
		}

		if (typeof(pLabelSetIdentifier) !== 'string')
		{
			throw new Error('Label set identifier must be a string.');
		}

		if (pLabelSetIdentifier.length === 0)
		{
			throw new Error('Label set identifier must be at least one character long.');
		}

		// TODO: Should this just throw?  Seems bad.
		if (!pContentDescription.Labels)
		{
			pContentDescription.Labels = [];
		}

		// Now add the label to the end of the label set.

		pContentDescription.Labels.push(pLabel);
	}

	// Not sure if this is a thing.  Mothballing it until it actually becomes one
	// removeContentLabel(pContentDescription, pLabel, pLabelType)
	// {

	// }

	checkContentLabel(pContentDescription, pLabel, pLabelType)
	{
		if (typeof(pContentDescription) !== 'object')
		{
			throw new Error('Content description must be an object.');
		}

		if (typeof(pLabel) !== 'string')
		{
			throw new Error('Label must be a string.');
		}

		if (pLabel.length === 0)
		{
			throw new Error('Label must be at least one character long.');
		}

		if (typeof(pLabelType) !== 'string')
		{
			throw new Error('Label type must be a string.');
		}

		if (pLabelType.length === 0)
		{
			throw new Error('Label type must be at least one character long.');
		}

		if (!pContentDescription.Labels)
		{
			return false;
		}

		let tmpLabelSetStartIndex = this.getContentLabelSetIndex(pContentDescription, pLabelType);

		for (let i = tmpLabelSetStartIndex; i < pContentDescription.Labels.length; i++)
		{
			if (pContentDescription.Labels[i] === pLabel)
			{
				return true;
			}
		}

		return false;
	}

	countContentLabelsInType(pContentDescription, pLabelType)
	{
		if (typeof(pContentDescription) !== 'object')
		{
			throw new Error('Content description must be an object.');
		}

		if (typeof(pLabelType) !== 'string')
		{
			throw new Error('Label type must be a string.');
		}

		if (pLabelType.length === 0)
		{
			throw new Error('Label type must be at least one character long.');
		}

		if (!pContentDescription.Labels)
		{
			return 0;
		}

		let tmpLabelSetStartIndex = this.getContentLabelSetIndex(pContentDescription, pLabelType);
		if (tmpLabelSetStartIndex === false)
		{
			return 0;
		}

		let tmpLabelSetEndIndex = this.getNextLabelSetIndex(pContentDescription, tmpLabelSetStartIndex);

		return tmpLabelSetEndIndex - tmpLabelSetStartIndex;
	}
}

module.exports = IndoctrinateCatalogLabelManager;