/**
* Retold Keyword Index Service
*
* Builds a lunr-based keyword search index from all markdown content
* in the Indoctrinate catalog. Produces a serialized index and a
* document reference map for the Docsify hub's cross-module search.
*
* @author Steven Velozo <steven@velozo.com>
*/

const libPict = require('pict');
const libPath = require('path');
const libLunr = require('lunr');

class IndoctrinateRetoldKeywordIndex extends libPict.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateRetoldKeywordIndex';

		this.log.info('Constructed RetoldKeywordIndex Service.');
	}

	/**
	 * Strip markdown formatting from content to produce plain text for indexing.
	 *
	 * Removes: headers (#), links [text](url), images ![](url),
	 * code blocks (fenced and inline), emphasis (star/underscore), HTML tags,
	 * horizontal rules, and list markers.
	 *
	 * @param {string} pMarkdownContent - Raw markdown string
	 * @returns {string} Plain text content
	 */
	stripMarkdown(pMarkdownContent)
	{
		if (typeof(pMarkdownContent) !== 'string')
		{
			return '';
		}

		let tmpText = pMarkdownContent;

		// Remove fenced code blocks (``` ... ```)
		tmpText = tmpText.replace(/```[\s\S]*?```/g, ' ');

		// Remove inline code (` ... `)
		tmpText = tmpText.replace(/`[^`]*`/g, ' ');

		// Remove images ![alt](url)
		tmpText = tmpText.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');

		// Convert links [text](url) to just text
		tmpText = tmpText.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

		// Remove HTML tags
		tmpText = tmpText.replace(/<[^>]+>/g, ' ');

		// Remove header markers
		tmpText = tmpText.replace(/^#{1,6}\s+/gm, '');

		// Remove emphasis markers (* and _)
		tmpText = tmpText.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');

		// Remove horizontal rules
		tmpText = tmpText.replace(/^[-*_]{3,}\s*$/gm, '');

		// Remove list markers (-, *, +, 1.)
		tmpText = tmpText.replace(/^\s*[-*+]\s+/gm, '');
		tmpText = tmpText.replace(/^\s*\d+\.\s+/gm, '');

		// Remove blockquote markers
		tmpText = tmpText.replace(/^\s*>\s+/gm, '');

		// Collapse multiple whitespace
		tmpText = tmpText.replace(/\s+/g, ' ');

		return tmpText.trim();
	}

	/**
	 * Extract the group and module name from a content description's labels.
	 * Same logic as in RetoldCatalog service.
	 *
	 * @param {object} pContentDescription - A cataloged content description
	 * @returns {object|null} { Group, Module } or null
	 */
	extractGroupAndModule(pContentDescription)
	{
		let tmpLabels = pContentDescription.Labels;
		if (!Array.isArray(tmpLabels))
		{
			return null;
		}

		let tmpAddressIndex = tmpLabels.indexOf('__LABELSET_ADDRESS');
		if (tmpAddressIndex < 0)
		{
			return null;
		}

		let tmpAddressLabels = [];
		for (let i = tmpAddressIndex + 1; i < tmpLabels.length; i++)
		{
			if (typeof(tmpLabels[i]) === 'string' && tmpLabels[i].indexOf('__LABELSET_') === 0)
			{
				break;
			}
			tmpAddressLabels.push(tmpLabels[i]);
		}

		if (tmpAddressLabels.length < 2)
		{
			return null;
		}

		return {
			Group: tmpAddressLabels[0],
			Module: tmpAddressLabels[1]
		};
	}

	/**
	 * Extract the relative doc path from a content description.
	 *
	 * @param {object} pContentDescription - A cataloged content description
	 * @returns {string|null} Relative path within the docs folder
	 */
	extractDocRelativePath(pContentDescription)
	{
		let tmpLabels = pContentDescription.Labels;
		if (!Array.isArray(tmpLabels))
		{
			return null;
		}

		let tmpAddressIndex = tmpLabels.indexOf('__LABELSET_ADDRESS');
		if (tmpAddressIndex < 0)
		{
			return null;
		}

		let tmpAddressLabels = [];
		for (let i = tmpAddressIndex + 1; i < tmpLabels.length; i++)
		{
			if (typeof(tmpLabels[i]) === 'string' && tmpLabels[i].indexOf('__LABELSET_') === 0)
			{
				break;
			}
			tmpAddressLabels.push(tmpLabels[i]);
		}

		let tmpDocsIndex = tmpAddressLabels.indexOf('docs');
		if (tmpDocsIndex < 0)
		{
			return null;
		}

		let tmpSubPath = tmpAddressLabels.slice(tmpDocsIndex + 1);
		let tmpFileName = pContentDescription.Name;

		if (tmpSubPath.length > 0)
		{
			return tmpSubPath.join('/') + '/' + tmpFileName;
		}
		return tmpFileName;
	}

	/**
	 * Build the keyword index from all markdown content in the catalog.
	 *
	 * @param {function} fCallback - Callback(error, indexResult)
	 */
	buildKeywordIndex(fCallback)
	{
		let tmpCatalog = this.fable.AppData.SourceContentCatalog;

		if (!tmpCatalog || typeof(tmpCatalog) !== 'object')
		{
			this.log.error('No source content catalog found in AppData.');
			return fCallback(new Error('No source content catalog available'));
		}

		// Use the catalog indices if available, otherwise derive from catalog keys
		let tmpCatalogIndices = this.fable.AppData.SourceContentCatalogIndices || Object.keys(tmpCatalog);

		// Collect all markdown documents that have content and are in a docs/ folder
		let tmpDocuments = {};
		let tmpLunrDocs = [];

		for (let i = 0; i < tmpCatalogIndices.length; i++)
		{
			let tmpContentDescription = tmpCatalog[tmpCatalogIndices[i]];

			// Only index markdown files with loaded content
			if (tmpContentDescription.Format !== 'markdown' || typeof(tmpContentDescription.Content) !== 'string' || tmpContentDescription.Content.length < 1)
			{
				continue;
			}

			let tmpGroupModule = this.extractGroupAndModule(tmpContentDescription);
			if (!tmpGroupModule)
			{
				continue;
			}

			let tmpDocPath = this.extractDocRelativePath(tmpContentDescription);
			if (!tmpDocPath)
			{
				continue;
			}

			// Skip _sidebar.md and cover.md — they are navigation, not content
			if (tmpContentDescription.Name === '_sidebar.md' || tmpContentDescription.Name === 'cover.md')
			{
				continue;
			}

			let tmpDocKey = `${tmpGroupModule.Group}/${tmpGroupModule.Module}/${tmpDocPath}`;

			// Strip markdown for indexing
			let tmpPlainText = this.stripMarkdown(tmpContentDescription.Content);

			// Extract a title from the first heading in the content
			let tmpTitleMatch = tmpContentDescription.Content.match(/^#\s+(.+)$/m);
			let tmpTitle = tmpTitleMatch ? tmpTitleMatch[1] : tmpContentDescription.Name;

			tmpDocuments[tmpDocKey] = {
				Title: tmpTitle,
				Module: tmpGroupModule.Module,
				Group: tmpGroupModule.Group,
				DocPath: tmpDocPath
			};

			tmpLunrDocs.push({
				id: tmpDocKey,
				title: tmpTitle,
				module: tmpGroupModule.Module,
				group: tmpGroupModule.Group,
				body: tmpPlainText
			});
		}

		this.log.info(`Building keyword index from ${tmpLunrDocs.length} markdown documents...`);

		// Build the lunr index
		let tmpIndex = libLunr(
			function ()
			{
				this.ref('id');
				this.field('title', { boost: 10 });
				this.field('module', { boost: 5 });
				this.field('group', { boost: 3 });
				this.field('body');

				for (let i = 0; i < tmpLunrDocs.length; i++)
				{
					this.add(tmpLunrDocs[i]);
				}
			});

		let tmpResult = {
			Generated: new Date().toISOString(),
			DocumentCount: tmpLunrDocs.length,
			LunrIndex: tmpIndex.toJSON(),
			Documents: tmpDocuments
		};

		this.log.info(`Keyword index built: ${tmpLunrDocs.length} documents indexed.`);

		return fCallback(null, tmpResult);
	}

	/**
	 * Write the keyword index JSON to a file.
	 *
	 * @param {object} pIndexResult - The index result object
	 * @param {string} pOutputPath - File path to write to
	 * @param {function} fCallback - Callback(error)
	 */
	writeKeywordIndex(pIndexResult, pOutputPath, fCallback)
	{
		let tmpOutputDir = libPath.dirname(pOutputPath);
		this.log.info(`Writing Retold keyword index to [${pOutputPath}]`);

		this.fable.FilePersistence.makeFolderRecursive(tmpOutputDir,
			(pError) =>
			{
				if (pError)
				{
					this.log.error(`Error creating output directory [${tmpOutputDir}]: ${pError}`);
					return fCallback(pError);
				}

				this.fable.FilePersistence.writeFile(pOutputPath, JSON.stringify(pIndexResult, null, '\t'), fCallback);
			});
	}
}

module.exports = IndoctrinateRetoldKeywordIndex;
