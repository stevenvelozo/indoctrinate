# Examples

Indoctrinate includes several example projects demonstrating different use cases.

## Book Example

A multi-chapter book with front matter, chapters organized by number, and vocabulary definitions.

```
examples/book/
├── indoctrinate-structure.json    ← Structure definition for a book
├── frontmatter/
│   ├── Foreward.md
│   └── Fish-Clipart.png
├── chapters/
│   ├── 01/000-Fish.md
│   ├── 02/000-FreshwaterFish.md
│   ├── 02/Salmon.md
│   ├── 03/000-SaltwaterFish.md
│   ├── 04/000-FishThatWorkInBoth.md
│   ├── 05/000-FishAsFood.md
│   └── 06/000-FishAsFriends.md
├── README.md
└── Vocabulary.md
```

The structure file defines sections with label filters that select content from the `frontmatter/` and `chapters/` folders automatically.

## Data Model Example

Documentation for a data model with entities organized by category.

```
examples/data_model/
├── indoctrinate.json
├── Platform.md
└── model/
    ├── MeadowModel-Extended.json
    ├── entity/
    │   ├── animals/
    │   │   ├── Author.md
    │   │   └── Cat.md
    │   └── clinics/
    │       ├── Book.md
    │       └── Vet.md
    └── entity_abstractions/
        └── animals.md
```

This demonstrates how Indoctrinate catalogs JSON data models alongside markdown documentation, with labels that distinguish entities, abstractions, and platform documentation.

## Document Example

A simple document with an introduction and body.

```
examples/document/
├── indoctrinate.json
├── Introduction.md
└── Body.md
```

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
