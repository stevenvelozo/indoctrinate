# Quick Start

Get up and running with Indoctrinate in minutes.

## Installation

```bash
npm install indoctrinate
```

Or install globally:

```bash
npm install -g indoctrinate
```

## Compile Documentation

Indoctrinate works out of the box for any Node.js project with markdown files:

```bash
npx indoctrinate compile
```

This scans the current directory, catalogs every file with automatic labels, runs processing tasks, and generates output in `./dist/`.

## Specify Directories

```bash
npx indoctrinate compile -d ./my-project -t ./output
```

## View the Catalog

Save the catalog for inspection:

```bash
npx indoctrinate compile -d ./my-project -c
```

The catalog is saved to `./dist/indoctrinate_content_staging/Indoctrinate-Catalog-AppData.json`. This JSON file shows every discovered file with its labels, MIME type, and content hash.

## Programmatic Usage

Use Indoctrinate as a library:

```javascript
const libPict = require('pict-service-commandlineutility');
const libIndoctrinate = require('indoctrinate/source/Indoctrinate-Fable-Service');

let tmpPict = new libPict();
tmpPict.addServiceType('Indoctrinate', libIndoctrinate);

let tmpCompiler = tmpPict.instantiateServiceProvider('Indoctrinate', {
    directory_root: __dirname,
    target_output_folder: __dirname + '/output'
});

tmpCompiler.compileContent(function (pError)
{
    if (pError) { console.error(pError); return; }

    // Access the catalog
    let tmpCatalog = tmpCompiler.fable.AppData.SourceContentCatalog;
    let tmpIndices = tmpCompiler.fable.AppData.SourceContentCatalogIndices;

    console.log(tmpIndices.length + ' files cataloged');

    // Filter for markdown files
    let tmpMarkdown = tmpCompiler.fable.IndoctrinateServiceCatalog.gatherContentByFilterSet([
        { Type: 'Format', Format: 'markdown' }
    ]);

    console.log(tmpMarkdown.length + ' markdown files found');
});
```

## Retold Documentation Hub

For multi-repo documentation aggregation:

```bash
# Generate navigation catalog
npx indoctrinate generate_catalog -d ./modules -o ./docs/retold-catalog.json

# Generate keyword search index
npx indoctrinate generate_keyword_index -d ./modules -o ./docs/retold-keyword-index.json
```

See [Retold Documentation Hub](retold/README.md) for the complete setup guide.

## Next Steps

- [Architecture](architecture.md) - Understand how the system works
- [Labels](concepts/labels.md) - Learn about the label system
- [CLI Commands](commands/README.md) - All available commands
- [Configuration](configuration/README.md) - Customize Indoctrinate for your project
