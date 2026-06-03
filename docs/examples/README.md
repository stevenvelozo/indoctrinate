# Examples

Indoctrinate includes several example projects demonstrating different use cases.

## Book Example

A multi-chapter book with front matter, chapters organized by number, and vocabulary definitions.

<!-- bespoke diagram: edit diagrams/book-example.mmd or .hints.json, then: npx pict-renderer-graph build modules/utility/indoctrinate/docs/examples -->
![Book Example](diagrams/book-example.svg)

The structure file defines sections with label filters that select content from the `frontmatter/` and `chapters/` folders automatically.

## Data Model Example

Documentation for a data model with entities organized by category.

<!-- bespoke diagram: edit diagrams/data-model-example.mmd or .hints.json, then: npx pict-renderer-graph build modules/utility/indoctrinate/docs/examples -->
![Data Model Example](diagrams/data-model-example.svg)

This demonstrates how Indoctrinate catalogs JSON data models alongside markdown documentation, with labels that distinguish entities, abstractions, and platform documentation.

## Document Example

A simple document with an introduction and body.

<!-- bespoke diagram: edit diagrams/document-example.mmd or .hints.json, then: npx pict-renderer-graph build modules/utility/indoctrinate/docs/examples -->
![Document Example](diagrams/document-example.svg)

## Monorepo Example

Demonstrates the `indoctrinate-extrafolders.json` directive for scanning multiple directories.

```
examples/monorepo/
└── indoctrinate-extrafolders.json
```

## Running Examples

Compile any example:

```bash
npx indoctrinate compile -d ./docs/examples/book -c
```

Inspect the generated catalog to see how labels, structures, and content are organized.
