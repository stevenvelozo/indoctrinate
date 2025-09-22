
const libPictServiceCommandLineUtility = require('pict-service-commandlineutility');

const libPath = require('path');
const libMime = require('mime');

class Ingestor extends libPictServiceCommandLineUtility.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'IndoctrinateIngestor';

		// Initialize the service without a root folder label set
		this.setRootFolderLabelSetFromPath('');

		this.log.info('Constructed Content Ingestor Service.');
	}

	setRootFolderLabelSetFromPath(pPath)
	{
		this.rootFolderLabelSet = [];
		
		let tmpRootFolders = pPath.split(libPath.sep);

		for (let i = 0; i < tmpRootFolders.length; i ++)
		{
			if (tmpRootFolders[i])
			{
				this.rootFolderLabelSet.push(tmpRootFolders[i]);
			}
		}
	}

	getContentHash(pPath, pAddressType)
	{
		return `${pAddressType}~CONTENT~${pPath}`;
	}

	getContentLocation(pPath, pAddressType)
	{
		// The base ingestor deals exclusively with files.
		if (this.fable.DataFormat.stringStartsWith(pPath.toUpperCase(), "FILE://") && (pAddressType == 'URI'))
		{
			// Parse the path out of the file URI ... we want to strip off the `FILE://` first
			let tmpLocation = libPath.dirname(pPath.substr(6));
			return tmpLocation;
		}
		// TODO: teach this http, sftp, ftp, scp, kiwix (this is where those else if blocks go)
		else
		{
			// Return the whole path if we don't know how to parse out a location
			return pPath;
		}
	}

	getContentName(pPath, pAddressType)
	{
		// The base ingestor deals exclusively with files.
		if (this.fable.DataFormat.stringStartsWith(pPath.toUpperCase(), "FILE://") && (pAddressType == 'URI'))
		{
			// Parse the name out of the file URI ... we want to strip off the `FILE://` first
			let tmpName = libPath.basename(pPath.substr(6));
			return tmpName;
		}
		// TODO: teach this http, sftp, ftp, scp, kiwix (this is where those else if blocks go)
		else
		{
			// Return the whole path if we don't know how to parse out a location
			return pPath;
		}
	}

	// Yes, mime types are "type" and "subtype" but we are going with "nature", "format" and "flavor" for a more granular approach
	getContentNature(pPath, pAddressType, pMimeType)
	{
		let tmpNature = 'UNKNOWN';

		if (typeof(pMimeType) !== 'string')
		{
			return tmpNature;
		}
		let tmpMimeTypeParts = pMimeType.split('/');
		if (tmpMimeTypeParts.length > 0)
		{
			tmpNature = tmpMimeTypeParts[0];
		}

		return tmpNature;
	}

	getContentFormat(pPath, pAddressType, pMimeType)
	{
		let tmpFormat = 'UNKNOWN';

		if (typeof(pMimeType) !== 'string')
		{
			return tmpFormat;
		}
		let tmpMimeTypeParts = pMimeType.split('/');
		if (tmpMimeTypeParts.length > 1)
		{
			tmpFormat = tmpMimeTypeParts[1];
		}

		return tmpFormat;
	}

	populateContentBaseLabels(pContentDescription)
	{
		// Presume the pContentDescription is of a type object and is a valid content description
		if (pContentDescription.Labels.length > 0)
		{
			this.fable.log.warn(`Attempted to populateContentBaseLabels for content description ${pContentDescription.UUID} [${pContentDescription.Path}] but labels were already present.`);
			return pContentDescription;
		}

		// The base ingestor deals exclusively with files.
		if (this.fable.DataFormat.stringStartsWith(pContentDescription.Path.toUpperCase(), "FILE://") && (pContentDescription.Type == 'URI'))
		{
			pContentDescription.Labels.push('__LABELSET_TYPE');
			pContentDescription.Labels.push('FILE');

			pContentDescription.Labels.push('__LABELSET_ADDRESS');
			let tmpAddressLabelCount = 0;
			// This state is for checking if we should ignore a label due to it being in the "root"
			let tmpRootLabelsIndex = 0;
			let tmpLocationLabels = pContentDescription.Location.split(libPath.sep);
			for (let i = 0; i < tmpLocationLabels.length; i++)
			{
				let tmpLocationLabel = tmpLocationLabels[i];
				// Do jiggery pokery with the root folder label set.
				// IF: There is a label in the array her
				if (tmpLocationLabel
				// AND IF: We haven't set an address label
					&& (tmpAddressLabelCount < 1)
				// AND IF: There are more root labels than our root labels index
					&& (this.rootFolderLabelSet.length > tmpRootLabelsIndex)
				// AND IF: The label matches the root label at the root labels index)
					&& (this.rootFolderLabelSet[tmpRootLabelsIndex] == tmpLocationLabel)
					)
				{
					// Incriment the root label index and skip pushing.
					tmpRootLabelsIndex++;
				}
				// Otherwise if there is a label
				else if (tmpLocationLabel)
				{
					pContentDescription.Labels.push(tmpLocationLabel);
					tmpAddressLabelCount++;
				}
			}

			pContentDescription.Labels.push('__LABELSET_NAME');
			// Right now this splits on underscore (_), dash (-) and dot (.)... if we need more, rewrite this
			let tmpNameLabelSet = pContentDescription.Name.split('.');
			for (let i = 0; i < tmpNameLabelSet.length; i++)
			{
				let tmpNameLabelSetDashSplit = tmpNameLabelSet[i].split('-');
				// If the file name has an extension
				if ((tmpNameLabelSet.length > 1) 
					// And this is the extension (the last match split on .)
					&& (i == tmpNameLabelSet.length - 1))
				{
					// This is the extension, which is the last matched element.
					// Set it to an empty array to skip the next part.
					tmpNameLabelSetDashSplit = [];
				}
				for (let j = 0; j < tmpNameLabelSetDashSplit.length; j++)
				{
					let tmpNameLabelSetUnderscoreSplit = tmpNameLabelSetDashSplit[j].split('_');
					for (let k = 0; k < tmpNameLabelSetUnderscoreSplit.length; k++)
					{
						let tmpNameLabel = tmpNameLabelSetUnderscoreSplit[k];
						if (tmpNameLabel)
						{
							pContentDescription.Labels.push(tmpNameLabel);
						}
					}
				}
			}

			pContentDescription.Labels.push('__LABELSET_EXTENSION');
			pContentDescription.Labels.push(libPath.extname(pContentDescription.Name));

			pContentDescription.Labels.push('__LABELSET_FILENAME');
			pContentDescription.Labels.push(pContentDescription.Name);

			pContentDescription.Labels.push('__LABELSET_FULLPATH');
			pContentDescription.Labels.push(pContentDescription.Path);

			pContentDescription.Labels.push('__LABELSET_FORMAT');
			pContentDescription.Labels.push(pContentDescription.Format);
			pContentDescription.Labels.push(pContentDescription.Schema);

		}
		// TODO: teach this http, sftp, ftp, scp, kiwix (this is where those else if blocks go)
		else
		{
			// Not really much we can do so don't label this at all.
		}

		return pContentDescription;
	}

	checkContentMappingFilters(pContentDescription)
	{
		// This is where we have filters that set the "Type" of mappings and such.
		return pContentDescription;
	}

	createContentDescription(pPath, pAddressType)
	{
		if (typeof(pPath) !== 'string')
		{
			this.log.warn(`Tried to createContentDescription but the pPath passed in was a ${typeof(pPath)} when it must be a string.`);
		}

		// The default type is a URI
		let tmpAddressType = (typeof(pAddressType) === 'undefined') ? 'URI' : pAddressType;
		let tmpMimeType = libMime.getType(pPath);

		// Get a content description object
		let tmpContentDescription = (
			{
				"UUID": this.fable.getUUID(),
				"Type": tmpAddressType,
				"Hash": this.getContentHash(pPath, tmpAddressType),

				"Path": pPath,

				"Location": this.getContentLocation(pPath, tmpAddressType),
				"Name": this.getContentName(pPath, tmpAddressType),

				// Mime is the mime type of the file (e.g. text/plain, text/markdown, application/json, etc.)
				"MimeType": tmpMimeType,

				// Nature is the general type of the file (e.g. text, application, image, etc.)
				"Nature": this.getContentNature(pPath, tmpAddressType, tmpMimeType),

				// Format is the file format (e.g. txt, md, json, xml, html, csv, etc.)
				// This is distinct from Mime type because there are different formats for the same type (e.g. a gutenberg text file and a plain text file)
				"Format": this.getContentFormat(pPath, tmpAddressType, tmpMimeType),

				// Schema is an extra descriptor to tell us if we can expect specific content or content markers (e.g. a package.json)
				"Schema": 'Default',

				"Content": false,

				"Labels": []
			});

		// TODO: Create Ingestors for each type below so they are easy to add.
		if (tmpContentDescription.Format == 'markdown')
		{
			// The markdown files are used to automagically add some extra labels to the content during the compile phase, so pull them in.
			console.log(`... Reading Markdown file [${tmpContentDescription.Path}] ...`);
			tmpContentDescription.Content = this.fable.FilePersistence.readFileSync(libPath.join(tmpContentDescription.Location, tmpContentDescription.Name));
			console.log(`    (read ${tmpContentDescription.Content.length} characters from the file)`)
		}

		if (tmpContentDescription.Format == 'json')
		{
			// There are some JSON files which need to be loaded now, to ingest extra folders.
			console.log(`... checking if JSON file ${tmpContentDescription.Path} is one of the special internal file types...`);
			if (tmpContentDescription.Name == 'package.json')
			{
				// The node package.json files are used to automagically add some extra labels to the content during the compile phase, so pull them in.
				tmpContentDescription.Schema = 'PackageDotJSON';
				try
				{
					tmpContentDescription.Content = require(libPath.join(tmpContentDescription.Location, tmpContentDescription.Name));
				}
				catch(pError)
				{
					this.fable.log.error(`Error loading or parsing the package.json file [${tmpContentDescription.Path}]: ${pError}`);
				}
			}
			if (tmpContentDescription.Name.toUpperCase().indexOf('INDOCTRINATE-EXTRAFOLDERS.JSON') == 0)
			{
				// The indoctrinate-extrafolders.json is a directive file that adds extra scan paths
				tmpContentDescription.Schema = 'Indoctrinate-ExtraFolders';
				try
				{
					tmpContentDescription.Content = require(libPath.join(tmpContentDescription.Location, tmpContentDescription.Name));
					if (Array.isArray(tmpContentDescription.Content))
					{
						for (let i = 0; i < tmpContentDescription.Content.length; i++)
						{
							// TODO: Type guards?
							// TODO: Duplicate include safety?  Technically cataloging is idempotent and throws a warning so seems okay but maybe spammy if you dup.
							this.fable.log.info(`Adding extra scan folder [${tmpContentDescription.Content[i]}] from the Indoctrinate-ExtraFolders file [${tmpContentDescription.Path}].`);
							this.fable.AppData.AdditionalScanFolders.push(tmpContentDescription.Content[i]);
						}
					}
					else
					{
						this.fable.log.warn(`The Indoctrinate-ExtraFolders file [${tmpContentDescription.Path}] was loaded but isn't an array; no new scan folders are being added.`);
					}
				}
				catch (pError)
				{
					this.fable.log.error(`Error loading or parsing the Indoctrinate-ExtraFolders file [${tmpContentDescription.Path}]: ${pError}`);
				}
			}

			// If the filename starts with indoctrinate-structure and is a JSON file, it's a directive file that adds a content structure.
			if (tmpContentDescription.Name.toUpperCase().indexOf('INDOCTRINATE-STRUCTURE') == 0)
			{
				// The indoctrinate-extrafolders.json is a directive file that adds extra scan paths
				tmpContentDescription.Schema = 'Indoctrinate-Structure';
				try
				{
					tmpContentDescription.Content = require(libPath.join(tmpContentDescription.Location, tmpContentDescription.Name));
					this.fable.log.info(`Adding structure from the Indoctrinate-Structure file [${tmpContentDescription.Path}].`);
					this.fable.IndoctrinateServiceStructure.addStructure(tmpContentDescription.Content);
				}
				catch (pError)
				{
					this.fable.log.error(`Error loading or parsing the Indoctrinate-Structure file [${tmpContentDescription.Path}]: ${pError}`);
				}
			}

			// If the filename starts with indoctrinate-target and is a JSON file, it's a directive file that adds a content target.
			if (tmpContentDescription.Name.toUpperCase().indexOf('INDOCTRINATE-TARGET') == 0)
			{
				// The indoctrinate-extrafolders.json is a directive file that adds extra scan paths
				tmpContentDescription.Schema = 'Indoctrinate-Target';
				try
				{
					tmpContentDescription.Content = require(libPath.join(tmpContentDescription.Location, tmpContentDescription.Name));
					this.fable.log.info(`Adding target from the Indoctrinate-Target file [${tmpContentDescription.Path}].`);
					this.fable.IndoctrinateServiceTarget.addTarget(tmpContentDescription.Content);
				}
				catch (pError)
				{
					this.fable.log.error(`Error loading or parsing the Indoctrinate-Target file [${tmpContentDescription.Path}]: ${pError}`);
				}
			}
		}
		
		tmpContentDescription = this.populateContentBaseLabels(tmpContentDescription);

		tmpContentDescription = this.checkContentMappingFilters(tmpContentDescription);

		return tmpContentDescription;
	}


	createContentDescriptionFromFile(pFilePath)
	{
		if ((typeof(pFilePath) !== 'string') || (pFilePath.length < 1))
		{
			return false;
		}

		// Right now this potentially won't work on windows, due to oddities with path url's.
		// Also this function only works with non-relative URLs.  Resolve the path before calling it.
		return this.createContentDescription(`FILE:/${pFilePath}`);
	}
}

module.exports = Ingestor;