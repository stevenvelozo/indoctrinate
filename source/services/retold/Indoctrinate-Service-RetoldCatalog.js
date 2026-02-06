/**
* Retold Documentation Catalog Service
*
* Scans the Indoctrinate content catalog for module documentation,
* parses _sidebar.md files, and assembles a unified navigation catalog
* for the Retold Docsify hub.
*
* @author Steven Velozo <steven@velozo.com>
*/

const libPict = require('pict');
const libPath = require('path');

// Known group descriptions for the catalog output
const _GroupDescriptions = {
	'fable': 'Core framework: DI, config, logging, UUID, expressions',
	'meadow': 'Data access layer: ORM, query DSL, schema, DB connectors',
	'orator': 'API server: Restify, static files, HTTP proxy, WebSocket',
	'pict': 'MVC framework: views, templates, providers, forms, TUI',
	'utility': 'Build tools, manifests, documentation, process supervision'
};

class IndoctrinateRetoldCatalog extends libPict.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'IndoctrinateRetoldCatalog';

		this.log.info('Constructed RetoldCatalog Service.');
	}

	/**
	 * Parse a Docsify _sidebar.md string into a structured navigation tree.
	 *
	 * Input format:
	 *   - Section Title
	 *     - [Link Text](path.md)
	 *     - [Another Link](other.md)
	 *   - Another Section
	 *     - [Deep Link](deep/path.md)
	 *
	 * Output: Array of { Title, Path (optional), Children (optional) }
	 *
	 * @param {string} pSidebarContent - Raw markdown content of _sidebar.md
	 * @returns {Array} Parsed navigation tree
	 */
	parseSidebar(pSidebarContent)
	{
		if (typeof(pSidebarContent) !== 'string' || pSidebarContent.length < 1)
		{
			return [];
		}

		let tmpLines = pSidebarContent.split('\n');
		let tmpResult = [];
		let tmpCurrentSection = null;

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i];

			// Skip empty lines
			if (tmpLine.trim().length < 1)
			{
				continue;
			}

			// Determine indent level (count leading spaces, 2 spaces = 1 level)
			let tmpLeadingSpaces = 0;
			for (let j = 0; j < tmpLine.length; j++)
			{
				if (tmpLine[j] === ' ')
				{
					tmpLeadingSpaces++;
				}
				else if (tmpLine[j] === '\t')
				{
					tmpLeadingSpaces += 2;
				}
				else
				{
					break;
				}
			}
			let tmpIndentLevel = Math.floor(tmpLeadingSpaces / 2);

			let tmpTrimmed = tmpLine.trim();

			// Must start with - or * (markdown list item)
			if (tmpTrimmed[0] !== '-' && tmpTrimmed[0] !== '*')
			{
				continue;
			}

			// Strip the list marker
			tmpTrimmed = tmpTrimmed.substring(1).trim();

			// Check if this is a markdown link: [Text](path)
			let tmpLinkMatch = tmpTrimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

			if (tmpIndentLevel === 0)
			{
				// Top-level item — could be a section header or a direct link
				if (tmpLinkMatch)
				{
					// Top-level link (no section parent)
					tmpCurrentSection = null;
					tmpResult.push({
						Title: tmpLinkMatch[1],
						Path: this.normalizeSidebarPath(tmpLinkMatch[2])
					});
				}
				else
				{
					// Section header (no link)
					tmpCurrentSection = {
						Title: tmpTrimmed,
						Children: []
					};
					tmpResult.push(tmpCurrentSection);
				}
			}
			else
			{
				// Indented item — child of current section
				if (tmpLinkMatch)
				{
					let tmpChild = {
						Title: tmpLinkMatch[1],
						Path: this.normalizeSidebarPath(tmpLinkMatch[2])
					};

					if (tmpCurrentSection)
					{
						tmpCurrentSection.Children.push(tmpChild);
					}
					else
					{
						// Indented but no parent section — add to root
						tmpResult.push(tmpChild);
					}
				}
				else
				{
					// Indented section header (sub-section)
					let tmpSubSection = {
						Title: tmpTrimmed,
						Children: []
					};

					if (tmpCurrentSection)
					{
						tmpCurrentSection.Children.push(tmpSubSection);
						// Note: we don't change tmpCurrentSection for deeper nesting
						// because the retold sidebars are typically only 2 levels deep
					}
					else
					{
						tmpResult.push(tmpSubSection);
						tmpCurrentSection = tmpSubSection;
					}
				}
			}
		}

		return tmpResult;
	}

	/**
	 * Normalize sidebar paths — convert `/` to `README.md`, strip leading slashes
	 *
	 * @param {string} pPath - Raw path from sidebar link
	 * @returns {string} Normalized path
	 */
	normalizeSidebarPath(pPath)
	{
		if (!pPath || pPath === '/')
		{
			return 'README.md';
		}

		// Strip leading slash
		if (pPath[0] === '/')
		{
			pPath = pPath.substring(1);
		}

		// If it ends with / it's a directory reference — append README.md
		if (pPath[pPath.length - 1] === '/')
		{
			pPath = pPath + 'README.md';
		}

		return pPath;
	}

	/**
	 * Extract the group name and module name from a content description's labels.
	 *
	 * Given labels like:
	 *   [..., "__LABELSET_ADDRESS", "fable", "fable-log", "docs", ...]
	 * Returns: { Group: "fable", Module: "fable-log" }
	 *
	 * @param {object} pContentDescription - A cataloged content description
	 * @returns {object|null} { Group, Module } or null if not detectable
	 */
	extractGroupAndModule(pContentDescription)
	{
		let tmpLabels = pContentDescription.Labels;
		if (!Array.isArray(tmpLabels))
		{
			return null;
		}

		// Find the __LABELSET_ADDRESS marker
		let tmpAddressIndex = tmpLabels.indexOf('__LABELSET_ADDRESS');
		if (tmpAddressIndex < 0)
		{
			return null;
		}

		// The labels after __LABELSET_ADDRESS until the next __LABELSET_* marker are the path segments
		let tmpAddressLabels = [];
		for (let i = tmpAddressIndex + 1; i < tmpLabels.length; i++)
		{
			if (typeof(tmpLabels[i]) === 'string' && tmpLabels[i].indexOf('__LABELSET_') === 0)
			{
				break;
			}
			tmpAddressLabels.push(tmpLabels[i]);
		}

		// We need at least 2 address labels: group and module
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
	 * e.g. for a file at modules/fable/fable-log/docs/getting-started.md
	 * returns "getting-started.md"
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

		// Address labels are: [group, module, "docs", ...subdirs]
		// Find the "docs" segment and take everything after it
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
	 * Build the unified Retold documentation catalog from the content catalog.
	 *
	 * @param {object} pOptions - { GitHubOrg, DefaultBranch }
	 * @param {function} fCallback - Callback(error, catalog)
	 */
	buildCatalog(pOptions, fCallback)
	{
		let tmpGitHubOrg = (pOptions && pOptions.GitHubOrg) ? pOptions.GitHubOrg : 'stevenvelozo';
		let tmpDefaultBranch = (pOptions && pOptions.DefaultBranch) ? pOptions.DefaultBranch : 'master';

		let tmpCatalog = this.fable.AppData.SourceContentCatalog;

		if (!tmpCatalog || typeof(tmpCatalog) !== 'object')
		{
			this.log.error('No source content catalog found in AppData. Run a compile first.');
			return fCallback(new Error('No source content catalog available'));
		}

		// Use the catalog indices if available, otherwise derive from catalog keys
		let tmpCatalogIndices = this.fable.AppData.SourceContentCatalogIndices || Object.keys(tmpCatalog);

		// First pass: discover all modules and their doc files
		let tmpModulesMap = {};

		for (let i = 0; i < tmpCatalogIndices.length; i++)
		{
			let tmpContentDescription = tmpCatalog[tmpCatalogIndices[i]];
			let tmpGroupModule = this.extractGroupAndModule(tmpContentDescription);

			if (!tmpGroupModule)
			{
				continue;
			}

			let tmpModuleKey = `${tmpGroupModule.Group}/${tmpGroupModule.Module}`;

			if (!tmpModulesMap.hasOwnProperty(tmpModuleKey))
			{
				tmpModulesMap[tmpModuleKey] = {
					Name: tmpGroupModule.Module,
					Repo: tmpGroupModule.Module,
					Group: tmpGroupModule.Group,
					Branch: tmpDefaultBranch,
					HasDocs: false,
					HasCover: false,
					SidebarContent: null,
					Sidebar: [],
					DocFiles: []
				};
			}

			let tmpModule = tmpModulesMap[tmpModuleKey];

			// Check if this file is in a docs folder
			let tmpDocRelativePath = this.extractDocRelativePath(tmpContentDescription);
			if (tmpDocRelativePath !== null)
			{
				tmpModule.HasDocs = true;
				tmpModule.DocFiles.push(tmpDocRelativePath);

				// Check for _sidebar.md
				if (tmpContentDescription.Name === '_sidebar.md' && typeof(tmpContentDescription.Content) === 'string')
				{
					tmpModule.SidebarContent = tmpContentDescription.Content;
				}

				// Check for cover.md
				if (tmpContentDescription.Name === 'cover.md')
				{
					tmpModule.HasCover = true;
				}
			}
		}

		// Second pass: parse sidebars and assemble groups
		let tmpGroupsMap = {};

		let tmpModuleKeys = Object.keys(tmpModulesMap);
		for (let i = 0; i < tmpModuleKeys.length; i++)
		{
			let tmpModule = tmpModulesMap[tmpModuleKeys[i]];

			// Parse sidebar if available
			if (tmpModule.SidebarContent)
			{
				tmpModule.Sidebar = this.parseSidebar(tmpModule.SidebarContent);
			}
			// Clean up the raw sidebar content — don't include in output
			delete tmpModule.SidebarContent;

			// Ensure group exists
			if (!tmpGroupsMap.hasOwnProperty(tmpModule.Group))
			{
				let tmpGroupName = tmpModule.Group.charAt(0).toUpperCase() + tmpModule.Group.slice(1);
				tmpGroupsMap[tmpModule.Group] = {
					Name: tmpGroupName,
					Key: tmpModule.Group,
					Description: _GroupDescriptions[tmpModule.Group] || '',
					Modules: []
				};
			}

			tmpGroupsMap[tmpModule.Group].Modules.push(tmpModule);
		}

		// Sort modules within each group alphabetically
		let tmpGroupKeys = Object.keys(tmpGroupsMap);
		for (let i = 0; i < tmpGroupKeys.length; i++)
		{
			tmpGroupsMap[tmpGroupKeys[i]].Modules.sort(
				function (pA, pB)
				{
					return pA.Name.localeCompare(pB.Name);
				});
		}

		// Assemble final output in canonical group order
		let tmpGroupOrder = ['fable', 'meadow', 'orator', 'pict', 'utility'];
		let tmpGroups = [];

		for (let i = 0; i < tmpGroupOrder.length; i++)
		{
			if (tmpGroupsMap.hasOwnProperty(tmpGroupOrder[i]))
			{
				tmpGroups.push(tmpGroupsMap[tmpGroupOrder[i]]);
			}
		}

		// Add any groups not in the canonical order
		for (let i = 0; i < tmpGroupKeys.length; i++)
		{
			if (tmpGroupOrder.indexOf(tmpGroupKeys[i]) < 0)
			{
				tmpGroups.push(tmpGroupsMap[tmpGroupKeys[i]]);
			}
		}

		let tmpResult = {
			Generated: new Date().toISOString(),
			GitHubOrg: tmpGitHubOrg,
			DefaultBranch: tmpDefaultBranch,
			Groups: tmpGroups
		};

		this.log.info(`Catalog built: ${tmpGroups.length} groups, ${tmpModuleKeys.length} modules discovered.`);

		return fCallback(null, tmpResult);
	}

	/**
	 * Write the catalog JSON to a file.
	 *
	 * @param {object} pCatalog - The catalog object to write
	 * @param {string} pOutputPath - File path to write to
	 * @param {function} fCallback - Callback(error)
	 */
	writeCatalog(pCatalog, pOutputPath, fCallback)
	{
		let tmpOutputDir = libPath.dirname(pOutputPath);
		this.log.info(`Writing Retold catalog to [${pOutputPath}]`);

		this.fable.FilePersistence.makeFolderRecursive(tmpOutputDir,
			(pError) =>
			{
				if (pError)
				{
					this.log.error(`Error creating output directory [${tmpOutputDir}]: ${pError}`);
					return fCallback(pError);
				}

				this.fable.FilePersistence.writeFile(pOutputPath, JSON.stringify(pCatalog, null, '\t'), fCallback);
			});
	}
}

module.exports = IndoctrinateRetoldCatalog;
