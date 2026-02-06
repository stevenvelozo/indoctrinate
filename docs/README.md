# Indoctrinate

> A content cataloging, processing, and documentation generation system

Indoctrinate collects dispersed bodies of source material, catalogs them with an automatic label system derived from file paths and names, processes content through extensible tasks, and generates structured output in multiple formats. It also powers the unified Retold documentation hub, aggregating docs from 50+ modules across multiple GitHub repositories.

## Features

- **Automatic Label Generation** - Content is automatically labeled from file path, name, and type without requiring configuration
- **Flexible Content Filtering** - Query the catalog using label matching with proximal, sequential, and set-end algorithms
- **Multi-Phase Pipeline** - Scan, catalog, process, and generate output through a phased compilation system
- **Magic Byte Detection** - Identify true file types regardless of extension using header byte analysis
- **Retold Hub Generation** - Build unified documentation catalogs and keyword indexes across multi-repo projects
- **Extensible Processing** - Add custom processing tasks and output formatters to the pipeline

## Quick Start

```bash
# Install
npm install indoctrinate

# Compile documentation from the current directory
npx indoctrinate compile

# Compile with a specific source directory and output
npx indoctrinate compile -d ./my-project -t ./output

# Generate a Retold documentation catalog
npx indoctrinate generate_catalog -d ./modules -o ./docs/retold-catalog.json

# Generate a keyword search index
npx indoctrinate generate_keyword_index -d ./modules -o ./docs/retold-keyword-index.json
```

## Installation

```bash
npm install indoctrinate
```

Or install globally for CLI usage:

```bash
npm install -g indoctrinate
```

## Core Concepts

### Labels

Every piece of content gets an automatic set of labels derived from its file path, name, and format. These labels enable powerful filtering without manual tagging. A file at `docs/api/authentication.md` automatically gets labels for each path segment, making it discoverable by matching `["api", "authentication"]` in sequence.

### Content Descriptions

When Indoctrinate scans a directory, each file becomes a Content Description object containing identification, path information, MIME type, automatically generated labels, and (for markdown and JSON files) the loaded content itself.

### Catalog & Filtering

The content catalog stores all discovered content descriptions. You query it using filter sets that combine label matching, format matching, and schema matching to select exactly the content you need for output generation.

### Processing Pipeline

Content flows through a multi-phase pipeline: scanning and ingestion, cataloging with label generation, processing with extensible tasks (like magic byte detection), and output generation through formatters.

## Documentation

- [Quick Start](quickstart.md) - Getting up and running
- [Architecture](architecture.md) - System design and compilation phases
- [Labels](concepts/labels.md) - The label system in depth
- [CLI Commands](commands/README.md) - All available commands and options
- [Retold Hub](retold/README.md) - Multi-repo documentation aggregation

## Related Packages

- [fable](https://github.com/stevenvelozo/fable) - Core framework providing dependency injection
- [pict-service-commandlineutility](https://github.com/stevenvelozo/pict-service-commandlineutility) - CLI framework
- [manyfest](https://github.com/stevenvelozo/manyfest) - Manifest management
- [quackage](https://github.com/stevenvelozo/quackage) - Build tooling
