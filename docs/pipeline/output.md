# Output & Formatting

The output stage generates files from cataloged and processed content using structure definitions and formatters.

## How Output Works

The `IndoctrinateServiceOutput` service coordinates output generation by applying target filters and invoking formatters:

```javascript
fable.IndoctrinateServiceOutput.outputTargets(callback);
```

If a target filter is configured, only matching targets are processed.

## Output Formatters

Formatters are responsible for generating actual output files. Each formatter instance tracks its output in `fable.AppData.Output`.

### Writing Output Files

```javascript
// Store a generated file
formatter.writeOutputFile('relative/path', 'filename.html', '<html>...</html>');
```

Output files are stored in the AppData Output map, keyed by the formatter's UUID:

```javascript
fable.AppData.Output['formatter-uuid'] = {
    'relative/path/filename.html': '<html>...</html>'
};
```

### Building from Structures

Formatters can generate output based on structure definitions:

```javascript
formatter.buildStructure(structureDefinition);
```

The default implementation creates a single file. Custom formatters override this method to produce more complex output.

## Creating Custom Formatters

Extend the `OutputFormatter` base class:

```javascript
const libFormatter = require('indoctrinate/source/services/output/Indoctrinate-Output-Formatter');

class HTMLFormatter extends libFormatter
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, pOptions, pServiceHash);
        this.serviceType = 'HTMLFormatter';
    }

    buildStructure(pStructureDefinition)
    {
        // Use the catalog to gather content
        let tmpContent = this.fable.IndoctrinateServiceCatalog.gatherContentByFilterSet(
            pStructureDefinition.Filters
        );

        // Generate output
        for (let i = 0; i < tmpContent.length; i++)
        {
            let tmpHTML = this.renderMarkdownToHTML(tmpContent[i].Content);
            this.writeOutputFile('html', tmpContent[i].Name + '.html', tmpHTML);
        }
    }
}
```

## Output Parts

Output parts are reusable content generators that produce fragments for formatters to assemble:

```javascript
const libOutputPart = require('indoctrinate/source/services/output/Indoctrinate-Output-Part');

class TableOfContentsPart extends libOutputPart
{
    generatePart(pPartDefinition, pContentDescriptions)
    {
        let tmpTOC = '# Table of Contents\n\n';
        for (let i = 0; i < pContentDescriptions.length; i++)
        {
            tmpTOC += `- ${pContentDescriptions[i].Name}\n`;
        }
        return tmpTOC;
    }
}
```

## Supported Output Formats

Indoctrinate includes the `marked` library for markdown-to-HTML conversion and `marked-tex-renderer` for LaTeX output. The `chota` CSS framework is available for styling HTML output.

| Dependency | Purpose |
|------------|---------|
| `marked` | Markdown to HTML conversion |
| `marked-tex-renderer` | Markdown to LaTeX conversion |
| `chota` | Lightweight CSS framework for HTML output |

## Best Practices

1. **Use structure definitions** to describe what content should appear in each output
2. **Keep formatters focused** on a single output format
3. **Use output parts** for reusable content generation patterns
4. **Store all output through `writeOutputFile`** for consistent tracking in AppData
