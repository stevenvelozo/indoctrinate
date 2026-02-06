# Architecture

This document describes the internal architecture and design patterns used in Indoctrinate.

## In Plain English

Indoctrinate catalogs an addressable set of content, building metadata (name, tags, ingest time, source) from content material and its location. Because it scans a known directory tree, very few descriptors need to be passed at runtime — everything can be addressed using well-formed label filter sets.

What this means in practice: you can auto-generate documentation for a repository without writing any configuration. If your repository has a `README.md` and a few other files (potentially with special names), a structured documentation site can be generated automatically.

## Overview

Indoctrinate is built on the Fable **Service Provider Pattern**, with a multi-phase compilation pipeline that transforms source files into cataloged, processed, and structured output.

```
Source Files → Scanner → Ingestor → Catalog → Processor → Output
                 ↓          ↓          ↓          ↓          ↓
              Discover   Describe    Store     Analyze    Generate
               files      files     & index   & enrich    output
```

## Service Architecture

The system is composed of seven Fable services orchestrated by the main `IndoctrinateFableService`:

```
IndoctrinateFableService (Orchestrator)
    ├── IndoctrinateServiceInput       (Scanning & Ingestion)
    │     ├── IndoctrinateFileScanner  (File system traversal)
    │     └── IndoctrinateIngestor     (Content description creation)
    ├── IndoctrinateServiceCatalog     (Content storage & filtering)
    ├── IndoctrinateServiceStructure   (Output structure definitions)
    ├── IndoctrinateServiceProcessor   (Content processing tasks)
    │     └── UnderstandFile           (Magic byte detection)
    ├── IndoctrinateServiceOutput      (Output generation)
    │     ├── OutputFormatter          (File generation)
    │     └── OutputPart              (Content part assembly)
    ├── IndoctrinateRetoldCatalog      (Retold doc catalog builder)
    └── IndoctrinateRetoldKeywordIndex (Keyword search index builder)
```

## Compilation Phases

The `compile` command executes content through six sequential phases, orchestrated using Fable's Anticipate pattern for async task chaining.

### Phase 0: Environment Preparation

Initialize all services, resolve directory paths, and create output and staging folders.

```javascript
tmpAnticipate.anticipate(this.initializeServiceProviders.bind(this));
tmpAnticipate.anticipate(this.prepareConfigurations.bind(this));
tmpAnticipate.anticipate(this.prepareDestinationFolder.bind(this));
tmpAnticipate.anticipate(this.prepareStagingFolder.bind(this));
```

### Phase 1: Cataloging Source Content

Recursively scan the root directory, create content descriptions for every file, assign labels, and store them in the catalog. A second pass scans any additional folders discovered from `indoctrinate-extrafolders.json` files.

### Phase 2: Processing Source Content

Run each cataloged item through processing tasks. The default task is `UnderstandFile`, which reads magic bytes to detect the true file type regardless of extension.

### Phase 3: Generating Structured Content

Apply structure definitions and target filters to produce output files through formatters.

### Phase 4-5: Copying and Cleanup

Reserved for copying generated content to the destination and cleaning up staging artifacts.

## AppData: Central State

All compilation state flows through `fable.AppData`, a central object that persists between phases and can be serialized to JSON:

```javascript
{
    // Paths
    RootFolder: '/path/to/source',
    OutputFolderPath: '/path/to/output',
    StageFolderPath: '/path/to/staging',
    AdditionalScanFolders: [],

    // Options
    TargetFilter: false,
    WriteCatalogFile: true,
    IgnoreUnknownTypes: false,

    // Content
    SourceContentCatalog: {
        'URI~CONTENT~FILE://path/to/file.md': { /* ContentDescription */ }
    },
    SourceContentCatalogIndices: [ /* hash keys */ ],

    // Structures and Targets
    StructuresMap: {},
    TargetsMap: {},

    // Generated Output
    Output: {}
}
```

The AppData file can be saved to disk (as `Indoctrinate-Catalog-AppData.json`) and reloaded later for the `extended_process` command, allowing content to be re-processed without re-scanning the filesystem.

## Path Resolution

Configuration is resolved with a clear precedence chain:

1. **Existing AppData value** (from a loaded catalog)
2. **CLI parameter** (command-line flags)
3. **Settings file** (`.indoctrinate.config.json`)
4. **Default** (CWD for source, `dist/` for output)

## Extending Indoctrinate

### Custom Processing Tasks

Add processing logic by extending the `ProcessingTask` base class:

```javascript
const libProcessingTask = require('./Indoctrinate-Service-ProcessingTask.js');

class MyCustomTask extends libProcessingTask
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, pOptions, pServiceHash);
        this.serviceType = 'MyCustomProcessingTask';
    }

    processContentFile(fCallback, pContentDescription)
    {
        this.prepareDescriptionForExtendedContent(pContentDescription);
        // Add custom metadata
        this.addContentToExtendedCatalogData(
            pContentDescription,
            { MyData: 'analysis result' },
            'CustomAnalysis'
        );
        return fCallback();
    }
}
```

### Custom Output Formatters

Create output formatters by extending the `OutputFormatter` base class:

```javascript
const libFormatter = require('./Indoctrinate-Output-Formatter.js');

class MyFormatter extends libFormatter
{
    buildStructure(pStructureDefinition)
    {
        // Generate output files based on structure
        this.writeOutputFile('output', 'result.html', '<html>...</html>');
    }
}
```

## Design Principles

### Convention Over Configuration

Indoctrinate generates rich metadata (labels, types, formats) automatically from file paths and names. A project with well-organized directories needs zero configuration to produce useful documentation.

### Serializable State

The entire compilation state can be serialized to JSON and reloaded, enabling two-step workflows where scanning and processing happen separately or on different machines.

### Extensible Pipeline

Every phase of the pipeline can be extended: custom ingestors for new file types, custom processing tasks for content analysis, custom filters for content selection, and custom formatters for output generation.
