# Structures & Targets

Structures and Targets define what content to include in your output and how to format it.

## Structures

A Structure defines the shape of a document: which sections exist, what content goes in each, and how they are ordered.

### Structure Definition

```json
{
    "Hash": "book-structure",
    "Name": "Fish Book",
    "Sections": [
        {
            "Name": "Front Matter",
            "Filters": [
                {
                    "Type": "Label",
                    "Labels": ["frontmatter"],
                    "MatchAll": true,
                    "Sequential": true,
                    "Proximal": true,
                    "OnlySetEnd": true
                }
            ]
        },
        {
            "Name": "Chapters",
            "Filters": [
                {
                    "Type": "Label",
                    "Labels": ["chapters"],
                    "MatchAll": true
                }
            ]
        }
    ]
}
```

### How Structures Work

1. Each section defines a set of filters
2. Filters select content from the catalog
3. Selected content is ordered and passed to formatters
4. Formatters produce output files for each section

### Registering Structures

Structures are registered automatically when `indoctrinate-structure*.json` files are discovered during scanning, or programmatically:

```javascript
fable.IndoctrinateServiceStructure.addStructure({
    Hash: 'my-structure',
    Name: 'My Document',
    Sections: [/* ... */]
});
```

## Targets

A Target defines a specific output format and which structure to use.

### Target Definition

```json
{
    "Hash": "markdown-output",
    "Name": "Markdown Book",
    "Format": "markdown",
    "Structure": "book-structure"
}
```

### How Targets Work

1. Each target references a structure by hash
2. The target specifies the output format
3. The appropriate formatter is selected for the format
4. The structure's sections are rendered through the formatter

### Registering Targets

Targets are registered automatically when `indoctrinate-target*.json` files are discovered during scanning, or programmatically:

```javascript
fable.IndoctrinateServiceTarget.addTarget({
    Hash: 'html-target',
    Name: 'HTML Output',
    Format: 'html',
    Structure: 'my-structure'
});
```

### Target Filtering

The `--target_filter` CLI option (or `TargetFilter` config) limits output generation to a specific target:

```bash
npx indoctrinate compile --target_filter html-target
```

## Example: Book Project

```
my-book/
├── indoctrinate-structure-book.json
├── indoctrinate-target-markdown.json
├── indoctrinate-target-html.json
├── frontmatter/
│   ├── Foreword.md
│   └── cover.png
└── chapters/
    ├── 01/000-Introduction.md
    ├── 02/000-GettingStarted.md
    └── 03/000-AdvancedTopics.md
```

The structure selects content by label matching:
- Front matter from the `frontmatter/` folder
- Chapters from the `chapters/` folder (recursively)

Two targets produce different formats from the same structure.

## Best Practices

1. **Use hash identifiers** that are descriptive and unique
2. **Match structures to document types** - One structure per kind of document
3. **Use multiple targets** to produce the same document in different formats
4. **Leverage label filters** in sections for automatic content selection
5. **Keep sections ordered** in the structure to control document flow
