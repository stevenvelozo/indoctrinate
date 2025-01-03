const libPictApplication = require('pict-application');

const _DEFAULT_CONFIGURATION = (
{
	"Name": "Repository-Documentation",
	"Hash": "RepoDoc",

	"MainViewportViewIdentifier": "RepositoryDocumentationNavigation",

	"IndoctrinateCatalog": false,

	"pict_configuration":
		{
			"Product": "RepoDoc"
		}
});

class RepositoryDocumentation extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.idx = window.lunr(()=>{
			this.idx.field('content');
			let tmpObjectKeys = Object.keys(this.options.IndoctrinateCatalog.SourceContentCatalog);

			for (let i = 0; i < tmpObjectKeys.length; i++)
			{
				this.idx.add(this.options.IndoctrinateCatalog.SourceContentCatalog[tmpObjectKeys[i]]);
			}
		});
	}
}

module.exports = RepositoryDocumentation

module.exports.default_configuration = _DEFAULT_CONFIGURATION