# Keyword Index

The keyword index provides cross-module search for the Retold documentation hub by building a lunr index from all markdown content across modules.

## Service

```javascript
fable.IndoctrinateRetoldKeywordIndex
```

## How It Works

1. Filter the catalog for markdown files in `docs/` folders that have content loaded
2. Skip navigation files (`_sidebar.md`, `cover.md`)
3. Strip markdown formatting to produce plain text
4. Extract a title from the first `#` heading (or fall back to filename)
5. Build a lunr index with weighted fields
6. Serialize the index and a document reference map to JSON

## Markdown Stripping

Content is stripped of formatting before indexing to improve search quality:

| Removed | Example |
|---------|---------|
| Fenced code blocks | ` ```js ... ``` ` |
| Inline code | `` `variable` `` |
| Image references | `![alt](url)` |
| Link URLs | `[text](url)` → `text` |
| HTML tags | `<div>...</div>` |
| Header markers | `# Title` → `Title` |
| Emphasis | `**bold**` → `bold` |
| List markers | `- item` → `item` |
| Blockquotes | `> text` → `text` |
| Horizontal rules | `---` |

## Search Field Weights

| Field | Boost | Source |
|-------|-------|--------|
| `title` | 10x | First `#` heading or filename |
| `module` | 5x | Module name from labels |
| `group` | 3x | Group name from labels |
| `body` | 1x | Stripped markdown content |

The boost values ensure that searching for a module name returns that module's documentation first, before pages that merely mention it.

## Document Reference Map

Each indexed document has a reference entry so the hub can build links from search results:

```json
{
    "fable/fable-log/README.md": {
        "Title": "fable-log",
        "Module": "fable-log",
        "Group": "fable",
        "DocPath": "README.md"
    }
}
```

The document key format is `{group}/{module}/{docpath}`, which the hub plugin converts to a Docsify route.

## Client-Side Search

The Docsify hub loads the keyword index and creates a lunr index client-side:

```javascript
// In the browser
let tmpIndex = lunr.Index.load(indexData.LunrIndex);
let tmpResults = tmpIndex.search('schema definition');

// Map results to documents
tmpResults.forEach(function (pResult)
{
    let tmpDoc = indexData.Documents[pResult.ref];
    // tmpDoc.Title, tmpDoc.Module, tmpDoc.Group, tmpDoc.DocPath
});
```

## Index Size

The keyword index size scales with the volume of documentation. For the current Retold suite with 368 indexed documents, the JSON file is approximately 3MB. The lunr library handles this efficiently in the browser.

## Programmatic Access

```javascript
const libPict = require('pict-service-commandlineutility');
const libIndoctrinate = require('indoctrinate/source/Indoctrinate-Fable-Service');

let tmpPict = new libPict();
tmpPict.addServiceType('Indoctrinate', libIndoctrinate);

let tmpCompiler = tmpPict.instantiateServiceProvider('Indoctrinate', {
    directory_root: '/path/to/retold/modules',
    output_file: '/path/to/retold/docs/retold-keyword-index.json'
});

tmpCompiler.generateKeywordIndex(function (pError)
{
    if (pError) { console.error(pError); return; }

    let tmpIndex = tmpCompiler.retoldKeywordIndex;
    console.log(tmpIndex.DocumentCount + ' documents indexed');
});
```

## Staleness and Freshness

The keyword index is intentionally a point-in-time snapshot. It will drift out of sync as module documentation is edited, and that is acceptable. The index reflects the state of documentation at the time it was generated.

Re-generate when:
- Major documentation rewrites happen
- New modules with documentation are added
- You want search to reflect recent content changes
