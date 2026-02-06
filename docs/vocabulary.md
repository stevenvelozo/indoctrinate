# Vocabulary

Indoctrinate has a specific vocabulary for describing its content pipeline. This glossary defines each term and shows where it fits in the system.

## Core Terms

| Term | Definition | Learn More |
|------|-----------|------------|
| **Content** | Any single piece or body of material — textual, referential, data, or media | [Content Descriptions](concepts/content-descriptions.md) |
| **Content Description** | The metadata record Indoctrinate creates for each piece of content: UUID, path, labels, type info, and optionally the file body | [Content Descriptions](concepts/content-descriptions.md) |
| **Source Material** | The input files, data responses, and other content used to generate output | [Input & Scanning](pipeline/input.md) |
| **Output Material** | The generated files produced after source material flows through a structure and format | [Output & Formatting](pipeline/output.md) |
| **Catalog** | The in-memory store of all content descriptions, queryable by labels, format, and schema | [Catalog & Filtering](concepts/catalog-filtering.md) |

## Labels & Filtering

| Term | Definition | Learn More |
|------|-----------|------------|
| **Label** | A textual token automatically generated from a file's path, name, or type | [Labels](concepts/labels.md) |
| **Label Set** | A group of labels sharing a common marker (e.g., `__LABELSET_ADDRESS`) | [Labels](concepts/labels.md) |
| **Filter** | A query object that selects content from the catalog by labels, format, or schema | [Catalog & Filtering](concepts/catalog-filtering.md) |
| **Proximal Match** | A label filter where terms must appear adjacent to each other in order | [Labels](concepts/labels.md) |
| **Set End Match** | A label filter where terms must appear at the end of a label set boundary — useful for non-recursive folder matching | [Labels](concepts/labels.md) |

## Structure & Output

| Term | Definition | Learn More |
|------|-----------|------------|
| **Structure** | The definition of section shape and source material for a particular output — what content goes where | [Structures & Targets](configuration/structures-targets.md) |
| **Section** | A named part of a structure with its own set of filters that select content from the catalog | [Structures & Targets](configuration/structures-targets.md) |
| **Target** | A specific output format paired with a structure — one structure can produce multiple targets | [Structures & Targets](configuration/structures-targets.md) |
| **Format** | The output type for generated material (e.g., HTML, Markdown, LaTeX) | [Structures & Targets](configuration/structures-targets.md) |
| **Formatter** | The service that transforms structured content into a specific output format | [Output & Formatting](pipeline/output.md) |

## Pipeline

| Term | Definition | Learn More |
|------|-----------|------------|
| **Compilation** | The full pipeline: scan files, catalog them, process content, apply structures, generate output | [Architecture](architecture.md) |
| **Scanner** | The service that traverses the filesystem to discover files | [Input & Scanning](pipeline/input.md) |
| **Ingestor** | The service that creates content descriptions from discovered files | [Input & Scanning](pipeline/input.md) |
| **Processing Task** | A step that analyzes or enriches content descriptions after cataloging (e.g., magic byte detection) | [Processing Tasks](pipeline/processing.md) |
| **AppData** | The central state object that flows through all compilation phases and can be serialized to JSON | [Architecture](architecture.md) |

## Content Examples

Content can be many things:

- Markdown documents
- Photographs and diagrams
- Source code files
- Tabular data and CSV files
- JSON records and configuration
- Binary assets (detected via magic bytes)

## Structure Examples

A structure defines the shape of a particular kind of output. The same source material can be arranged differently depending on the goal.

**A book:**
front matter, table of contents, foreword, chapters, index, glossary

**A software documentation site:**
navigation, quick start, tutorials, data model docs, architecture docs, API reference, examples, searchable index

**A solution plan:**
executive summary, contacts, project summary, problem description, technical architecture, glossary, change log

**A zine:**
title page, table of contents, letter from editor, articles, graphic inserts, advertisements

## Dictionary & Terms

Indoctrinate supports domain-specific vocabularies. A **Dictionary** is a collection of terms with meanings specific to a particular content output structure. A **Term** is a single word in that dictionary.

For example, "class" might mean a group of students in one dictionary and an object-oriented programming construct in another. Indoctrinate treats vocabulary as a first-class citizen, allowing terms to be context-aware across different output structures.
