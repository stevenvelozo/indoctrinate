const libIndoctrinateCatalogFilterBase = require('./Indoctrinate-Catalog-Filter.js');

/**
 * Indoctrinate Catalog Label Filter
 * 
 * This filter matches content based on the label array.
 * 
 * First write of this is in the quackage prototype of this functionality and 
 * is a simple small class but only matches one type of filter and was not
 * extensible to the other label filters necessary.
 * 
 * After a couple basic algorithm shape attempts, a recursive function walking 
 * the array of labels seemed to be the most efficient way to match.
 * This was because we can use the same function to match sequentially or 
 * not, and proximally or not, all at the same time.
 * 
 * It turned out the recursive approached worked well but was very very 
 * complex and almost nobody was going to understand it to be able to extend.
 * 
 * It has been rewritten a fourth time using a slightly different pattern that 
 * seems very extensible and is not a huge amount of code.
 *
 * The code here is, though, very complex so please do be careful and keep the 
 * tests covering everything.  Current stats and coverage below
 *
 * 100% coverage of Statements 81/81
 * 100% coverage of Branches 65/65
 * 100% coverage of Functions 8/8
 * 100% coverage of Lines 73/73
 * 
 * Tests could be extended further to include a larger pool of data, although 
 * before adding those please consider that the compile tests also exercise 
 * this code against many varied sets of example label filters.
 * 
 * @class IndoctrinateCatalogFilter
 * @typedef {IndoctrinateCatalogLabelFilter}
 * @extends {libIndoctrinateCatalogFilterBase}
 */
class IndoctrinateCatalogLabelFilter extends libIndoctrinateCatalogFilterBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateCatalogFilter-Label';

		this.options;

		// Check and configure the filter
		this.labelsToMatch = [];

		if (this.options.Label)
		{
			this.labelsToMatch.push(this.options.Label);
		}
		if (this.options.Labels)
		{
			for (let i = 0; i < this.options.Labels.length; i++)
			{
				this.labelsToMatch.push(this.options.Labels[i]);
			}
		}

		// The label set to match (e.g. Type, Address, Name, Extension, FileName, Path, etc.
		// Also there is a ... janky? way of doing this already ... by just matching on "__LABELSET_ADDRESS" or such as a label.  Because it is just a label.

		// matchAll and caseSensitive are both handled in the same place for all algorithms
		this.matchAll = (this.options.MatchAll) ? this.options.MatchAll : false;
		this.caseSensitive = (this.options.CaseSensitive) ? this.options.CaseSensitive : false;

		// Proximal and Sequential are only for set matches
		this.proximal = (this.options.Proximal) ? this.options.Proximal : false;
		this.sequential = (this.options.Sequential) ? this.options.Sequential : false;

		// OnlySetEnd is any of the matches, but is handled very differently for matching any versus matching all
		this.onlySetEnd = (this.options.OnlySetEnd) ? this.options.OnlySetEnd : false;
	}

	checkAllMatchConditions(pAlgorithmResult, pMatchSet)
	{
		let tmpMatchAll = true;

		for (let i = 0; i < this.labelsToMatch.length; i++)
		{
			// Enumerate through each label that we are trying to match and make sure it's set to true in the matchset.
			tmpMatchAll = tmpMatchAll && pMatchSet[this.labelsToMatch[i]];
		}

		return pAlgorithmResult && tmpMatchAll;
	}

	
	/**
	 * Abstracted check for label match, to enforce case sensitivity (and eventually fuzzy/stemming/alternative spellings?)
	 *
	 * @param {string} pContentDescriptionLabel
	 * @param {string} pLabelToMatch
	 * @param {object} pMatchSet
	 * @returns {boolean}
	 */
	checkLabelMatch(pContentDescriptionLabel, pLabelToMatch, pMatchSet)
	{
		// Track if we matched all or not passively.
		let tmpMatchSet = (typeof(pMatchSet) == 'object') ? pMatchSet : {};

		if (!this.caseSensitive)
		{
			if (pLabelToMatch.toLowerCase() == pContentDescriptionLabel.toLowerCase())
			{
				tmpMatchSet[pLabelToMatch] = true;
				return true;
			}
		}
		else
		{
			if (pLabelToMatch == pContentDescriptionLabel)
			{
				tmpMatchSet[pLabelToMatch] = true;
				return true;
			}
		}

		return false;
	}

	matchAnyAlgorithm(pContentDescription)
	{
		for (let i = 0; i < this.labelsToMatch.length; i++)
		{
			for (let j = 0; j < pContentDescription.Labels.length; j++)
			{
				if (this.checkLabelMatch(this.labelsToMatch[i], pContentDescription.Labels[j]))
				{
					// The label matches if the filter doesn't care if it's at a label set end.
					if (!this.onlySetEnd)
					{
						return true;
					}
					else if (
						// It's at the end of all the label sets...
						(j == pContentDescription.Labels.length - 1)
						// ... OR the next label is a set transition
						|| (pContentDescription.Labels[j+1].indexOf('__LABELSET_') == 0))
					{
						return true;
					}
				}
			}
		}

		return false;
	}

	generateMatchSet(pContentDescription)
	{
		let tmpMatchSet = {};

		// Yes, undefined is falsey in javascript.
		// Yes, we could have a preconstructed string or object and create a new copy from it.
		// This is honestly just as fast as far as tests can tell, and, this gives us a much better verbose object to debug with.
		// We aren't coding this for absolute fastest running since it isn't a render or read time step but a compile new versions of content step.
		// Also this simplifies the proximal resets of this map.
		for (let i = 0; i < this.labelsToMatch.length; i++)
		{
			tmpMatchSet[this.labelsToMatch[i]] = false;
		}

		return tmpMatchSet;
	}

	matchAllAlgorithm(pContentDescription)
	{
		let tmpMatchSet = this.generateMatchSet(pContentDescription);

		for (let j = 0; j < pContentDescription.Labels.length; j++)
		{
			// This gets set to true when there is a match found.
			// When in proximal mode, if this is false we reset the match set.
			let tmpMatchFoundThisIteration = false;
			for (let i = 0; i < this.labelsToMatch.length; i++)
			{

				// The label is not already matched
				if (!tmpMatchSet[this.labelsToMatch[i]])
				{
					// Check the label match
					let tmpLabelMatched = this.checkLabelMatch(this.labelsToMatch[i], pContentDescription.Labels[j], tmpMatchSet);

					// It it doesn't require an onlySetEnd, continue checking labels
					if (!this.onlySetEnd)
					{
						if (tmpLabelMatched)
						{
							// This counts as a match found!
							tmpMatchFoundThisIteration = true;
						}
					}
					else if (
						// It matched
						tmpLabelMatched 
						// AND ...
						&& (
							// This requires the match to be at a set end SO
							// It must be at the end of all the label sets...
							(j == pContentDescription.Labels.length - 1)
							// ... OR the next label is a set transition
							|| (pContentDescription.Labels[j+1].indexOf('__LABELSET_') == 0))
						)
					{
						// This counts as a match found!
						tmpMatchFoundThisIteration = true;
					}
					else
					{
						// BECAUSE:
						// 1. It wasn't previously matched (from line 165 above)
						// 2. Labels are required to be at the Set End (from line 171 above)
						// 3. It was not at the end of the Labels array or of a set (from line 182 and 184 above)
						// 4. We are going to roll back the match set = true for this label... it still may match later though!
						tmpMatchSet[this.labelsToMatch[i]] = false;
					}

					// After each match attempt, we need to check match conditions and return if it's a proximal set
					if (this.proximal && this.checkAllMatchConditions(true, tmpMatchSet))
					{
						return true;
					}
				}
			}

			if (!tmpMatchFoundThisIteration && this.proximal)
			{
				// If the match set requires all entries to be proximal, reset the match set state whenever we miss.
				tmpMatchSet = this.generateMatchSet(pContentDescription);
			}


		}

		// Check all match conditions and return true based on the result
		return this.checkAllMatchConditions(true, tmpMatchSet);
	}

	matchSequentialAlgorithm(pContentDescription)
	{
		// We are going to populate these with labels in order as we walk the Content Description Labels array
		let tmpMatchedLabelsSoFar = [];

		// Using different indices so this isn't confused with or copied and pasted to the wrong place.
		for (let k = 0; k < pContentDescription.Labels.length; k++)
		{
			// We can do a trick here --  the only element of the labelsToMatch array we need to check is the length of tmpMatchedLabelsSoFar array
			// This GREATLY simplifies the algorithm.
			if (this.checkLabelMatch(pContentDescription.Labels[k], this.labelsToMatch[tmpMatchedLabelsSoFar.length]))
			{
				tmpMatchedLabelsSoFar.push(this.labelsToMatch[tmpMatchedLabelsSoFar.length])
			}
			else if (this.proximal)
			{
				// If this requires each entry to be proximal, reset the matched labels so far whenever we miss a match.
				// TODO: Should this ignore label sets?  I think no.  Discuss with peers.
				tmpMatchedLabelsSoFar = [];
			}

			// Now see if we've matched all the labels.  Because all we care is that we've matched them all, in order, this is very basic.
			// This also guarantees we've matched all labels naturally so no need to use the lower level function.
			if (tmpMatchedLabelsSoFar.length == this.labelsToMatch.length)
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * Match content against the filter
	 * 
	 * @param {object} pContentDescription
	 * @returns {boolean}
	 */
	matchContent(pContentDescription)
	{
		if (this.labelsToMatch.length < 1)
		{
			return false;
		}

		if(!this.matchAll)
		{
			// The match any algorithm (when matchAll is false) is simplest.
			return this.matchAnyAlgorithm(pContentDescription);
		}
		else if (!this.sequential)
		{
			// The match all algorithm (when matchAll is true but sequential is false) is also pretty simple
			return this.matchAllAlgorithm(pContentDescription);
		}
		else
		{
			return this.matchSequentialAlgorithm(pContentDescription);
		}
	}
}

module.exports = IndoctrinateCatalogLabelFilter;

module.exports.ServiceTypeHash = 'IndoctrinateCatalogFilter-Label';